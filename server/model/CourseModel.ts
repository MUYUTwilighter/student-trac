import { Schema, model, models } from 'mongoose';

const CourseSchema = new Schema({
  publicCourseId: { type: String, required: true, minlength: 1, maxlength: 10, unique: true },
  courseName: { type: String, required: true, minlength: 1, maxlength: 512 },
  semester: { type: String, required: true, minlength: 1, maxlength: 48 },
  year: { type: Number, required: true },
  enabled: { type: Boolean, required: true, default: false },
}, { timestamps: true });

CourseSchema.index({ enabled: 1, year: -1, semester: 1 });

export const CourseModel = models.Course || model('Course', CourseSchema);