import { type ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

interface TitleBarProps {
  onOpenSettings: () => void
}

export function TitleBar({ onOpenSettings }: TitleBarProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
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
        위젯 편집 및 테마
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
