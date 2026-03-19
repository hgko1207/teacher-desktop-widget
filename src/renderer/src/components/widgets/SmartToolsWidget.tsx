import { useState, type ReactNode } from 'react'
import { Timer, Shuffle, FileX, Phone, ExternalLink } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

const LAUNCHERS = [
  { name: 'NEIS', letter: 'N', bg: '#3b82f6', url: 'https://www.neis.go.kr' },
  { name: '업무포털', letter: 'W', bg: '#14b8a6', url: '' },
  { name: '클래스팅', letter: 'C', bg: '#eab308', url: 'https://www.classting.com' }
]

const TOOLS = [
  { name: '타이머', icon: Timer, bgColor: '#fff7ed', iconColor: '#ea580c' },
  { name: '랜덤뽑기', icon: Shuffle, bgColor: '#faf5ff', iconColor: '#9333ea' },
  { name: '미제출자', icon: FileX, bgColor: '#fef2f2', iconColor: '#dc2626' },
  { name: '내선번호', icon: Phone, bgColor: '#f0fdf4', iconColor: '#16a34a' }
]

export function SmartToolsWidget(): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]
  const [timerStarted, setTimerStarted] = useState(false)

  return (
    <div
      className="h-full flex flex-col p-4"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      {/* 즐겨찾기 런처 */}
      <div className="mb-3">
        <span className="text-xs font-semibold" style={{ color: '#888' }}>즐겨찾기 런처</span>
        <div className="flex items-center gap-3 mt-2">
          {LAUNCHERS.map((l) => (
            <button
              key={l.name}
              className="flex flex-col items-center group"
              onClick={() => { if (l.url) window.open(l.url, '_blank') }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
                style={{ background: l.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                {l.letter}
              </div>
              <span className="text-xs mt-1" style={{ color: '#666' }}>{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 스마트 도구 */}
      <div className="flex-1">
        <span className="text-xs font-semibold" style={{ color: '#888' }}>스마트 도구</span>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.name}
                className="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: tool.bgColor }}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span className="text-xs font-medium" style={{ color: tool.iconColor }}>{tool.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 빠른 5분 타이머 */}
      <button
        className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
        style={{
          background: theme.bg,
          color: theme.primary,
          border: `1px solid ${theme.border}`
        }}
        onClick={() => setTimerStarted(!timerStarted)}
      >
        <Timer size={14} />
        {timerStarted ? '타이머 진행 중...' : '빠른 5분 타이머 시작'}
        <ExternalLink size={12} />
      </button>
    </div>
  )
}
