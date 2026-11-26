export const CURRENT_SCHEMA_VERSION = 1;

export async function runMigrations(metadata, storageService) {
  if (!metadata) return metadata;

  let currentVersion = metadata.schemaVersion || 0;

  if (currentVersion < 1) {
    // Migration to schema version 1
    metadata.schemaVersion = 1;
    if (!metadata.emergencyCardConfig) {
      metadata.emergencyCardConfig = {
        showName: true,
        showBloodGroup: true,
        showAllergies: true,
        showConditions: true,
        showPrimaryContact: true,
      };
    }
    if (!Array.isArray(metadata.recentDoctors)) metadata.recentDoctors = [];
    if (!Array.isArray(metadata.recentHospitals)) metadata.recentHospitals = [];
    if (!Array.isArray(metadata.pendingCleanupRecordIds)) {
      metadata.pendingCleanupRecordIds = [];
    }
    await storageService.saveMetadata(metadata);
  }

  return metadata;
}
