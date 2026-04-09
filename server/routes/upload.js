import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { extractText } from '../services/extractor.js'
import { chunkPages } from '../services/chunker.js'
import { getEmbeddingsBatch } from '../services/embedder.js'
import { storeChunks, deleteDocumentChunks } from '../services/vectorStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const SUPPORTED = new Set(['.pdf', '.docx', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'])

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file, cb) => cb(null, file.originalname),
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (SUPPORTED.has(ext)) return cb(null, true)
    cb(new Error(`Unsupported file type: ${ext}`))
  },
})

const router = express.Router()

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided.' })
  }

  const filePath = req.file.path
  const fileName = req.file.originalname

  try {
    // Extract text from document
    const pages = await extractText(filePath)
    if (!pages.length) {
      fs.unlinkSync(filePath)
      return res.status(422).json({ error: 'No text could be extracted from this document.' })
    }

    // Remove stale chunks for re-uploaded document
    deleteDocumentChunks(fileName)

    // Chunk → embed → store
    const chunks = chunkPages(pages)
    const embeddings = await getEmbeddingsBatch(chunks.map((c) => c.text))

    const chunksWithEmbeddings = chunks.map((c, i) => ({
      ...c,
      embedding: embeddings[i],
    }))

    storeChunks(chunksWithEmbeddings)

    res.json({
      message:      'Document processed successfully.',
      documentName: fileName,
      chunksCreated: chunks.length,
      pages:        pages.length,
    })
  } catch (err) {
    // Clean up on failure
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    console.error('[Upload Error]', err)
    res.status(500).json({ error: err.message || 'Failed to process document.' })
  }
})

export default router
