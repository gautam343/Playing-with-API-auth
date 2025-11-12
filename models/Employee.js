// models/Employee.js
const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  position: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  salary: { type: Number, required: true, min: 0 }
}, {
  timestamps: true
});

EmployeeSchema.virtual('id').get(function () {
  return this._id.toString();
});

EmployeeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; }
});

module.exports = mongoose.model('Employee', EmployeeSchema);
