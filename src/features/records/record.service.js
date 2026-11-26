import { StorageService } from '@/services/storage.service';
import { MedicalRecordSchema } from './record.validation';
import { generateId } from '@/utils/id.utils';
import { toISODate } from '@/utils/date.utils';
import { validateWithSchema } from '@/utils/validation.utils';

export const RecordService = {
  async getRecords() {
    return await StorageService.getRecords();
  },

  async getRecordById(id) {
    const records = await StorageService.getRecords();
    return records.find((r) => r.id === id) || null;
  },

  async createRecord(input) {
    const recordId = generateId('rec');

    // 1. Copy selected temporary images to private record directory
    const savedImagePaths = await StorageService.persistRecordImages(
      recordId,
      input.images
    );

    const now = new Date().toISOString();
    const recordData = {
      id: recordId,
      title: input.title.trim(),
      type: input.type,
      date: input.date || toISODate(),
      doctor: input.doctor ? input.doctor.trim() : '',
      hospital: input.hospital ? input.hospital.trim() : '',
      conditionId: input.conditionId || null,
      notes: input.notes ? input.notes.trim() : '',
      images: savedImagePaths,
      createdAt: now,
      updatedAt: now,
    };

    const validated = validateWithSchema(
      MedicalRecordSchema,
      recordData,
      'RecordService'
    );

    // 2. Persist record in records.json
    const records = await StorageService.getRecords();
    const updatedRecords = [validated, ...records];
    await StorageService.saveRecords(updatedRecords);

    // 3. Update metadata (recent doctors, hospitals, lastConditionId)
    const metadata = await StorageService.getMetadata();
    const recentDoctors = [...(metadata.recentDoctors || [])];
    const recentHospitals = [...(metadata.recentHospitals || [])];

    if (validated.doctor && !recentDoctors.includes(validated.doctor)) {
      recentDoctors.unshift(validated.doctor);
      if (recentDoctors.length > 5) recentDoctors.pop();
    }
    if (validated.hospital && !recentHospitals.includes(validated.hospital)) {
      recentHospitals.unshift(validated.hospital);
      if (recentHospitals.length > 5) recentHospitals.pop();
    }

    await StorageService.saveMetadata({
      ...metadata,
      recentDoctors,
      recentHospitals,
      lastConditionId: validated.conditionId || metadata.lastConditionId,
    });

    return validated;
  },

  async updateRecord(id, partial) {
    const records = await StorageService.getRecords();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const existing = records[index];
    let images = existing.images;

    // If new images provided
    if (partial.images && partial.images !== existing.images) {
      // If some images are new temp uris, copy them
      const persistedImages = [];
      for (let i = 0; i < partial.images.length; i++) {
        const uri = partial.images[i];
        if (uri.startsWith('file://') && uri.includes('/records/')) {
          persistedImages.push(uri);
        } else {
          // copy new image
          const saved = await StorageService.persistRecordImages(id, [uri]);
          persistedImages.push(saved[0]);
        }
      }
      images = persistedImages;
    }

    const updated = {
      ...existing,
      ...partial,
      images,
      updatedAt: new Date().toISOString(),
    };

    const validated = validateWithSchema(
      MedicalRecordSchema,
      updated,
      'RecordService'
    );
    records[index] = validated;
    await StorageService.saveRecords(records);
    return validated;
  },

  async deleteRecord(id) {
    // 1. Remove from JSON
    const records = await StorageService.getRecords();
    const filtered = records.filter((r) => r.id !== id);
    await StorageService.saveRecords(filtered);

    // 2. Delete image files from disk
    await StorageService.deleteRecordStorage(id);
    return true;
  },
};
