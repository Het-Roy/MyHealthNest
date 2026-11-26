export const RECORD_TYPES = [
  'prescription',
  'lab-report',
  'scan',
  'bill',
  'vaccination',
  'other',
];

export const RECORD_TYPE_LABELS = {
  prescription: 'Prescription',
  'lab-report': 'Lab Report',
  scan: 'Scan / Imaging',
  bill: 'Medical Bill',
  vaccination: 'Vaccination',
  other: 'Other Record',
};

export const ALLERGY_CATEGORIES = ['drug', 'food', 'other'];
export const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe'];

export const RELATIONSHIPS = [
  'Father',
  'Mother',
  'Spouse',
  'Child',
  'Relative',
  'Family Doctor',
  'Other',
];

export const DEFAULT_SETTINGS = {
  autoLockSeconds: 30,
  theme: 'system',
  notificationsEnabled: true,
  biometricEnabled: true,
};

export const DEFAULT_EMERGENCY_CONFIG = {
  showName: true,
  showBloodGroup: true,
  showAllergies: true,
  showConditions: true,
  showPrimaryContact: true,
};

export const DEFAULT_METADATA = {
  schemaVersion: 1,
  onboardingCompleted: false,
  lastConditionId: null,
  recentDoctors: [],
  recentHospitals: [],
  pendingCleanupRecordIds: [],
  emergencyCardConfig: DEFAULT_EMERGENCY_CONFIG,
};
