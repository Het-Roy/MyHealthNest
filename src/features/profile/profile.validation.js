import { z } from 'zod';

export const BloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  dob: z.string().nullable().optional(),
  gender: z.string().optional(),
  bloodGroup: z.string().min(1, 'Blood group is required.'),
  heightCm: z.number().nullable().optional(),
  weightKg: z.number().nullable().optional(),
  allergyIds: z.array(z.string()).default([]),
  conditionIds: z.array(z.string()).default([]),
  surgeries: z.array(z.string()).default([]),
  vaccinations: z.array(z.string()).default([]),
  familyHistory: z.string().optional(),
});

export const AllergySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Allergy name is required.'),
  category: z.enum(['drug', 'food', 'other']),
  severity: z.enum(['mild', 'moderate', 'severe']),
  notes: z.string().optional(),
});
