import { type ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'

interface TitleBarProps {
  onOpenSettings: () => void
}

export function TitleBar({ onOpenSettings }: TitleBarProps): ReactNode {
  const launchers = useSettingsStore((s) => s.settings.launchers)

  return (
    <div className="drag-region flex items-center justify-between shrink-0" style={{ height: '32px' }}>
      <div className="no-drag flex items-center gap-2">
        {launchers.map((l) => (
          <button
            key={l.id}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(226,232,240,0.5)',
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
            <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>{l.name}</span>
          </button>
        ))}
      </div>

      <button
        className="no-drag flex items-center gap-2 rounded-xl transition-all hover:scale-105"
        style={{
          background: 'rgba(255,255,255,0.7)',
          color: '#475569',
          border: '1px solid rgba(226,232,240,0.6)',
          cursor: 'pointer',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600
        }}
        onClick={onOpenSettings}
      >
        <Settings size={16} />
        설정
      </button>
    </div>
  )
}
