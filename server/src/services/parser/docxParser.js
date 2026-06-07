import mammoth from 'mammoth';

/**
 * Parses a DOCX file and extracts raw text
 * @param {string} filePath - Absolute path to the DOCX file
 * @returns {Promise<string>} - The extracted raw text
 */
export const parseDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; // The raw text
  } catch (error) {
    console.error('Error parsing DOCX:', error.message);
    throw new Error(`Failed to parse DOCX resume: ${error.message}`);
  }
};
