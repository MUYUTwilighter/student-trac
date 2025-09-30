import mongoose from 'mongoose';
import {CourseModel} from "@/server/model/CourseModel";

declare global {
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export default async function connectDB(): Promise<typeof mongoose> {
  if (global._mongooseConn) return global._mongooseConn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');

  mongoose.set('strictQuery', true);

  global._mongooseConn = mongoose.connect(uri, {
    autoIndex: true,
  });

  /* Create test instances for demonstration */
  await CourseModel.init(); // Ensure indexes are created
  await CourseModel.create({publicCourseId: 'EX001', courseName: 'Example Course 001', semester: 'Fall', year: 2025, enabled: true}).catch(() => {});
  await CourseModel.create({publicCourseId: 'EX002', courseName: 'Example Course 002', semester: 'Fall', year: 2025, enabled: true}).catch(() => {});
  await CourseModel.create({publicCourseId: 'EX003', courseName: 'Example Course 003', semester: 'Spring', year: 2026, enabled: false}).catch(() => {});

  return global._mongooseConn;
}
