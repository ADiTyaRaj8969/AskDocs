import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../api/api'
import { useToast } from './Toast'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({ onUploaded }) {
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')

  const onDrop = useCallback(async (accepted, rejected) => {
    if (rejected.length) {
      toast.error(`Unsupported file type. Use PDF, DOCX, XLSX, PNG or JPG.`)
      return
    }
    if (!accepted.length) return
    const file = accepted[0]
    setUploading(true)
    setProgress(0)
    setStage('Uploading…')

    try {
      const result = await uploadDocument(file, (e) => {
        if (e.total) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setProgress(pct)
          setStage(pct < 100 ? 'Uploading…' : 'Processing & embedding…')
        }
      })
      toast.success(`"${result.documentName}" ready — ${result.chunksCreated} chunks`)
      onUploaded?.()
    } catch (err) {
      toast.error(err.response?.data?.error ?? err.message)
    } finally {
      setUploading(false)
      setProgress(0)
      setStage('')
    }
  }, [onUploaded, toast])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: false,
    disabled: uploading,
  })

  const pending = acceptedFiles[0]

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer
          transition-all duration-200 overflow-hidden group
          ${isDragActive
            ? 'border-violet-400 bg-violet-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-violet-500/60 hover:bg-violet-500/5 bg-white/[0.02]'}
          ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />

        {/* Animated background on drag */}
        {isDragActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 animate-pulse" />
        )}

        <div className="relative flex flex-col items-center gap-2.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center
            transition-colors duration-200
            ${isDragActive ? 'bg-violet-500/30' : 'bg-white/5 group-hover:bg-violet-500/15'}`}>
            <UploadIcon active={isDragActive} />
          </div>

          {isDragActive ? (
            <p className="text-violet-300 font-semibold text-sm">Drop to upload</p>
          ) : (
            <>
              <div>
                <p className="text-gray-200 font-medium text-sm">Drag & drop a document</p>
                <p className="text-gray-500 text-xs mt-0.5">or click to browse</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1">
                {['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG'].map((f) => (
                  <span key={f} className="text-[10px] font-medium px-2 py-0.5 rounded-full
                    bg-white/5 text-gray-400 border border-white/10">
                    {f}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-400">
            <span>{stage}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${progress || 5}%` }}
            />
          </div>
          {pending && (
            <p className="text-xs text-gray-500 truncate">
              {pending.name} — {formatBytes(pending.size)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function UploadIcon({ active }) {
  return (
    <svg
      className={`w-5 h-5 transition-colors ${active ? 'text-violet-300' : 'text-gray-400'}`}
      fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}
