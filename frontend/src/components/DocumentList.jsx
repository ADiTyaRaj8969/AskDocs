import { useEffect, useState } from 'react'
import { deleteDocument, fetchDocuments } from '../api/api'
import { useToast } from './Toast'

function fileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  const configs = {
    pdf:  { bg: 'bg-red-500/15',    text: 'text-red-400',    label: 'PDF' },
    docx: { bg: 'bg-blue-500/15',   text: 'text-blue-400',   label: 'DOC' },
    doc:  { bg: 'bg-blue-500/15',   text: 'text-blue-400',   label: 'DOC' },
    xlsx: { bg: 'bg-emerald-500/15',text: 'text-emerald-400',label: 'XLS' },
    xls:  { bg: 'bg-emerald-500/15',text: 'text-emerald-400',label: 'XLS' },
    png:  { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'IMG' },
    jpg:  { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'IMG' },
    jpeg: { bg: 'bg-purple-500/15', text: 'text-purple-400', label: 'IMG' },
  }
  return configs[ext] ?? { bg: 'bg-gray-500/15', text: 'text-gray-400', label: 'DOC' }
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentList({ refreshSignal, onDocumentSelect }) {
  const toast = useToast()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      setDocs(await fetchDocuments())
    } catch {
      toast.error('Failed to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshSignal])

  const handleDelete = async (name) => {
    if (confirmDelete !== name) {
      setConfirmDelete(name)
      setTimeout(() => setConfirmDelete(null), 3000)
      return
    }
    setConfirmDelete(null)
    setDeletingDoc(name)
    try {
      await deleteDocument(name)
      toast.success(`"${name}" deleted.`)
      await load()
    } catch {
      toast.error('Failed to delete document.')
    } finally {
      setDeletingDoc(null)
    }
  }

  if (loading && !docs.length) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    )
  }

  if (!docs.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <EmptyIcon />
        </div>
        <p className="text-gray-500 text-sm">No documents yet</p>
        <p className="text-gray-600 text-xs">Upload a document to get started</p>
      </div>
    )
  }

  return (
    <ul className="space-y-1.5">
      {docs.map((doc) => {
        const icon = fileIcon(doc.name)
        const isDeleting = deletingDoc === doc.name
        const isConfirm = confirmDelete === doc.name

        return (
          <li
            key={doc.name}
            className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5
              transition-colors duration-150 cursor-pointer
              ${isDeleting ? 'opacity-40' : 'hover:bg-white/[0.05]'}`}
            onClick={() => onDocumentSelect?.(doc.name)}
          >
            {/* File type badge */}
            <div className={`w-8 h-8 rounded-lg ${icon.bg} flex items-center justify-center shrink-0`}>
              <span className={`text-[9px] font-bold ${icon.text}`}>{icon.label}</span>
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate leading-tight" title={doc.name}>
                {doc.name}
              </p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">
                {[
                  doc.chunks ? `${doc.chunks} chunks` : null,
                  doc.size ? formatBytes(doc.size) : null,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(doc.name) }}
              disabled={isDeleting}
              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                transition-all duration-150 opacity-0 group-hover:opacity-100
                ${isConfirm
                  ? 'bg-red-500/20 text-red-400 opacity-100'
                  : 'hover:bg-red-500/15 text-gray-600 hover:text-red-400'}`}
              title={isConfirm ? 'Click again to confirm delete' : 'Delete document'}
            >
              {isConfirm ? <ConfirmIcon /> : <TrashIcon />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

const EmptyIcon = () => (
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
)

const ConfirmIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
