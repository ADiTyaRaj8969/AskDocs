import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export async function uploadDocument(file, onUploadProgress) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return data
}

export async function fetchDocuments() {
  const { data } = await api.get('/documents')
  return data.documents
}

export async function deleteDocument(name) {
  const { data } = await api.delete(`/documents/${encodeURIComponent(name)}`)
  return data
}

export async function queryDocuments(question, topK = 5) {
  const { data } = await api.post('/query', { question, top_k: topK })
  return data
}
