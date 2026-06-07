import Resume from '../models/Resume.js';
import { parsePDF } from '../services/parser/pdfParser.js';
import { parseDOCX } from '../services/parser/docxParser.js';
import { extractResumeData } from '../services/parser/resumeExtractor.js';
import path from 'path';
import fs from 'fs';

/**
 * Upload and parse a resume file (PDF/DOCX)
 * POST /api/resumes/upload
 */
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a resume file.');
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let rawText = '';

    // Step 1: Parse content depending on file type
    if (ext === '.pdf') {
      rawText = await parsePDF(filePath);
    } else if (ext === '.docx') {
      rawText = await parseDOCX(filePath);
    } else {
      // Clean up file if validation bypassed
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(400);
      throw new Error('Unsupported file extension. Only PDF and DOCX are allowed.');
    }

    // Step 2: Validate empty content
    if (!rawText || rawText.trim().length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(400);
      throw new Error('The uploaded resume is empty or could not be read.');
    }

    // Step 3: Extract structured fields using LLM parser
    const parsedData = await extractResumeData(rawText);

    // Step 4: Persist in MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      filename: req.file.originalname,
      filePath: req.file.path,
      extractedText: rawText,
      parsedData
    });

    res.status(201).json(resume);
  } catch (error) {
    // If upload fails, make sure uploaded file is cleaned up to prevent leaks
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

/**
 * Fetch all resumes of the logged-in user
 * GET /api/resumes
 */
export const getUserResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch a specific resume by ID
 * GET /api/resumes/:id
 */
export const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      res.status(404);
      throw new Error('Resume not found or access denied.');
    }
    res.json(resume);
  } catch (error) {
    next(error);
  }
};
