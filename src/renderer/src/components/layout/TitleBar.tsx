import { type ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

interface TitleBarProps {
  onOpenSettings: () => void
}

export function TitleBar({ onOpenSettings }: TitleBarProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const launchers = useSettingsStore((s) => s.settings.launchers)
  const theme = THEMES[themeKey]

  return (
    <div className="drag-region flex items-center justify-between h-10 px-5 shrink-0">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: theme.accent,
            animation: 'pulseGlow 2s ease-in-out infinite',
            boxShadow: `0 0 8px ${theme.accent}`
          }}
        />
        <span className="text-sm font-bold" style={{ color: '#374151' }}>
          Teacher&apos;s Desk
        </span>
      </div>

      {/* Center: Launcher icons */}
      <div className="no-drag flex items-center gap-2">
        {launchers.map((l) => (
          <button
            key={l.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.5)',
              cursor: 'pointer'
            }}
            onClick={() => { if (l.url) window.open(l.url, '_blank') }}
            title={l.name}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: l.color }}
            >
              {l.letter}
            </div>
            <span className="text-[10px] font-medium" style={{ color: '#555' }}>{l.name}</span>
          </button>
        ))}
      </div>

      <button
        className="no-drag flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
        style={{
          background: 'rgba(255,255,255,0.5)',
          color: '#666',
          border: '1px solid rgba(0,0,0,0.06)'
        }}
        onClick={onOpenSettings}
      >
        <Settings size={14} />
        설정
      </button>
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
