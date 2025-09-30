import {Schema, model, models, Types} from 'mongoose';

const EnrollmentSchema = new Schema({
  student: {type: Types.ObjectId, ref: 'Student', required: true},
  course: {type: Types.ObjectId, ref: 'Course', required: true},
  GPA: {type: Types.Decimal128, required: false},
  dateEnrolled: {type: Date, required: true},
}, {timestamps: true});

EnrollmentSchema.index({student: 1, course: 1}, {unique: true});
EnrollmentSchema.index({student: 1, dateEnrolled: -1});
EnrollmentSchema.index({course: 1});

export const EnrollmentModel = models.Enrollment || model('Enrollment', EnrollmentSchema);
