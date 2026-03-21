import { type ReactNode } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

export function LauncherWidget(): ReactNode {
  const launchers = useSettingsStore((s) => s.settings.launchers)

  return (
    <div
      className="flex flex-col p-3"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(226,232,240,0.6)',
        borderRadius: '16px',
        boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
      }}
    >
      <span className="text-[10px] font-semibold mb-2" style={{ color: '#888' }}>즐겨찾기 런처</span>
      <div className="flex items-center gap-3">
        {launchers.map((l) => (
          <button
            key={l.id}
            className="flex flex-col items-center group"
            onClick={() => { if (l.url) window.open(l.url, '_blank') }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
              style={{ background: l.color, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              {l.letter}
            </div>
            <span className="text-[10px] mt-1" style={{ color: '#666' }}>{l.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
