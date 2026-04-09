import { v4 as uuidv4 } from 'uuid'

const CHUNK_SIZE   = 500  // words
const CHUNK_OVERLAP = 100 // words

/**
 * Split pages into overlapping word-based chunks.
 * @param {{ text, pageNumber, documentName }[]} pages
 * @returns {{ id, text, pageNumber, documentName }[]}
 */
export function chunkPages(pages) {
  const chunks = []

  for (const page of pages) {
    const words = page.text.split(/\s+/).filter(Boolean)
    if (words.length === 0) continue

    let start = 0
    while (start < words.length) {
      const end = Math.min(start + CHUNK_SIZE, words.length)
      const chunkText = words.slice(start, end).join(' ')

      chunks.push({
        id:           uuidv4(),
        text:         chunkText,
        pageNumber:   page.pageNumber,
        documentName: page.documentName,
      })

      if (end === words.length) break
      start += CHUNK_SIZE - CHUNK_OVERLAP
    }
  }

  return chunks
}
