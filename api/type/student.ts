export interface Student {
  firstName: string;
  middleName?: string;
  lastName: string;
  publicStudentId: string;
}

export function validate(student: Student) {
  const errors: Map<string, string> = new Map();
  if (student.firstName.length < 1 || student.firstName.length > 255) {
    errors.set('firstName', 'First name must be between 1 and 255 characters.');
  }
  if (student.middleName !== undefined && (student.middleName.length < 1 || student.middleName.length > 255)) {
    errors.set('middleName', 'Middle name must be between 1 and 255 characters if provided.');
  }
  if (student.lastName.length < 1 || student.lastName.length > 255) {
    errors.set('lastName', 'Last name must be between 1 and 255 characters.');
  }
  return errors;
}

/**
 * Copy a Student object, excluding any extraneous properties. <br/>
 *
 * Used to remove Mongoose-specific properties when returning database objects from API functions.
 */
export function copy(student: Student) {
  return {
    firstName: student.firstName,
    middleName: student.middleName,
    lastName: student.lastName,
    publicStudentId: student.publicStudentId,
  }
}