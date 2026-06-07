import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import ATSReport from '../models/ATSReport.js';
import ResumeVersion from '../models/ResumeVersion.js';
import ScreeningReport from '../models/ScreeningReport.js';
import { extractJobData } from '../services/parser/jobExtractor.js';
import { calculateATSScore } from '../services/ats/atsScorer.js';
import { calculateIndependentScreening } from '../services/ats/screenScorer.js';
import { generateJobSuggestions } from '../services/ai/generateSuggestions.js';
import { generateInterviewQuestions } from '../services/ai/generateInterviewQuestions.js';
import { generateCareerAdvice } from '../services/ai/generateCareerAdvice.js';
import { rewriteBulletPoint } from '../services/ai/rewriteResume.js';

// Helper to select and rewrite 2 weak points from the resume experiences
const getBulletPointRewrites = async (experienceArray = []) => {
  const weakPhrases = ['built', 'worked', 'helped', 'fixed', 'made', 'created', 'developed', 'managed'];
  const candidatesForRewrite = [];

  // Iterate and find potential sentences
  for (const exp of experienceArray) {
    const desc = exp.description || '';
    // Split sentences
    const sentences = desc.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    for (const sent of sentences) {
      // Look for a short sentence or one containing a weak phrase
      const lower = sent.toLowerCase();
      const hasWeakWord = weakPhrases.some(word => lower.includes(word));
      if (hasWeakWord && sent.split(' ').length < 15) {
        candidatesForRewrite.push(sent);
      }
    }
  }

  // Fallback candidates if resume experience descriptions are empty or don't match criteria
  if (candidatesForRewrite.length === 0) {
    candidatesForRewrite.push('Worked on database.');
    candidatesForRewrite.push('Built a website.');
  }

  // Rewrite up to 2 bullets
  const selected = candidatesForRewrite.slice(0, 2);
  const rewrites = [];

  for (const bullet of selected) {
    const rewritten = await rewriteBulletPoint(bullet);
    rewrites.push({ original: bullet, rewritten });
  }

  return rewrites;
};

/**
 * Perform job analysis, calculate score, and generate recommendations
 * POST /api/ats/analyze
 */
export const analyzeJobAndResume = async (req, res, next) => {
  const { resumeId, jobTitle, jobDescription } = req.body;

  try {
    if (!resumeId || !jobTitle || !jobDescription) {
      res.status(400);
      throw new Error('Please provide resumeId, jobTitle, and jobDescription.');
    }

    // Step 1: Fetch candidate resume
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      res.status(404);
      throw new Error('Resume not found or access denied.');
    }

    // Step 2: Parse Job Description
    const parsedJob = await extractJobData(jobDescription);
    const job = await Job.create({
      userId: req.user._id,
      title: jobTitle,
      description: jobDescription,
      requiredSkills: parsedJob.requiredSkills,
      preferredSkills: parsedJob.preferredSkills,
      experienceRange: parsedJob.experienceRange
    });

    // Step 3: Run programmatic ATS Match Scorer
    const atsScoreResult = calculateATSScore(resume, job);

    // Step 4: Run AI engines in parallel (or sequential for safety)
    const [suggestions, interviewQuestions, careerAdvice, bulletRewrites] = await Promise.all([
      generateJobSuggestions(resume.extractedText, jobDescription, atsScoreResult.missingSkills),
      generateInterviewQuestions(resume.extractedText, jobDescription),
      generateCareerAdvice(atsScoreResult.missingSkills),
      getBulletPointRewrites(resume.parsedData.experience || [])
    ]);

    // Step 5: Save ATS report
    const report = await ATSReport.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobId: job._id,
      atsScore: atsScoreResult.atsScore,
      scoreBreakdown: atsScoreResult.scoreBreakdown,
      missingSkills: atsScoreResult.missingSkills,
      gapAnalysis: atsScoreResult.gapAnalysis,
      suggestions,
      interviewQuestions,
      careerPath: careerAdvice,
      bulletRewrites
    });

    // Step 6: Create ResumeVersion records for tracking
    const versionCount = await ResumeVersion.countDocuments({
      userId: req.user._id,
      jobId: job._id
    });

    const nextVersion = versionCount + 1;
    await ResumeVersion.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobId: job._id,
      versionNumber: nextVersion,
      atsScore: atsScoreResult.atsScore,
      label: `Version ${nextVersion}`
    });

    // Return full structured payload
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all past reports for the logged-in user
 * GET /api/ats/reports
 */
export const getUserReports = async (req, res, next) => {
  try {
    const reports = await ATSReport.find({ userId: req.user._id })
      .populate('resumeId', 'filename')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a single report by ID
 * GET /api/ats/reports/:id
 */
export const getReportById = async (req, res, next) => {
  try {
    const report = await ATSReport.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('jobId');

    if (!report) {
      res.status(404);
      throw new Error('ATS Report not found.');
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch historical version track list for the dashboard charts
 * GET /api/ats/history/:jobId
 */
export const getJobMatchHistory = async (req, res, next) => {
  try {
    const history = await ResumeVersion.find({
      userId: req.user._id,
      jobId: req.params.jobId
    }).sort({ versionNumber: 1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Screen resume independently
 * POST /api/ats/screen
 */
export const screenResume = async (req, res, next) => {
  const { resumeId } = req.body;

  try {
    if (!resumeId) {
      res.status(400);
      throw new Error('Please provide a resumeId.');
    }

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      res.status(404);
      throw new Error('Resume not found or access denied.');
    }

    // Run independent screening evaluation
    const screeningResult = await calculateIndependentScreening(resume);

    // Save report in Database
    const report = await ScreeningReport.create({
      userId: req.user._id,
      resumeId: resume._id,
      qualityScore: screeningResult.qualityScore,
      atsReadinessScore: screeningResult.atsReadinessScore,
      healthBreakdown: screeningResult.healthBreakdown,
      strengths: screeningResult.strengths,
      weaknesses: screeningResult.weaknesses,
      improvementSuggestions: screeningResult.improvementSuggestions,
      atsRisks: screeningResult.atsRisks,
      improvementForecast: screeningResult.improvementForecast
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all independent screening reports of the logged-in user
 * GET /api/ats/screenings
 */
export const getScreeningReports = async (req, res, next) => {
  try {
    const reports = await ScreeningReport.find({ userId: req.user._id })
      .populate('resumeId', 'filename')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a specific independent screening report by ID
 * GET /api/ats/screenings/:id
 */
export const getScreeningReportById = async (req, res, next) => {
  try {
    const report = await ScreeningReport.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId');

    if (!report) {
      res.status(404);
      throw new Error('Screening Report not found or access denied.');
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};
