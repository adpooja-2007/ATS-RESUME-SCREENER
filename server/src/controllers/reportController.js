import ATSReport from '../models/ATSReport.js';
import User from '../models/User.js';
import { generatePDFReport } from '../services/report/pdfGenerator.js';
import { generateDOCXReport } from '../services/report/docxGenerator.js';
import path from 'path';
import fs from 'fs';

/**
 * Download ATS Report in PDF format
 * GET /api/reports/:id/pdf
 */
export const downloadPDF = async (req, res, next) => {
  try {
    const report = await ATSReport.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('jobId');

    if (!report) {
      res.status(404);
      throw new Error('Report not found.');
    }

    const candidateName = report.resumeId?.parsedData?.name || req.user.name || 'Candidate';
    const jobTitle = report.jobId?.title || 'Target Job';
    
    const reportDir = path.join(process.cwd(), 'generated-reports');
    const filename = `ATS_Report_${report._id}.pdf`;
    const outputPath = path.join(reportDir, filename);

    // Generate PDF
    await generatePDFReport(report, candidateName, jobTitle, outputPath);

    // Send file to client
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('PDF download error:', err.message);
      }
      // Cleanup file after download is finished or failed
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download ATS Report in DOCX format
 * GET /api/reports/:id/docx
 */
export const downloadDOCX = async (req, res, next) => {
  try {
    const report = await ATSReport.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('jobId');

    if (!report) {
      res.status(404);
      throw new Error('Report not found.');
    }

    const candidateName = report.resumeId?.parsedData?.name || req.user.name || 'Candidate';
    const jobTitle = report.jobId?.title || 'Target Job';
    
    const reportDir = path.join(process.cwd(), 'generated-reports');
    const filename = `ATS_Report_${report._id}.docx`;
    const outputPath = path.join(reportDir, filename);

    // Generate DOCX
    await generateDOCXReport(report, candidateName, jobTitle, outputPath);

    // Send file to client
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error('DOCX download error:', err.message);
      }
      // Cleanup file after download is finished or failed
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });
  } catch (error) {
    next(error);
  }
};
