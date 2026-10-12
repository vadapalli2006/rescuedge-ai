export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMetadata(name: string): ValidationResult {
  const errors: string[] = [];

  // Rule 1: Name length check
  if (!name || name.trim().length < 3) {
    errors.push('Metadata name must be at least 3 characters long.');
  }

  // Rule 2: Allowed naming conventions (no spaces or special chars except underscores)
  const nameRegex = /^[a-zA-Z0-9_]+$/;
  if (!nameRegex.test(name)) {
    errors.push('Metadata name can only contain letters, numbers, and underscores.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}