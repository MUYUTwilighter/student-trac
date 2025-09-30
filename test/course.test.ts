import {describe, expect, it} from "@jest/globals";
import {listEnabledCourses} from "@/api/course";

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Course CRUD", () => {
  it("should list the courses", async () => {
    await listEnabledCourses().then(courses => {
      const c001 = courses.find(c => c.publicCourseId === 'EX001');
      const c002 = courses.find(c => c.publicCourseId === 'EX002');
      const c003 = courses.find(c => c.publicCourseId === 'EX003');
      expect(c001).toBeDefined();
      expect(c002).toBeDefined();
      expect(c003).toBeUndefined();
    });
  });
});