import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generates a PDF Report for the candidate
 * @param {object} reportData - Clean structured data of the score and gap analysis
 * @param {string} candidateName - Candidate's Name
 * @param {string} jobTitle - Targeted Job Title
 * @param {string} outputPath - Path to write the PDF file to
 * @returns {Promise<string>} - Output path
 */
export const generatePDFReport = (reportData, candidateName, jobTitle, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(outputPath);

      doc.pipe(writeStream);

      // Color Palette (Professional dark mode accents)
      const primaryColor = '#1e293b'; // Slate 800
      const secondaryColor = '#4f46e5'; // Indigo 600
      const textColor = '#334155'; // Slate 700
      const lightBg = '#f8fafc'; // Slate 50
      const dividerColor = '#cbd5e1'; // Slate 300

      // Title & Header Section
      doc.rect(0, 0, 595, 120).fill(primaryColor);
      
      doc.fillColor('#ffffff')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('ATS ANALYSIS REPORT', 50, 40);

      doc.fontSize(12)
         .font('Helvetica')
         .text(`Candidate: ${candidateName}`, 50, 75)
         .text(`Job Target: ${jobTitle}`, 350, 75);

      // Reset text options
      doc.fillColor(textColor).fontSize(10);

      // Row 1: Overall Score Card
      const score = reportData.atsScore || 0;
      doc.rect(50, 140, 495, 80).fill(lightBg);

      doc.fillColor(secondaryColor)
         .fontSize(36)
         .font('Helvetica-Bold')
         .text(`${score}%`, 80, 155);

      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('OVERALL MATCH SCORE', 200, 160);

      doc.fillColor(textColor)
         .fontSize(10)
         .font('Helvetica')
         .text('This represents the compatibility between the uploaded resume and the specified job description.', 200, 185);

      // Score Breakdown Section
      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('SCORING BREAKDOWN', 50, 240);

      doc.moveTo(50, 260).lineTo(545, 260).strokeColor(dividerColor).stroke();

      const breakdown = reportData.scoreBreakdown || {};
      const components = [
        { label: 'Skill Match (40% weight)', val: breakdown.skillMatch || 0 },
        { label: 'Keyword Match (30% weight)', val: breakdown.keywordMatch || 0 },
        { label: 'Project Relevance (15% weight)', val: breakdown.projectRelevance || 0 },
        { label: 'Experience Match (10% weight)', val: breakdown.experienceMatch || 0 },
        { label: 'Resume Quality (5% weight)', val: breakdown.resumeQuality || 0 }
      ];

      let currentY = 275;
      components.forEach(comp => {
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text(comp.label, 60, currentY);

        // Progress bar container
        doc.rect(250, currentY - 2, 200, 12).fillColor(dividerColor).fill();
        // Progress fill
        const fillWidth = (comp.val / 100) * 200;
        if (fillWidth > 0) {
          doc.rect(250, currentY - 2, fillWidth, 12).fillColor(secondaryColor).fill();
        }

        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .text(`${comp.val}/100`, 470, currentY);

        currentY += 25;
      });

      // Missing Skills Section
      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('DETECTED SKILL GAPS', 50, currentY + 15);

      doc.moveTo(50, currentY + 30).lineTo(545, currentY + 30).strokeColor(dividerColor).stroke();

      currentY += 45;
      const missing = reportData.missingSkills || [];
      if (missing.length === 0) {
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text('No critical skill gaps identified! The skills listed in the resume correspond well with the requirements.', 60, currentY);
        currentY += 20;
      } else {
        // High priority list
        const high = reportData.gapAnalysis?.highPriority || [];
        const medium = reportData.gapAnalysis?.mediumPriority || [];
        const low = reportData.gapAnalysis?.lowPriority || [];

        if (high.length > 0) {
          doc.fillColor('#b91c1c') // Dark Red
             .font('Helvetica-Bold')
             .text(`High Priority Gaps: ${high.join(', ')}`, 60, currentY);
          currentY += 20;
        }
        if (medium.length > 0) {
          doc.fillColor('#d97706') // Dark Amber
             .font('Helvetica-Bold')
             .text(`Medium Priority Gaps: ${medium.join(', ')}`, 60, currentY);
          currentY += 20;
        }
        if (low.length > 0) {
          doc.fillColor('#4f46e5') // Indigo
             .font('Helvetica-Bold')
             .text(`Preferred Skill Gaps: ${low.join(', ')}`, 60, currentY);
          currentY += 20;
        }
      }

      // Suggestions Section
      doc.fillColor(primaryColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('IMPROVEMENT RECOMMENDATIONS', 50, currentY + 15);

      doc.moveTo(50, currentY + 30).lineTo(545, currentY + 30).strokeColor(dividerColor).stroke();

      currentY += 45;
      const suggs = reportData.suggestions || [];
      suggs.forEach(sugg => {
        // Bullet point
        doc.circle(65, currentY + 4, 3).fillColor(secondaryColor).fill();
        
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text(sugg, 80, currentY, { width: 450 });
        
        // Dynamic line height adjustment
        const lines = Math.ceil(sugg.length / 80);
        currentY += (lines * 14) + 8;
      });

      // Footer
      doc.fontSize(8)
         .fillColor('#94a3b8')
         .text('AI Career Assistant - Resume Optimizer', 50, 780, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
