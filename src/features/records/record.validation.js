import { z } from 'zod';
import { RECORD_TYPES } from '../../types/common.types.js';

export const MedicalRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Record title is required.'),
  type: z.enum(RECORD_TYPES),
  date: z.string().min(1, 'Record date is required.'),
  doctor: z.string().optional(),
  hospital: z.string().optional(),
  conditionId: z.string().nullable().optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one document image is required.'),
  createdAt: z.string(),
  updatedAt: z.string(),
});
