const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const { protectAdmin } = require('../middleware/authMiddleware');

// Phase 2 Preparation: Future routes for managing jobs

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// GET a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

// POST a new job
router.post('/', protectAdmin, async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    res.status(400).json({ message: 'Error creating job', error: error.message });
  }
});

// PUT update an existing job
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(400).json({ message: 'Error updating job', error: error.message });
  }
});

// DELETE a job
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
});

module.exports = router;
