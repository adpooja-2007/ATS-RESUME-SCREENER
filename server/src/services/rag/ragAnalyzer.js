import { retrieveContext } from './retriever.js';
import { genAI } from '../../config/gemini.js';

/**
 * Phase 2 - RAG System Analyzer
 * Injects matching context snippets directly into Gemini prompts for hyper-personalized output.
 */

/**
 * Performs a retrieval-augmented query to explain why a candidate matches and how to improve
 * @param {string} query - Query topic (e.g. "Explain database experience alignment")
 * @returns {Promise<string>} - Contextual explanation from AI
 */
export const runRAGAnalysis = async (query) => {
  try {
    const matches = await retrieveContext(query, 2);
    const contextText = matches.map(m => m.chunk.text).join('\n---\n');

    if (!genAI) {
      return `[Demo Mode RAG Output] Based on context: "${contextText.substring(0, 150)}...", your experience aligns well but needs cloud scaling specifics.`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an advanced recruitment AI. Answer the query using ONLY the provided resume context snippets.
      If the context is insufficient, state so clearly. Do not use emojis.

      Query:
      ${query}

      Resume Context:
      ${contextText}
    `;

    const response = await model.generateContent(prompt);
    return response.response.text().trim();
  } catch (error) {
    console.error('RAG Analysis execution failed:', error.message);
    return 'Failed to execute context-aware RAG analysis.';
  }
};
