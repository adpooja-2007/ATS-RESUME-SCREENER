/**
 * Phase 2 - RAG System Local Vector Store
 * Stores vector embeddings in memory and calculates cosine similarities.
 */

// Cosine similarity between two float arrays
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export class MemoryVectorStore {
  constructor() {
    this.vectors = []; // Stores { id, chunk, embedding }
  }

  /**
   * Adds a document chunk and its embedding to the store
   */
  async addDocument(id, chunk, embedding) {
    this.vectors.push({ id, chunk, embedding });
  }

  /**
   * Searches the store for the top K most similar vectors to a query embedding
   */
  async similaritySearch(queryEmbedding, topK = 3) {
    const scores = this.vectors.map(item => {
      const similarity = cosineSimilarity(queryEmbedding, item.embedding);
      return {
        chunk: item.chunk,
        similarity
      };
    });

    // Sort descending and return top K
    return scores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  clear() {
    this.vectors = [];
  }
}
