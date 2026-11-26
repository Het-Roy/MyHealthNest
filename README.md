# MyHealthNest

**Your Health. Your History. Your Safe Space.**

MyHealthNest is an offline-first personal medical record management mobile application built with React Native and Expo (using pure JavaScript and JSX). It empowers users to store, organize, manage, and selectively share their medical records and health history directly from their mobile devices, without depending on external cloud servers or databases.

---

## 1. Features Overview

- **Splash & Initialization:** Automated local document directory initialization, schema migrations, and route orchestration.
- **Onboarding & Profile Setup:** Guided introduction explaining Capture, Organize, and Share; setup for personal health profile including blood group, age, and vitals.
- **Biometric Vault Authentication:** Native Face ID / Fingerprint protection with automatic background timeout lock (configurable auto-lock).
- **Medical Document Capture:**
  - In-app document scanner with live camera preview, torch control, and visual alignment guides.
  - Multi-page photo library selection.
  - Multi-page preview with reordering and removal.
- **Medical Record Management (CRUD):**
  - Record types: Prescriptions, Lab Reports, Imaging Scans, Medical Bills, Vaccinations, and Other.
  - Smart defaults: Auto-suggests recent doctors, hospitals, and previous diagnoses.
  - Full-screen high-resolution image viewer with pinch-to-zoom.
  - Editing and safe deletion with complete image file cleanup.
- **Chronological Timeline:**
  - Descending date sorting grouped by Month and Year (e.g. `NOVEMBER 2026`).
  - Multi-attribute search (title, doctor, hospital, condition, record type).
  - Filter chips for fast record categorization.
- **Conditions Management:**
  - Group medical records under custom chronic conditions (e.g. Diabetes, Hypertension, Thyroid).
  - Deleting conditions safely unlinks records without destroying historical documents.
- **Complete Health Profile:**
  - Personal health metadata (Age, Blood Group, Height, Weight).
  - Prominent allergy management with red alert severity indicators.
  - Surgical history tracking and vaccination log.
- **Emergency Contacts:**
  - Manual entry or direct import from device contacts via `expo-contacts`.
  - Designated primary emergency contact with one-tap calling.
- **Doctor Mode (Signature Feature):**
  - Biometrically gated, read-only clinical summary.
  - Strict display order: Patient Header -> Allergies -> Active Medications -> Chronic Conditions -> 5 Most Recent Reports -> Primary Emergency Contact.
  - Read-only restrictions: Editing, deleting, and unauthorized navigation are locked.
  - Android hardware back button is intercepted: Re-authentication is required to return to the vault.
- **Selective Sharing & PDF Generation:**
  - User chooses which records to export.
  - Optional inclusion of health profile and allergy summary.
  - Generates a PDF summary using `expo-print` and shares via the native system share sheet (`expo-sharing`).
  - Privacy confirmation warning before files leave the vault.
- **Emergency Card:**
  - Dedicated access route viewable without full vault unlocking for first responders.
  - Custom visibility controls per health attribute.
  - Clear warning during setup that information is accessible without biometric lock.
- **Medicines & Reminders:**
  - Daily dosage schedules with custom reminder times.
  - Follow-up appointment and recurring lab test reminders.
  - Privacy-safe, generic notification alerts that never expose diagnoses on lock screens.
- **Settings & Security:**
  - Biometric lock toggle and auto-lock duration selection (15s, 30s, 1m, 5m).
  - Notification preference switches.
  - Appearance modes: Light, Dark, System.
  - Full local JSON backup export.
  - Authenticated "Delete All Data" feature that wipes document storage, cancels notifications, and resets state.

---

## 2. Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React Native** | Mobile application platform |
| **Expo SDK 58** | Native device APIs, camera, and file system |
| **Language** | JavaScript & JSX (`.js`, `.jsx`) |
| **Expo Router** | File-based routing & navigation |
| **Zustand** | In-memory reactive state management |
| **Zod** | Schema validation and data integrity |
| **Expo FileSystem** | Object-oriented persistent document file storage |
| **Expo LocalAuthentication** | Biometric security (Face ID & Fingerprint) |
| **Expo Notifications** | Local scheduled dosage & follow-up reminders |
| **Expo Print & Sharing** | PDF report generation & native share sheet |
| **Lucide React Native** | Consistent vector iconography |

---

## 3. Architecture & Strict Separation of Responsibilities

The application follows an offline-first, service-oriented architecture:

```text
SCREEN (UI & Navigation)
  │
  ▼
COMPONENT (Reusable UI & Feedback)
  │
  ▼
ZUSTAND STORE (In-Memory State)
  │
  ▼
SERVICE (Business Logic & Validation)
  │
  ▼
REPOSITORY / NATIVE API (File/JSON Operations)
  │
  ▼
DEVICE STORAGE (Private Document Directory)
```

### Storage Organization

All medical files are saved inside the application's persistent private document directory:

```text
DOCUMENT DIRECTORY/
├── data/
│   ├── metadata.json
│   ├── settings.json
│   ├── profile.json
│   ├── allergies.json
│   ├── records.json
│   ├── conditions.json
│   ├── medicines.json
│   ├── contacts.json
│   └── reminders.json
├── records/
│   ├── rec-xxx-1/
│   │   ├── page-1.jpg
│   │   └── page-2.jpg
│   └── rec-xxx-2/
│       └── page-1.jpg
└── exports/
```

