import { getEmbedding } from './embeddings.js';
import { MemoryVectorStore } from './vectorStore.js';

/**
 * Phase 2 - RAG System Retriever
 * Coordinates vector embedding of a query and fetches top matching chunks from the store.
 */

const vectorStoreInstance = new MemoryVectorStore();

/**
 * Populates retrieval database from resume chunks
 * @param {object[]} chunks - Text chunks to embed and store
 */
export const indexChunks = async (chunks) => {
  vectorStoreInstance.clear();
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk.text);
    await vectorStoreInstance.addDocument(chunk.id, chunk, embedding);
  }
};

/**
 * Retrieves relevant context chunks matching a query
 * @param {string} query - The lookup question or topic
 * @param {number} topK - Count of chunks to return
 * @returns {Promise<object[]>} - Top matching chunk details
 */
export const retrieveContext = async (query, topK = 2) => {
  const queryEmbedding = await getEmbedding(query);
  return await vectorStoreInstance.similaritySearch(queryEmbedding, topK);
};
