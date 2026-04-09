import { useEffect, useState } from 'react'

/**
 * Toast notification system.
 * Usage: import { useToast } from './Toast'
 *        const toast = useToast()
 *        toast.success('Done!') / toast.error('Oops')
 */

let _dispatch = null

export function useToast() {
  return {
    success: (msg) => _dispatch?.({ type: 'success', msg }),
    error:   (msg) => _dispatch?.({ type: 'error',   msg }),
    info:    (msg) => _dispatch?.({ type: 'info',    msg }),
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    _dispatch = ({ type, msg }) => {
      const id = Date.now()
      setToasts((t) => [...t, { id, type, msg }])
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
    }
    return () => { _dispatch = null }
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs
            ${t.type === 'success' ? 'bg-emerald-600 text-white' :
              t.type === 'error'   ? 'bg-red-600 text-white' :
                                     'bg-violet-600 text-white'}`}
        >
          {t.type === 'success' && <CheckIcon />}
          {t.type === 'error'   && <XIcon />}
          {t.type === 'info'    && <InfoIcon />}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)
const XIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const InfoIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
