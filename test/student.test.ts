import {describe, it} from "@jest/globals";
import {createStudent, getStudent, removeStudent, updateStudent} from "@/api/student";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Student CRUD", () => {
  const firstName = "John";
  const middleName = "M";
  const lastName = "Doe";
  let publicStudentId: string | undefined;

  it("should create a student", async () => {
    await createStudent({
      firstName, middleName, lastName
    }).then(s => {
      expect(s.firstName).toBe(firstName);
      expect(s.middleName).toBe(middleName);
      expect(s.lastName).toBe(lastName);
      expect(s.publicStudentId).toHaveLength(8);
      publicStudentId = s.publicStudentId;
    })
  });

  it("should get the created student", async () => {
    await getStudent(publicStudentId!).then(s => {
      expect(s).toBeDefined();
      expect(s!.firstName).toBe(firstName);
      expect(s!.middleName).toBe(middleName);
      expect(s!.lastName).toBe(lastName);
      expect(s!.publicStudentId).toBe(publicStudentId);
    });
  });

  it('should update the first name', async () => {
    await updateStudent({
      firstName: "Jane",
      middleName,
      lastName,
      publicStudentId: publicStudentId!
    }).then(s => {
      expect(s.firstName).toBe("Jane");
      expect(s.middleName).toBe(middleName);
      expect(s.lastName).toBe(lastName);
      expect(s.publicStudentId).toBe(publicStudentId);
    });
  });

  it('should soft-remove the student', async () => {
    await removeStudent(publicStudentId!).then(r => {
      expect(r).toBe(true);
    });
    await getStudent(publicStudentId!).then(s => {
      expect(s).toBeUndefined();
    });
  });

  it('should throw warning for invalid fields', async () => {
    await expect(() => createStudent({
      firstName: "",
      middleName,
      lastName
    })).rejects.toThrow(/Validation failed/);
    await expect(() => updateStudent({
      firstName: "Jane",
      middleName,
      lastName: "",
      publicStudentId: publicStudentId!
    })).rejects.toThrow(/Validation failed/);
  });
});