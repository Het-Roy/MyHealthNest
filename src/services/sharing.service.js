import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { AppError, logServiceError } from '@/utils/error.utils';
import { formatDisplayDate } from '@/utils/date.utils';
import { RECORD_TYPE_LABELS } from '@/types/common.types';

export const SharingService = {
  async generateMedicalSummaryPdf(records = [], profile = null, allergies = []) {
    try {
      const recordsHtml = records
        .map(
          (r, idx) => `
          <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #C9DED9; border-radius: 8px;">
            <h3 style="color: #0F766E; margin: 0 0 6px 0;">${idx + 1}. ${r.title}</h3>
            <p style="margin: 2px 0; font-size: 14px;"><strong>Type:</strong> ${RECORD_TYPE_LABELS[r.type] || r.type} | <strong>Date:</strong> ${formatDisplayDate(r.date)}</p>
            ${r.doctor ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Doctor:</strong> ${r.doctor}</p>` : ''}
            ${r.hospital ? `<p style="margin: 2px 0; font-size: 14px;"><strong>Hospital:</strong> ${r.hospital}</p>` : ''}
            ${r.notes ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #355160;"><em>Notes:</em> ${r.notes}</p>` : ''}
          </div>
        `
        )
        .join('');

      const allergiesHtml =
        allergies.length > 0
          ? `
          <div style="margin-bottom: 20px; padding: 12px; background: #FDECEE; border-left: 4px solid #C92A3B; border-radius: 4px;">
            <h3 style="color: #C92A3B; margin: 0 0 8px 0;">ALLERGIES</h3>
            <ul style="margin: 0; padding-left: 20px;">
              ${allergies
                .map(
                  (a) =>
                    `<li><strong>${a.name}</strong> (${a.severity.toUpperCase()}) - ${a.category}${a.notes ? `: ${a.notes}` : ''}</li>`
                )
                .join('')}
            </ul>
          </div>
        `
          : '';

      const profileHtml = profile
        ? `
        <div style="margin-bottom: 20px; padding: 12px; background: #E8F5F2; border-radius: 8px;">
          <h2 style="color: #0B2A3C; margin: 0 0 8px 0;">Patient: ${profile.name}</h2>
          <p style="margin: 2px 0; font-size: 14px;"><strong>Blood Group:</strong> ${profile.bloodGroup || 'N/A'} | <strong>DOB:</strong> ${profile.dob || 'N/A'}</p>
        </div>
      `
        : '';

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>MyHealthNest Medical Summary</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0B2A3C; }
              h1 { color: #0F766E; margin-bottom: 4px; }
              .footer { margin-top: 32px; font-size: 12px; color: #647C89; border-top: 1px solid #C9DED9; padding-top: 8px; }
            </style>
          </head>
          <body>
            <h1>MyHealthNest Medical Summary</h1>
            <p style="font-size: 12px; color: #647C89; margin-top: 0;">Generated securely from offline vault on ${new Date().toLocaleDateString()}</p>
            ${profileHtml}
            ${allergiesHtml}
            <h2 style="color: #0F766E; border-bottom: 2px solid #0F766E; padding-bottom: 4px;">Medical Records (${records.length})</h2>
            ${recordsHtml || '<p>No records selected.</p>'}
            <div class="footer">
              Confidential medical documentation. Shared directly by patient via MyHealthNest.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      return uri;
    } catch (error) {
      logServiceError('SharingService', 'SHARING_FAILED', error);
      throw new AppError(
        'SHARING_FAILED',
        'Could not generate PDF medical summary.',
        'SharingService'
      );
    }
  },

  async shareFile(fileUri) {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new AppError(
          'SHARING_FAILED',
          'Sharing is not available on this device.',
          'SharingService'
        );
      }
      await Sharing.shareAsync(fileUri);
      return true;
    } catch (error) {
      logServiceError('SharingService', 'SHARING_FAILED', error);
      throw error;
    }
  },
};
