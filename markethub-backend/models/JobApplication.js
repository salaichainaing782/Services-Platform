const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: true,
    maxlength: 2000
  },
  resume: {
    type: String, // URL to uploaded resume file
  },
  expectedSalary: {
    type: Number,
    min: 0
  },
  availableStartDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  employerNotes: {
    type: String,
    maxlength: 1000
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
jobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications
jobApplicationSchema.index({ employerId: 1, status: 1 });
jobApplicationSchema.index({ applicantId: 1 });
jobApplicationSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);