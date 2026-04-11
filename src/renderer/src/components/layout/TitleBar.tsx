import { type ReactNode, useState, useEffect } from 'react'
import { Settings, Pin, PinOff } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

interface TitleBarProps {
  onOpenSettings: () => void
}

export function TitleBar({ onOpenSettings }: TitleBarProps): ReactNode {
  const launchers = useSettingsStore((s) => s.settings.launchers)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    window.api.getDesktopPin().then(setPinned).catch(() => {})
  }, [])

  async function handleTogglePin(): Promise<void> {
    const next = !pinned
    await window.api.toggleDesktopPin(next)
    setPinned(next)
  }

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

      <div className="no-drag flex items-center gap-2">
        {/* 바탕화면 고정 버튼 */}
        <button
          className="flex items-center gap-1.5 rounded-xl transition-all hover:scale-105"
          style={{
            background: pinned ? theme.hover : 'rgba(255,255,255,0.7)',
            color: pinned ? theme.primary : '#94a3b8',
            border: pinned ? `1px solid ${theme.border}` : '1px solid rgba(226,232,240,0.6)',
            cursor: 'pointer',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 600
          }}
          onClick={handleTogglePin}
          title={pinned ? '바탕화면 고정 해제' : '바탕화면에 고정'}
        >
          {pinned ? <Pin size={14} /> : <PinOff size={14} />}
          {pinned ? '고정중' : '고정'}
        </button>

        {/* 설정 버튼 */}
        <button
          className="flex items-center gap-2 rounded-xl transition-all hover:scale-105"
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
    </div>
  )
}
