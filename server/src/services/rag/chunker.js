/**
 * Phase 2 - RAG System Document Chunker
 * Splits raw resume or job description texts into clean, semantically meaningful passages.
 */

/**
 * Splits text into chunks of standard word/token lengths with overlaps
 * @param {string} text - Raw text to split
 * @param {number} chunkSize - Number of words per chunk
 * @param {number} chunkOverlap - Overlapping word count
 * @returns {object[]} - Chunks with metadata
 */
export const splitIntoChunks = (text, chunkSize = 100, chunkOverlap = 20) => {
  if (!text) return [];
  const words = text.split(/\s+/);
  const chunks = [];
  
  let index = 0;
  let chunkId = 0;
  
  while (index < words.length) {
    const chunkWords = words.slice(index, index + chunkSize);
    const chunkText = chunkWords.join(' ');
    
    chunks.push({
      id: chunkId++,
      text: chunkText,
      startIndex: index,
      endIndex: index + chunkWords.length
    });
    
    index += (chunkSize - chunkOverlap);
  }
  
  return chunks;
};
