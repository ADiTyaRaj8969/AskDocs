/**
 * Multi-format text extractor.
 * Supports: PDF, DOCX, XLSX/XLS, PNG/JPG (via Tesseract OCR)
 */

import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import mammoth from 'mammoth'
import ExcelJS from 'exceljs'
import Tesseract from 'tesseract.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Extract text pages from a file.
 * Returns: { text, pageNumber, documentName }[]
 */
export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const documentName = path.basename(filePath)

  switch (ext) {
    case '.pdf':   return extractPDF(filePath, documentName)
    case '.docx':  return extractDOCX(filePath, documentName)
    case '.xlsx':
    case '.xls':   return await extractExcel(filePath, documentName)
    case '.png':
    case '.jpg':
    case '.jpeg':  return extractImage(filePath, documentName)
    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }
}

// ── PDF ──────────────────────────────────────────────────────────────────────
async function extractPDF(filePath, documentName) {
  const buffer = fs.readFileSync(filePath)
  const data = await pdfParse(buffer)

  const text = data.text?.trim() || ''

  // If too little text, try Gemini Vision OCR on the PDF
  if (text.length < 100) {
    return extractPDFWithVision(filePath, documentName)
  }

  // Split into pseudo-pages by form-feed or chunk by paragraph
  const pages = text.split(/\f/).filter((p) => p.trim().length > 0)
  if (pages.length === 0) return []

  return pages.map((pageText, i) => ({
    text: pageText.trim(),
    pageNumber: i + 1,
    documentName,
  }))
}

async function extractPDFWithVision(filePath, documentName) {
  // Use Gemini Vision to OCR the PDF as a whole file
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const fileBuffer = fs.readFileSync(filePath)
  const base64 = fileBuffer.toString('base64')

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'application/pdf',
        data: base64,
      },
    },
    'Extract all text from this PDF exactly as it appears. Preserve paragraph and page structure. Return only the extracted text.',
  ])

  const text = result.response.text().trim()
  if (!text) return []

  return [{ text, pageNumber: 1, documentName }]
}

// ── DOCX ─────────────────────────────────────────────────────────────────────
async function extractDOCX(filePath, documentName) {
  const result = await mammoth.extractRawText({ path: filePath })
  const text = result.value?.trim()
  if (!text) return []
  return [{ text, pageNumber: 1, documentName }]
}

// ── Excel ────────────────────────────────────────────────────────────────────
async function extractExcel(filePath, documentName) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)
  const pages = []

  workbook.eachSheet((sheet, i) => {
    const rows = []
    sheet.eachRow((row) => {
      const cells = row.values.slice(1).map((v) =>
        v === null || v === undefined ? '' : String(v?.result ?? v)
      )
      rows.push(cells.join('\t'))
    })
    const text = `Sheet: ${sheet.name}\n\n${rows.join('\n')}`.trim()
    if (text.length > 10) {
      pages.push({ text, pageNumber: i, documentName })
    }
  })

  return pages
}

// ── Images (Tesseract OCR) ───────────────────────────────────────────────────
async function extractImage(filePath, documentName) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {},
  })
  if (!text?.trim()) return []
  return [{ text: text.trim(), pageNumber: 1, documentName }]
}
