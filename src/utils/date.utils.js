const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const MONTHS_FULL = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

export function toISODate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function parseISODate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDisplayDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return isoDate || '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDayMonth(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return isoDate || '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT[date.getMonth()];
  return `${day} ${month}`;
}

export function formatMonthYear(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return 'UNKNOWN';
  return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

export function calculateAge(dob, referenceDate = new Date()) {
  if (!dob) return null;
  const birth = parseISODate(dob);
  if (!birth) return null;
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function addDaysToISO(isoDate, days) {
  const date = parseISODate(isoDate) ?? new Date();
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return toISODate(next);
}

export function isValidISODate(value) {
  if (!value || typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) return false;
  return parseISODate(value) !== null;
}
