export interface Course {
  publicCourseId: string,
  courseName: string,
  semester: string,
  year: number,
  enabled: boolean
}

export function copy(course: Course) {
  return {
    publicCourseId: course.publicCourseId,
    courseName: course.courseName,
    semester: course.semester,
    year: course.year,
    enabled: course.enabled
  }
}