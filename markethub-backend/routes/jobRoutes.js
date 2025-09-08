const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const documentUpload = require('../middleware/documentUpload');
const {
  applyForJob,
  getUserJobApplications,
  getJobApplications,
  updateApplicationStatus,
  getEmployerApplications
} = require('../controllers/jobController');

// Apply for a job (with optional resume upload)
router.post('/apply', auth, documentUpload.single('resume'), applyForJob);

// Get user's job applications
router.get('/applications/user', auth, getUserJobApplications);

// Get applications for a specific job (for employers)
router.get('/:jobId/applications', auth, getJobApplications);

// Update application status (for employers)
router.put('/applications/:applicationId/status', auth, updateApplicationStatus);

// Get employer's received applications
router.get('/applications/employer', auth, getEmployerApplications);

module.exports = router;