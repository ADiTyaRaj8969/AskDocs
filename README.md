# AskDocs — Intelligent Document Query System

> **RAG-based IDP** · FastAPI · React · ChromaDB · Google Gemini  
> *6th Semester — Advanced Web Technology (AWT)*

---

## What is AskDocs?

AskDocs is a privacy-first **Intelligent Document Processing (IDP)** system built on **Retrieval-Augmented Generation (RAG)**. Upload any document — PDF, Word, Excel, or image — and ask natural-language questions about its content. The system retrieves the most relevant passages and generates a concise, cited answer using Google Gemini.

All document data stays on your machine. Only the retrieved text snippets are sent to the Gemini API for answer generation.

---

## Features

| Feature | Details |
|---|---|
| Multi-format ingestion | PDF, DOCX, XLSX/XLS, PNG, JPG, JPEG |
| OCR fallback | Scanned PDFs and images processed via Gemini Vision |
| Semantic search | ChromaDB vector store with cosine-similarity HNSW index |
| Grounded answers | Gemini 2.5 Flash — answers cite source document + page |
| Sliding-window chunking | 500-word chunks, 100-word overlap |
| Batch embedding | Gemini `text-embedding-004` (768-dimensional) |
| Document management | List, re-upload, and delete documents with full vector cleanup |
| Modern UI | React + Vite + Tailwind CSS with drag-and-drop upload |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│   FileUpload │ DocumentList │ ChatInterface │ CitationPanel │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / REST  (localhost:8000)
┌──────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend                          │
│   POST /api/upload   │   POST /api/query   │   GET /api/documents │
└──┬─────────────┬─────┴──────────────┬──────────────────┬────┘
   │             │                    │                  │
┌──▼──┐     ┌───▼───┐           ┌────▼────┐        ┌────▼────┐
│Extr-│     │Chunker│           │Embedder │        │   LLM   │
│actor│     │500w/  │           │Gemini   │        │Gemini   │
│PyMu-│     │100ovlp│           │text-004 │        │2.5Flash │
│PDF  │     └───────┘           └────┬────┘        └─────────┘
│docx │                              │
│Exce-│                        ┌─────▼──────┐
│l/OCR│                        │  ChromaDB  │
└─────┘                        │ (local fs) │
                               └────────────┘
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18.x+ |
| Google Gemini API Key | Valid key from [Google AI Studio](https://aistudio.google.com/) |

---

## Quick Start

### 1. Clone / navigate to the project

```bash
cd "AWT Project"
```

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser

Navigate to **http://localhost:5173**

### One-command start (Windows)

```bash
start.bat
```

---

## Usage

1. **Upload a document** — drag and drop a file into the upload panel or click to browse
2. **Wait for processing** — the progress bar shows extraction → chunking → embedding status
3. **Ask a question** — type any natural-language question in the chat box
4. **Read the answer** — view the Markdown-formatted answer with inline citations
5. **Check sources** — the Citation Panel shows which document and page each answer came from
6. **Manage documents** — use the Document List to view or delete uploaded files

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload and process a document |
| `GET` | `/api/documents` | List all stored documents |
| `DELETE` | `/api/documents/{name}` | Delete document and all its vectors |
| `POST` | `/api/query` | Ask a question; returns answer + citations |
| `GET` | `/health` | Health check |

### POST /api/upload

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "message": "Document processed successfully.",
  "document_name": "report.pdf",
  "chunks_created": 42
}
```

### POST /api/query

**Request:**
```json
{
  "question": "What are the key findings?",
  "top_k": 5
}
```

**Response:**
```json
{
  "answer": "The key findings are... *(Source: report.pdf, Page 3)*",
  "citations": [
    {
      "document_name": "report.pdf",
      "page_number": 3,
      "chunk_text": "The study found that..."
    }
  ]
}
```

---

## Project Structure

```
AWT Project/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   ├── .env                     # GEMINI_API_KEY (not committed)
│   ├── routers/
│   │   ├── upload.py            # POST /api/upload, GET/DELETE /api/documents
│   │   └── query.py             # POST /api/query
│   ├── services/
│   │   ├── extractor.py         # Multi-format text extraction + OCR
│   │   ├── chunker.py           # Sliding-window word chunking
│   │   ├── embedder.py          # Gemini text-embedding-004 calls
│   │   ├── vector_store.py      # ChromaDB CRUD operations
│   │   └── llm.py               # Gemini 2.5 Flash answer generation
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response schemas
│   ├── uploads/                 # Uploaded files (local, not committed)
│   └── chroma_db/               # ChromaDB persistent storage (local)
├── frontend/
│   └── src/
│       ├── App.jsx              # Root layout: sidebar + chat
│       ├── components/
│       │   ├── FileUpload.jsx   # Drag-and-drop upload with progress
│       │   ├── DocumentList.jsx # Uploaded documents with delete
│       │   ├── ChatInterface.jsx# Conversation UI
│       │   └── CitationPanel.jsx# Source document citations
│       └── api/
│           └── api.js           # Axios API client
├── docs/
│   └── SRS.docx                 # Software Requirements Specification
├── generate_srs.py              # Script to regenerate SRS.docx
├── start.bat                    # One-click startup (Windows)
└── README.md
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite | SPA with fast HMR |
| Styling | Tailwind CSS | Utility-first CSS |
| File Upload | React Dropzone | Drag-and-drop with validation |
| HTTP Client | Axios | REST API calls |
| Backend | FastAPI + Uvicorn | Async Python REST API |
| Validation | Pydantic v2 | Schema validation |
| LLM | Gemini 2.5 Flash | Answer generation |
| Embeddings | Gemini text-embedding-004 | 768-dim semantic vectors |
| OCR | Gemini Vision (2.5 Flash) | Scanned document/image text |
| Vector DB | ChromaDB | Local HNSW similarity search |
| PDF | PyMuPDF | Text extraction |
| Word | python-docx | DOCX parsing |
| Excel | Pandas + openpyxl | Spreadsheet parsing |
| Images | Pillow | Image preprocessing |

---

## How RAG Works in AskDocs

```
Document Ingestion:
  File → Extract Text → Chunk (500w/100w overlap) → Embed → Store in ChromaDB

Query:
  Question → Embed → Cosine Search (top-5) → Inject Context → Gemini LLM → Answer + Citations
```

The key insight: Gemini only sees the **retrieved passages**, not the entire document. This keeps API costs low while ensuring answers are grounded in your actual documents.

---

*Built for the 6th Semester Advanced Web Technology course.*
