import { genAI } from '../../config/gemini.js';

/**
 * Phase 2 - RAG System Embeddings
 * Generates vector representations of chunks using Gemini Embedding API or fallback.
 */

/**
 * Generates a vector embedding for a given text chunk
 * @param {string} text - Text chunk to embed
 * @returns {Promise<number[]>} - 768-dimensional float array
 */
export const getEmbedding = async (text) => {
  if (!genAI) {
    // Return dummy 768-dimensional vector if no API key
    return Array.from({ length: 768 }, () => Math.random());
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding generation failed, utilizing random vector backup:', error.message);
    return Array.from({ length: 768 }, () => Math.random());
  }
};
