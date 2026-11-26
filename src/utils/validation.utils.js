import { AppError } from './error.utils';

export function validateWithSchema(schema, data, service) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message || 'Invalid input data.';
    throw new AppError('VALIDATION_FAILED', message, service);
  }
  return result.data;
}

export function getFieldErrors(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return {};
  const errors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
