import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import fs from 'fs';
import path from 'path';

/**
 * Generates an editable DOCX Report for the candidate
 * @param {object} reportData - Clean structured data of the score and gap analysis
 * @param {string} candidateName - Candidate's Name
 * @param {string} jobTitle - Targeted Job Title
 * @param {string} outputPath - Path to write the DOCX file to
 * @returns {Promise<string>} - Output path
 */
export const generateDOCXReport = (reportData, candidateName, jobTitle, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const score = reportData.atsScore || 0;
      const breakdown = reportData.scoreBreakdown || {};

      // Configure table styles
      const tableRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Scoring Component", bold: true, color: "ffffff" })] })],
              shading: { fill: "1e293b" }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "Match Score", bold: true, color: "ffffff" })] })],
              shading: { fill: "1e293b" }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Skill Match (40% Weight)")] }),
            new TableCell({ children: [new Paragraph(`${breakdown.skillMatch || 0}/100`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Keyword Match (30% Weight)")] }),
            new TableCell({ children: [new Paragraph(`${breakdown.keywordMatch || 0}/100`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Project Relevance (15% Weight)")] }),
            new TableCell({ children: [new Paragraph(`${breakdown.projectRelevance || 0}/100`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Experience Match (10% Weight)")] }),
            new TableCell({ children: [new Paragraph(`${breakdown.experienceMatch || 0}/100`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph("Resume Quality (5% Weight)")] }),
            new TableCell({ children: [new Paragraph(`${breakdown.resumeQuality || 0}/100`)] })
          ]
        })
      ];

      const scoreTable = new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        }
      });

      // Construct paragraphs for suggestions
      const suggestionParagraphs = (reportData.suggestions || []).map(sugg => {
        return new Paragraph({
          children: [
            new TextRun({ text: "• ", bold: true, color: "4f46e5" }),
            new TextRun({ text: sugg })
          ],
          spacing: { after: 120 }
        });
      });

      // Missing skills text
      const missingSkillsArray = reportData.missingSkills || [];
      const missingText = missingSkillsArray.length > 0
        ? missingSkillsArray.join(', ')
        : "None identified.";

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                text: "ATS ANALYSIS REPORT",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Candidate Name: `, bold: true }),
                  new TextRun(candidateName),
                  new TextRun({ text: `\tTarget Job: `, bold: true }),
                  new TextRun(jobTitle)
                ],
                spacing: { after: 300 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Overall ATS Score: `, bold: true, size: 28 }),
                  new TextRun({ text: `${score}%`, bold: true, size: 28, color: "4f46e5" })
                ],
                spacing: { after: 400 }
              }),
              new Paragraph({
                text: "Score Breakdown",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 120 }
              }),
              scoreTable,
              new Paragraph({
                text: "Detected Skill Gaps",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 120 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Missing Skills: ", bold: true }),
                  new TextRun(missingText)
                ],
                spacing: { after: 300 }
              }),
              new Paragraph({
                text: "Improvement Suggestions",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 120 }
              }),
              ...suggestionParagraphs,
              new Paragraph({
                text: "Report End",
                alignment: "center",
                spacing: { before: 600 }
              })
            ]
          }
        ]
      });

      Packer.toBuffer(doc).then((buffer) => {
        fs.writeFileSync(outputPath, buffer);
        resolve(outputPath);
      }).catch(err => reject(err));

    } catch (error) {
      reject(error);
    }
  });
};
