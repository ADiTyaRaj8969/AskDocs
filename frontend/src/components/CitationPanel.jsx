import { useState } from 'react'

export default function CitationPanel({ citations }) {
  const [open, setOpen] = useState(false)
  if (!citations?.length) return null

  return (
    <div className="mt-3 pt-3 border-t border-white/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors group"
      >
        <span className="flex items-center gap-1.5">
          <SourcesIcon />
          <span className="font-medium">
            {citations.length} source{citations.length !== 1 ? 's' : ''}
          </span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {citations.map((c, i) => (
            <CitationCard key={i} citation={c} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

function CitationCard({ citation: c, index: i }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/[0.04] transition-colors"
      >
        {/* Index badge */}
        <span className="w-5 h-5 rounded-full bg-violet-600/80 text-white text-[10px] font-bold
          flex items-center justify-center shrink-0">
          {i + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-violet-300 truncate">{c.documentName}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Page {c.pageNumber}
            {c.score !== undefined && (
              <span className="ml-2 text-gray-600">
                {Math.round(c.score * 100)}% match
              </span>
            )}
          </p>
        </div>

        <ChevronIcon open={expanded} />
      </button>

      {expanded && (
        <div className="px-3 pb-3">
          <p className="text-xs text-gray-400 leading-relaxed border-t border-white/[0.06] pt-2.5 line-clamp-6">
            {c.chunkText}
          </p>
        </div>
      )}
    </div>
  )
}

const SourcesIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)
