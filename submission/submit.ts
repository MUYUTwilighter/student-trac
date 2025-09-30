import packageJson from '../package.json';
import * as fs from "node:fs";
import "dotenv/config";

const PROJ_NAME = packageJson.name;
const PROJ_TITLE = process.env.PROJ_TITLE ?? PROJ_NAME.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
const PROJ_DESC = process.env.PROJ_DESC ?? "Example Project Description";
const HW_NAME = process.env.HW_NAME ?? 'Homework';
const HW_SQUEEZE = process.env.HW_SQUEEZE ?? "HW";
const COURSE_NAME = process.env.COURSE_NAME ?? "Course Name";
const COURSE_CODE = process.env.COURSE_CODE ?? "CC101";
const STUDENT_NAME = process.env.STUDENT_NAME ?? "Student Name";
const STUDENT_EMAIL = process.env.STUDENT_EMAIL ?? "student@example.com";
const STUDENT_MAILTO = process.env.STUDENT_MAILTO ?? "mailto:" + STUDENT_EMAIL;

function replace(content: string): string {
  return content
    .replace(/{\s*PROJ_NAME\s*}/g, PROJ_NAME)
    .replace(/{\s*PROJ_TITLE\s*}/g, PROJ_TITLE)
    .replace(/{\s*PROJ_DESC\s*}/g, PROJ_DESC)
    .replace(/{\s*HW_NAME\s*}/g, HW_NAME)
    .replace(/{\s*HW_SQUEEZE\s*}/g, HW_SQUEEZE)
    .replace(/{\s*COURSE_NAME\s*}/g, COURSE_NAME)
    .replace(/{\s*COURSE_CODE\s*}/g, COURSE_CODE)
    .replace(/{\s*STUDENT_NAME\s*}/g, STUDENT_NAME)
    .replace(/{\s*STUDENT_EMAIL\s*}/g, STUDENT_EMAIL)
    .replace(/{\s*STUDENT_MAILTO\s*}/g, STUDENT_MAILTO);
}

function replaceFile(inputPath: string, outputPath: string) {
  const content = fs.readFileSync(inputPath, "utf-8");
  const replacedContent = replace(content);
  const parent = outputPath.slice(0, outputPath.lastIndexOf("/"));
  if (parent && !fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
  fs.writeFileSync(outputPath, replacedContent, "utf-8");
}

console.log("=== Generation Info ===");
console.log(`- Project: ${PROJ_TITLE} (${PROJ_NAME})`);
console.log(`- Assignment: ${HW_NAME} (${HW_SQUEEZE})`);
console.log(`- Course: ${COURSE_NAME} (${COURSE_CODE})`);
console.log(`- Student: ${STUDENT_NAME} <${STUDENT_EMAIL}>`);

console.log("");

console.log("Handling metadata");
replaceFile("submission/metadata.ts", "app/metadata.ts");

console.log("Handling README");
replaceFile("submission/README.md", "README.md");

console.log("Generating submission");
replaceFile("submission/submission.html", `submission/out/${COURSE_CODE}-${HW_SQUEEZE}-${PROJ_NAME}-${STUDENT_NAME}.html`);
