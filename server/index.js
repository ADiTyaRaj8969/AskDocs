import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import uploadRouter from './routes/upload.js'
import queryRouter from './routes/query.js'
import documentsRouter from './routes/documents.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Validate env ────────────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  console.error('❌  GEMINI_API_KEY is not set. Add it to server/.env')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow: no origin (curl/Postman), any localhost port (dev), or configured origins
    if (!origin) return cb(null, true)
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true)
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS policy: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── API routes ──────────────────────────────────────────────────────────────
app.use('/api', uploadRouter)
app.use('/api', queryRouter)
app.use('/api', documentsRouter)

// ── Health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ── Serve React build in production ────────────────────────────────────────
const DIST = path.join(__dirname, '..', 'frontend', 'dist')
import { existsSync } from 'fs'

if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST, 'index.html'))
  })
} else {
  app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'AskDocs API running. Frontend not built yet.' })
  })
}

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n🚀  AskDocs API running on http://localhost:${PORT}`)
  console.log(`📄  Health: http://localhost:${PORT}/health\n`)
})
