/**
 * Simple persistent vector store backed by a JSON file.
 * Uses cosine similarity for nearest-neighbour search.
 * No external dependencies — works on any hosting platform.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// In production (Render) use /app/server/data, otherwise local vector_db folder
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'vector_db')
const DB_PATH = path.join(DATA_DIR, 'store.json')

// ── Helpers ─────────────────────────────────────────────────────────────────

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na  += a[i] * a[i]
    nb  += b[i] * b[i]
  }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb))
}

function load() {
  if (!fs.existsSync(DB_PATH)) return []
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
  } catch {
    return []
  }
}

function save(chunks) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(chunks), 'utf8')
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Store a list of chunks with their embeddings.
 * @param {{ id, text, documentName, pageNumber, embedding }[]} chunks
 */
export function storeChunks(chunks) {
  const existing = load()
  // Append (duplicates handled by deleteDocumentChunks before uploading)
  const updated = [...existing, ...chunks]
  save(updated)
}

/**
 * Find top-k most similar chunks to a query embedding.
 * @param {number[]} queryEmbedding
 * @param {number}   topK
 * @returns {{ text, documentName, pageNumber, score }[]}
 */
export function searchSimilar(queryEmbedding, topK = 5) {
  const chunks = load()
  if (!chunks.length) return []

  const scored = chunks.map((c) => ({
    text:         c.text,
    documentName: c.documentName,
    pageNumber:   c.pageNumber,
    score:        cosineSimilarity(queryEmbedding, c.embedding),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

/**
 * Delete all chunks for a given document.
 * @param {string} documentName
 */
export function deleteDocumentChunks(documentName) {
  const chunks = load().filter((c) => c.documentName !== documentName)
  save(chunks)
}

/**
 * List unique document names stored.
 * @returns {string[]}
 */
export function listDocuments() {
  const chunks = load()
  return [...new Set(chunks.map((c) => c.documentName))]
}

/**
 * Get basic stats for a document.
 */
export function getDocumentStats(documentName) {
  const chunks = load().filter((c) => c.documentName === documentName)
  return { chunks: chunks.length }
}
