import { StorageService } from '@/services/storage.service';
import { AllergySchema, ProfileSchema } from './profile.validation';
import { generateId } from '@/utils/id.utils';
import { validateWithSchema } from '@/utils/validation.utils';

export const ProfileService = {
  async getProfile() {
    return await StorageService.getProfile();
  },

  async saveProfile(profileData) {
    const toSave = {
      id: profileData.id || generateId('prof'),
      name: profileData.name.trim(),
      dob: profileData.dob || null,
      gender: profileData.gender || '',
      bloodGroup: profileData.bloodGroup,
      heightCm: profileData.heightCm ? Number(profileData.heightCm) : null,
      weightKg: profileData.weightKg ? Number(profileData.weightKg) : null,
      allergyIds: profileData.allergyIds || [],
      conditionIds: profileData.conditionIds || [],
      surgeries: profileData.surgeries || [],
      vaccinations: profileData.vaccinations || [],
      familyHistory: profileData.familyHistory || '',
    };
    const validated = validateWithSchema(ProfileSchema, toSave, 'ProfileService');
    await StorageService.saveProfile(validated);
    return validated;
  },

  async getAllergies() {
    return await StorageService.getAllergies();
  },

  async addAllergy(data) {
    const allergies = await StorageService.getAllergies();
    const newAllergy = {
      id: generateId('alg'),
      name: data.name.trim(),
      category: data.category || 'other',
      severity: data.severity || 'mild',
      notes: data.notes || '',
    };
    const validated = validateWithSchema(AllergySchema, newAllergy, 'ProfileService');
    const updated = [validated, ...allergies];
    await StorageService.saveAllergies(updated);

    // Sync allergy ID to profile
    const profile = await StorageService.getProfile();
    if (profile && !profile.allergyIds.includes(validated.id)) {
      profile.allergyIds.push(validated.id);
      await StorageService.saveProfile(profile);
    }

    return validated;
  },

  async updateAllergy(id, partial) {
    const allergies = await StorageService.getAllergies();
    const index = allergies.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updatedItem = { ...allergies[index], ...partial };
    const validated = validateWithSchema(AllergySchema, updatedItem, 'ProfileService');
    allergies[index] = validated;
    await StorageService.saveAllergies(allergies);
    return validated;
  },

  async deleteAllergy(id) {
    const allergies = await StorageService.getAllergies();
    const filtered = allergies.filter((a) => a.id !== id);
    await StorageService.saveAllergies(filtered);

    const profile = await StorageService.getProfile();
    if (profile) {
      profile.allergyIds = profile.allergyIds.filter((aid) => aid !== id);
      await StorageService.saveProfile(profile);
    }
    return true;
  },

  async addSurgery(surgeryName) {
    const profile = await StorageService.getProfile();
    if (!profile) return;
    const clean = surgeryName.trim();
    if (!profile.surgeries.includes(clean)) {
      profile.surgeries.push(clean);
      await StorageService.saveProfile(profile);
    }
    return profile.surgeries;
  },

  async removeSurgery(surgeryName) {
    const profile = await StorageService.getProfile();
    if (!profile) return;
    profile.surgeries = profile.surgeries.filter((s) => s !== surgeryName);
    await StorageService.saveProfile(profile);
    return profile.surgeries;
  },

  async addVaccination(vaccinationName) {
    const profile = await StorageService.getProfile();
    if (!profile) return;
    const clean = vaccinationName.trim();
    if (!profile.vaccinations.includes(clean)) {
      profile.vaccinations.push(clean);
      await StorageService.saveProfile(profile);
    }
    return profile.vaccinations;
  },

  async removeVaccination(vaccinationName) {
    const profile = await StorageService.getProfile();
    if (!profile) return;
    profile.vaccinations = profile.vaccinations.filter((v) => v !== vaccinationName);
    await StorageService.saveProfile(profile);
    return profile.vaccinations;
  },
};
