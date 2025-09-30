'use server';

import {revalidatePath} from "next/cache";
import connectDB from '@/server/db/mongodb';
import {StudentModel} from '@/server/model/StudentModel';
import {Student, validate, copy} from "@/api/type/student";
import {customRandom, random} from "nanoid";
import {Error} from "mongoose";
import Doc from "@/api/type/doc";
import {MongoServerError} from "mongodb";

export interface CreateProps {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export async function createStudent(props: CreateProps): Promise<Student> {
  await connectDB();
  const payload: Student = {
    ...props,
    publicStudentId: customRandom('1234567890', 8, random)(),
  };
  const validation = validate(payload);
  if (validation.size !== 0) {
    throw new Error('Validation failed: ' + validation);
  }
  let attempts = 5;
  while (attempts-- > 0) {
    try {
      await StudentModel.create(payload);
      revalidatePath('/');
      return payload;
    } catch (e) {
      if (e instanceof MongoServerError && e.code === 11000) {
        payload.publicStudentId = customRandom('1234567890', 8, random)();
      } else {
        throw e;
      }
    }
  }
  throw new Error('Failed to create student after multiple attempts due to ID collisions');
}

export async function getStudent(publicStudentId: string): Promise<Student | undefined> {
  await connectDB();
  const doc: Student & Doc | null = await StudentModel.findOne({publicStudentId, isDeleted: null});
  if (!doc) return undefined;
  return {
    firstName: doc.firstName,
    middleName: doc.middleName || undefined,
    lastName: doc.lastName,
    publicStudentId: doc.publicStudentId,
  };
}

export async function updateStudent(student: Student) {
  await connectDB();
  const validation = validate(student);
  if (validation.size !== 0) {
    throw new Error('Validation failed: ' + validation);
  }
  const updated: Student & Doc | null = await StudentModel.findOneAndUpdate(
    {publicStudentId: student.publicStudentId, isDeleted: null},
    {$set: student},
    {new: true}
  );
  if (!updated) throw new Error('Student not found');
  revalidatePath('/');
  return copy(updated);
}

export async function removeStudent(publicStudentId: string) {
  await connectDB();
  const res = await StudentModel.updateOne(
    {publicStudentId, isDeleted: null},
    {$set: {isDeleted: new Date()}}
  );
  if (res.matchedCount === 0) return false;
  revalidatePath('/');
  return true;
}