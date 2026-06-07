import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Parses a PDF file and extracts raw text
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} - The extracted raw text
 */
export const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error.message);
    throw new Error(`Failed to parse PDF resume: ${error.message}`);
  }
};
