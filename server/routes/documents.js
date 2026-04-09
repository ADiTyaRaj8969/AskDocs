import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { listDocuments, deleteDocumentChunks, getDocumentStats } from '../services/vectorStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const router = express.Router()

// GET /api/documents
router.get('/documents', (_req, res) => {
  const docs = listDocuments()
  const documents = docs.map((name) => {
    const stats = getDocumentStats(name)
    const filePath = path.join(UPLOAD_DIR, name)
    let size = 0
    try {
      size = fs.statSync(filePath).size
    } catch {}
    return { name, chunks: stats.chunks, size }
  })
  res.json({ documents })
})

// DELETE /api/documents/:name
router.delete('/documents/:name', (req, res) => {
  const documentName = decodeURIComponent(req.params.name)

  // Remove from vector store
  deleteDocumentChunks(documentName)

  // Remove from disk
  const filePath = path.join(UPLOAD_DIR, documentName)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  res.json({ message: `Document '${documentName}' deleted successfully.` })
})

export default router
