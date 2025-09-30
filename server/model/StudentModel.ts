import {Schema, model, models} from 'mongoose';

const StudentSchema = new Schema({
  firstName: {type: String, required: true, minlength: 1, maxlength: 255},
  middleName: {type: String, required: false, minlength: 1, maxlength: 255}, // optional
  lastName: {type: String, required: true, minlength: 1, maxlength: 255},
  publicStudentId: {type: String, required: true, minlength: 1, maxlength: 8, unique: true},
  isDeleted: {type: Date, required: false, default: null},
}, {timestamps: true});

StudentSchema.index({isDeleted: 1});

export const StudentModel = models.Student || model('Student', StudentSchema);