- Writes are atomic with backup recovery (`.bak` files).
- Deleting records removes the directory and all associated page images.
- Unlinking conditions preserves record data.

---

## 4. Folder Structure

```text
MyHealthNest/
├── app.json
├── jsconfig.json
├── package.json
├── README.md
└── src/
    ├── app/
    │   ├── _layout.jsx
    │   ├── index.jsx
    │   ├── onboarding.jsx
    │   ├── profile-setup.jsx
    │   ├── lock.jsx
    │   ├── doctor-mode.jsx
    │   ├── emergency-card.jsx
    │   ├── reminders.jsx
    │   ├── share.jsx
    │   ├── (tabs)/
    │   │   ├── _layout.jsx
    │   │   ├── index.jsx
    │   │   ├── timeline.jsx
    │   │   ├── add.jsx
    │   │   ├── profile.jsx
    │   │   └── settings.jsx
    │   ├── records/
    │   │   ├── capture.jsx
    │   │   ├── preview.jsx
    │   │   ├── add.jsx
    │   │   └── [id].jsx
    │   ├── conditions/
    │   │   ├── index.jsx
    │   │   └── [id].jsx
    │   └── medicines/
    │       ├── index.jsx
    │       └── add.jsx
    ├── components/
    │   ├── layout/
    │   │   └── ScreenContainer.jsx
    │   └── ui/
    │       ├── Badge.jsx
    │       ├── Button.jsx
    │       ├── Card.jsx
    │       ├── EmptyState.jsx
    │       ├── ErrorBoundary.jsx
    │       ├── Input.jsx
    │       └── Logo.jsx
    ├── features/
    │   ├── conditions/
    │   ├── emergency-contacts/
    │   ├── medicines/
    │   ├── profile/
    │   └── records/
    ├── hooks/
    │   ├── useAppBootstrap.js
    │   ├── useAppLock.js
    │   └── useThemePalette.js
    ├── services/
    │   ├── auth.service.js
    │   ├── notification.service.js
    │   ├── sharing.service.js
    │   └── storage.service.js
    ├── storage/
    │   ├── file.repository.js
    │   ├── json.repository.js
    │   ├── migrations.js
    │   └── paths.js
    ├── store/
    │   ├── app.store.js
    │   └── auth.store.js
    ├── theme/
    │   ├── colors.js
    │   ├── radii.js
    │   ├── spacing.js
    │   └── typography.js
    ├── types/
    │   └── common.types.js
    ├── utils/
    │   ├── date.utils.js
    │   ├── error.utils.js
    │   ├── id.utils.js
    │   └── validation.utils.js
    └── __tests__/
        ├── business-logic.test.js
        └── unit.test.js
```

---

## 5. Official Design System & Color Palette

The exact MyHealthNest official palette is defined in `src/theme/colors.js`:

```javascript
export const colors = {
  white: '#FFFFFF',
  primary: '#0F766E',
  surface: '#E8F5F2',
  text: '#0B2A3C',
  alert: '#C92A3B',
};
```

- **White (`#FFFFFF`):** Cards, inputs, and modal containers.
- **Primary (`#0F766E`):** Primary action buttons, active navigation indicators, and branding accents.
- **Surface (`#E8F5F2`):** Calm background tone and secondary cards.
- **Text (`#0B2A3C`):** High-contrast, readable typography.
- **Alert (`#C92A3B`):** Severe allergy tags, deletion dialogs, and emergency alerts.

---

## 6. Installation & Development Commands

### Prerequisites
- Node.js (v18+)
- npm or bun

### Commands

```bash
# Start development server
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator / device
npm run ios

# Run unit tests
npm test
```

---

## 7. Native Permissions & Build Notes

The application uses the following native permissions configured in `app.json`:

- `android.permission.CAMERA` / `NSCameraUsageDescription`: Scans physical prescriptions and medical reports.
- `android.permission.READ_CONTACTS` / `NSContactsUsageDescription`: Imports designated emergency contacts.
- `android.permission.USE_BIOMETRIC` / `NSFaceIDUsageDescription`: Biometric authentication for vault and Doctor Mode.
- `android.permission.POST_NOTIFICATIONS`: Delivers local dosage and appointment reminders.

### Running with Development Builds
Native modules such as `expo-camera`, `expo-local-authentication`, and `expo-notifications` require a development build on physical devices:

```bash
npx expo run:android
# or
npx expo run:ios
```

---

## 8. Security Limitations & Privacy Principles

1. **Honest Security Disclosure:**
   Medical documents and JSON records are saved inside the application's sandboxed, private document directory (`Paths.document`), which is isolated from other apps by the OS. However, individual image files are not currently encrypted with an individual per-file cipher at rest. Enabling biometric authentication gates application access via the OS authentication layer, but does not equate to hardware-level file-by-file encryption.
2. **Offline Guarantee:**
   No medical data, images, notes, or patient demographics are transmitted to remote servers. All data remains exclusively on the device until the user explicitly shares a report via the native share sheet.
3. **Lock Screen Privacy:**
   All scheduled notification messages use generic phrasing (e.g. *"Time for your scheduled medicine"*), ensuring private diagnostic details are never visible on device lock screens.
#   M y H e a l t h N e s t 
 
 #   M y H e a l t h N e s t 
 
 