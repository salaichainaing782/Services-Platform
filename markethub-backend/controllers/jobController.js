const JobApplication = require('../models/JobApplication');
const Product = require('../models/products/productModel');
const User = require('../models/users/userModel');
const cloudinary = require('../config/cloudinary');

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter, expectedSalary, availableStartDate } = req.body;
    const applicantId = req.user.id;

    // Validate job exists and is a job posting
    const job = await Product.findById(jobId).populate('seller');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.category !== 'jobs') {
      return res.status(400).json({ message: 'This is not a job posting' });
    }

    // Check if user already applied for this job
    const existingApplication = await JobApplication.findOne({
      jobId,
      applicantId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application data
    const applicationData = {
      jobId,
      applicantId,
      employerId: job.seller._id,
      coverLetter,
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : undefined,
      availableStartDate: availableStartDate ? new Date(availableStartDate) : undefined
    };

    // Handle resume upload if provided
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'resumes',
              public_id: `resume_${applicantId}_${Date.now()}`,
              timeout: 60000
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(req.file.buffer);
        });
        
        applicationData.resume = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Resume upload error:', uploadError);
        // Continue without resume if upload fails
        console.log('Continuing application without resume due to upload failure');
      }
    }

    // Create the application
    const application = new JobApplication(applicationData);
    await application.save();

    // Populate the application with job and applicant details
    await application.populate([
      { path: 'jobId', select: 'title location salary' },
      { path: 'applicantId', select: 'firstName lastName email phone' }
    ]);

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: application._id,
      application
    });

  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
};

// Get user's job applications
const getUserJobApplications = async (req, res) => {
  try {
    const applicantId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const applications = await JobApplication.find({ applicantId })
      .populate({
        path: 'jobId',
        select: 'title location salary jobType experience seller',
        populate: {
          path: 'seller',
          select: 'firstName lastName'
        }
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await JobApplication.countDocuments({ applicantId });

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Get applications for a specific job (for employers)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.id;

    // Verify the job belongs to the employer
    const job = await Product.findOne({ _id: jobId, seller: employerId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const applications = await JobApplication.find({ jobId })
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email phone avatar'
      })
      .sort({ appliedAt: -1 });

    res.json({ applications });

  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

// Update application status (for employers)
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, employerNotes } = req.body;
    const employerId = req.user.id;

    // Find application and verify employer owns the job
    const application = await JobApplication.findById(applicationId)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.employerId.toString() !== employerId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update application
    application.status = status;
    if (employerNotes) {
      application.employerNotes = employerNotes;
    }

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
};

// Get employer's received applications
const getEmployerApplications = async (req, res) => {
  try {
    const employerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = { employerId };
    if (status) {
      filter.status = status;
    }

    const applications = await JobApplication.find(filter)
      .populate({
        path: 'jobId',
        select: 'title location salary'
      })
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email phone avatar'
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await JobApplication.countDocuments(filter);

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

module.exports = {
  applyForJob,
  getUserJobApplications,
  getJobApplications,
  updateApplicationStatus,
  getEmployerApplications
};