import { useState } from 'react'
import ChatInterface from './components/ChatInterface'
import DocumentList from './components/DocumentList'
import FileUpload from './components/FileUpload'
import ToastContainer from './components/Toast'

export default function App() {
  const [refreshSignal, setRefreshSignal] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleUploaded = () => setRefreshSignal((s) => s + 1)

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="h-14 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-md
          sticky top-0 z-20 shrink-0">
          <div className="max-w-[1400px] mx-auto h-full px-4 flex items-center gap-3">

            {/* Sidebar toggle (mobile) */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg
                text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
            >
              <MenuIcon />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                flex items-center justify-center shadow-lg shadow-violet-900/40">
                <LogoIcon />
              </div>
              <div className="leading-none">
                <h1 className="text-base font-bold text-white tracking-tight">AskDocs</h1>
                <p className="text-[10px] text-gray-500 font-medium">Intelligent Document Assistant</p>
              </div>
            </div>

            {/* Right badges */}
            <div className="ml-auto flex items-center gap-2">
              <Badge dot color="emerald">RAG Active</Badge>
              <Badge>Gemini 1.5 Flash</Badge>
            </div>
          </div>
        </header>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex-1 max-w-[1400px] mx-auto w-full flex overflow-hidden"
          style={{ height: 'calc(100vh - 56px)' }}>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className={`shrink-0 flex flex-col border-r border-white/[0.06] overflow-y-auto
            transition-all duration-300 ease-in-out
            ${sidebarOpen
              ? 'w-72 opacity-100'
              : 'w-0 opacity-0 overflow-hidden pointer-events-none'} lg:opacity-100 lg:pointer-events-auto
            ${sidebarOpen ? 'lg:w-72' : 'lg:w-0 lg:overflow-hidden'}`}>

            <div className="p-4 space-y-5 w-72">
              {/* Upload */}
              <SideSection
                icon={<UploadSectionIcon />}
                title="Upload Document"
              >
                <FileUpload onUploaded={handleUploaded} />
              </SideSection>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Documents */}
              <SideSection
                icon={<DocsSectionIcon />}
                title="My Documents"
              >
                <DocumentList refreshSignal={refreshSignal} />
              </SideSection>

              {/* Divider */}
              <div className="border-t border-white/[0.06]" />

              {/* Info card */}
              <div className="rounded-2xl bg-violet-950/30 border border-violet-900/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-violet-300">How it works</p>
                <ol className="space-y-2">
                  {[
                    'Upload your documents (PDF, DOCX, XLSX, images)',
                    'Documents are chunked & embedded locally',
                    'Ask questions in natural language',
                    'Get grounded answers with source citations',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2 text-[11px] text-gray-400 leading-snug">
                      <span className="w-4 h-4 rounded-full bg-violet-800/60 text-violet-300
                        flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="text-[10px] text-gray-600 pt-1">
                  Your documents stay on your server. Only minimal context is sent to Gemini.
                </p>
              </div>
            </div>
          </aside>

          {/* ── Chat area ───────────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col p-4 min-w-0 overflow-hidden">
            {/* Chat header bar */}
            <div className="flex items-center gap-2 mb-3 shrink-0">
              {/* Sidebar toggle for desktop */}
              <button
                onClick={() => setSidebarOpen((o) => !o)}
                className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg
                  text-gray-600 hover:text-gray-400 hover:bg-white/5 transition-colors"
                title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              >
                <PanelIcon />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-sm font-medium text-gray-300">Document Chat</span>
              </div>
            </div>

            {/* Chat box */}
            <div className="flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.02]
              p-4 flex flex-col min-h-0 overflow-hidden">
              <ChatInterface />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function SideSection({ icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-violet-400">{icon}</span>
        <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Badge({ children, dot, color }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full
      border transition-colors
      ${dot && color === 'emerald'
        ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-400'
        : 'bg-white/[0.04] border-white/[0.08] text-gray-500'}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${color === 'emerald' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />}
      {children}
    </span>
  )
}

/* ── Icons ──────────────────────────────────────────────────────────────── */

const LogoIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
)

const PanelIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v12a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18V6zM13.5 4.5l4.5 4.5-4.5 4.5" />
  </svg>
)

const UploadSectionIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
)

const DocsSectionIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
)
