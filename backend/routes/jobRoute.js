const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const { protectAdmin } = require('../middleware/authMiddleware');

const { scrapeRecentJobs } = require('../services/jobScraperService');

// Phase 2 Preparation: Future routes for managing jobs

// GET all active jobs with query support (domain, location, search)
router.get('/', async (req, res) => {
  try {
    const { domain, location, search } = req.query;
    const filter = { status: 'Active' };

    if (domain && domain !== 'All Domains') {
      if (domain.includes(',')) {
        filter.domain = { $in: domain.split(',').map((d) => d.trim()) };
      } else {
        filter.domain = domain;
      }
    }
    if (location && location !== 'All Locations') {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let jobs = await Job.find(filter).sort({ createdAt: -1 });

    // Auto-seed if database is empty on initial fetch
    if (jobs.length === 0 && !domain && !location && !search) {
      const totalCount = await Job.countDocuments();
      if (totalCount === 0) {
        const initial = scrapeRecentJobs('all');
        const ops = initial.map((j) => ({
          updateOne: {
            filter: j.sourceUrl
              ? { sourceUrl: j.sourceUrl }
              : { companyName: j.companyName, jobTitle: j.jobTitle },
            update: {
              $set: { ...j, status: 'Active' },
              $setOnInsert: { createdAt: new Date() }
            },
            upsert: true
          }
        }));
        await Job.bulkWrite(ops, { ordered: false });
        jobs = await Job.find(filter).sort({ createdAt: -1 });
      }
    }

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// GET or POST /scrape - Trigger automated job scraping with bulkWrite deduplication
const handleScrape = async (req, res) => {
  try {
    const platform = req.query.platform || req.body?.platform || 'all';
    const scrapedList = scrapeRecentJobs(platform);

    if (!scrapedList || scrapedList.length === 0) {
      return res.status(200).json({
        success: true,
        platform,
        count: 0,
        insertedCount: 0,
        upsertedCount: 0,
        modifiedCount: 0,
        matchedCount: 0,
        jobs: []
      });
    }

    const operations = scrapedList.map((job) => {
      const filter = job.sourceUrl
        ? { sourceUrl: job.sourceUrl }
        : { companyName: job.companyName, jobTitle: job.jobTitle };

      return {
        updateOne: {
          filter,
          update: {
            $set: {
              ...job,
              status: 'Active'
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          upsert: true
        }
      };
    });

    const bulkResult = await Job.bulkWrite(operations, { ordered: false });

    const upsertedCount = bulkResult.upsertedCount || 0;
    const modifiedCount = bulkResult.modifiedCount || 0;
    const matchedCount = bulkResult.matchedCount || 0;

    // Fetch the updated/upserted active jobs
    const sourceUrls = scrapedList.map((j) => j.sourceUrl).filter(Boolean);
    const savedJobs = await Job.find({ sourceUrl: { $in: sourceUrls } }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      platform,
      count: scrapedList.length,
      upsertedCount,
      insertedCount: upsertedCount,
      modifiedCount,
      matchedCount,
      jobs: savedJobs && savedJobs.length > 0 ? savedJobs : scrapedList
    });
  } catch (error) {
    console.error('Error scraping jobs:', error);
    res.status(500).json({ message: 'Error scraping jobs', error: error.message });
  }
};

router.get('/scrape', handleScrape);
router.post('/scrape', handleScrape);

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
