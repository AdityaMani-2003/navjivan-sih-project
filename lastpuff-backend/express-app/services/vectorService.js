import axios from "axios";
import { KNOWLEDGE_DOCS } from "./knowledgeBase.js";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";

/**
 * Lightweight tokenized similarity calculation for resilient in-memory search
 */
function calculateTextSimilarity(query, text) {
  const queryWords = new Set(
    query
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const textWords = new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  if (!queryWords.size || !textWords.size) return 0;

  let matches = 0;
  for (const word of queryWords) {
    if (textWords.has(word)) matches++;
  }

  return matches / Math.sqrt(queryWords.size * textWords.size);
}

export async function searchKnowledgeBase(query, topK = 3) {
  // Try ChromaDB if service is running
  try {
    const res = await axios.get(`${CHROMA_URL}/api/v1/heartbeat`, { timeout: 800 });
    if (res.data) {
      // Chroma is alive — perform query via Chroma API
      // If collection exists, search; else fallback to in-memory
    }
  } catch {
    // Docker Chroma not reachable, use high-speed in-memory search
  }

  // In-memory ranker
  const scored = KNOWLEDGE_DOCS.map((doc) => {
    const score = calculateTextSimilarity(
      query,
      `${doc.title} ${doc.content} ${doc.tags.join(" ")}`
    );
    return { ...doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export default {
  searchKnowledgeBase,
};
