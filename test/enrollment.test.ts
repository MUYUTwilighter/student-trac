import {describe, expect, it} from "@jest/globals";
import {createStudent, getStudent} from "@/api/student";
import {drop, enroll, listEnrolled} from "@/api/enrollment";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Enrollment CRUD", () => {
  const firstName = "John";
  const middleName = "Q";
  const lastName = "Public";
  let publicStudentId: string | undefined = undefined;

  it("should create the student for testing", async () => {
    await createStudent({firstName, middleName, lastName}).then(student => {
      publicStudentId = student.publicStudentId;
    });
    await getStudent(publicStudentId!).then(s => {
      expect(s).toBeDefined();
      expect(s!.firstName).toBe(firstName);
      expect(s!.middleName).toBe(middleName);
      expect(s!.lastName).toBe(lastName);
      expect(s!.publicStudentId).toBeDefined();
    });
  });

  it('should enroll a course for the student', async () => {
    await expect(enroll(publicStudentId!, 'EX001').then(e => e.dateEnrolled)).resolves.toBeDefined();
  });

  it('should not enroll duplicated courses', () => {
    return expect(enroll(publicStudentId!, 'EX001')).rejects.toThrow('Already enrolled');
  });

  it('should not enroll a course that is not yet open', async () => {
    await expect(enroll(publicStudentId!, 'EX003')).rejects.toThrow('Course not found');
  });

  it('should list all the enrollments for the student', async () => {
    await listEnrolled(publicStudentId!).then(enrollments => {
      expect(enrollments.length).toBeGreaterThan(0);
      expect(enrollments.find(e => e.publicCourseId === 'EX001')).toBeDefined();
      expect(enrollments.find(e => e.publicCourseId === 'EX002')).toBeUndefined();
    });
  });

  it('should drop the enrollments for the student', async () => {
    await expect(drop(publicStudentId!, 'EX001')).resolves.toBeUndefined();
    await listEnrolled(publicStudentId!).then(enrollments => {
      expect(enrollments.find(e => e.publicCourseId === 'EX001')).toBeUndefined();
      expect(enrollments.find(e => e.publicCourseId === 'EX002')).toBeUndefined();
    });
  });
});