'use server';

import connectDB from "@/server/db/mongodb";
import {CourseModel} from "@/server/model/CourseModel";
import {copy, Course} from "@/api/type/course";
import Doc from "@/api/type/doc";

export async function listEnabledCourses() {
  await connectDB();
  const rows: (Course & Doc)[] = await CourseModel.find({enabled: true}).sort({year: -1, semester: 1});
  return rows.map(r => copy(r));
}