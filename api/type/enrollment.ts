export interface EnrollmentPublic {
  GPA?: number;
  dateEnrolled: Date;
}

export function copy(enrollment: EnrollmentPublic) {
  return {
    GPA: enrollment.GPA,
    dateEnrolled: enrollment.dateEnrolled,
  }
}