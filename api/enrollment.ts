'use server';

import connectDB from "@/server/db/mongodb";
import {StudentModel} from "@/server/model/StudentModel";
import {EnrollmentModel} from "@/server/model/EnrollmentModel";
import {CourseModel} from "@/server/model/CourseModel";
import {Student} from "@/api/type/student";
import Doc from "@/api/type/doc";
import {copy as copyCourse, Course} from "@/api/type/course";
import {EnrollmentPublic, copy as copyEnrollment} from "@/api/type/enrollment";
import {MongoServerError} from "mongodb";

export async function listEnrolled(publicStudentId: string): Promise<(Course & EnrollmentPublic)[]> {
  await connectDB();
  // Find Student ID
  const stu : Doc | null = await StudentModel.findOne({publicStudentId, isDeleted: null}).select('_id');
  if (!stu) throw new Error('Student not found');
  // Find Enrollments
  const enrollments = await EnrollmentModel.find({student: stu._id}).sort({dateEnrolled: -1});
  const courseIds = enrollments.map((e) => e.course);
  // Find Courses
  const courses: (Course & Doc)[] = await CourseModel.find({_id: {$in: courseIds}, enabled: true});
  const courseMap = new Map(courses.map(c => [c._id.toString(), c]));
  return enrollments
    .filter((e) => courseMap.has(e.course.toString()))
    .map((e) => ({
      ...copyCourse(courseMap.get(e.course.toString())!),
      GPA: e.GPA || undefined,
      dateEnrolled: e.dateEnrolled,
    }));
}

export async function enroll(publicStudentId: string, publicCourseId: string): Promise<Course & EnrollmentPublic> {
  await connectDB();
  // Find Student ID
  const stu: (Student & Doc) | null = await StudentModel.findOne({publicStudentId, isDeleted: null});
  if (!stu) throw new Error('Student not found');
  // Find Course ID
  const course: (Course & Doc) | null = await CourseModel.findOne({publicCourseId, enabled: true});
  if (!course) throw new Error('Course not found');
  // Enroll
  try {
    const enrollment: EnrollmentPublic = await EnrollmentModel.create({
      student: stu._id,
      course: course._id,
      dateEnrolled: new Date(),
    });
    return {...copyEnrollment(enrollment), ...copyCourse(course)};
  } catch (e) {
    if (e instanceof MongoServerError && e.code === 11000) {
      throw new Error('Already enrolled');
    }
    throw e;
  }
}

export async function drop(publicStudentId: string, publicCourseId: string): Promise<void> {
  await connectDB();
  // Find Student ID
  const stu: (Student & Doc) | null = await StudentModel.findOne({publicStudentId, isDeleted: null});
  if (!stu) throw new Error('Student not found');
  // Find Course ID
  const course: (Course & Doc) | null = await CourseModel.findOne({publicCourseId, enabled: true});
  if (!course) throw new Error('Course not found');
  // Drop Enrollment
  const res = await EnrollmentModel.deleteOne({student: stu._id, course: course._id});
  if (res.deletedCount === 0) throw new Error('Enrollment not found');
}