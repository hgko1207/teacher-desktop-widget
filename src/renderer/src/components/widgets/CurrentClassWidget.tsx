import { type ReactNode } from 'react'

import { useCurrentPeriod } from '../../hooks/useCurrentPeriod'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { useTimetableStore } from '../../stores/timetableStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { DayOfWeek } from '../../types'

const DAY_MAP: Record<number, DayOfWeek> = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' }

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '16px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

export function CurrentClassWidget(): ReactNode {
  const { currentPeriod, isBreak, minutesLeft } = useCurrentPeriod()
  const { hours, minutes, dayIndex } = useCurrentTime()
  const entries = useTimetableStore((s) => s.entries)
  const periodTimes = useSettingsStore((s) => s.settings.periodTimes)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const dayKey = DAY_MAP[dayIndex]
  const entry =
    currentPeriod !== null && dayKey
      ? entries.find((e) => e.day === dayKey && e.period === currentPeriod)
      : undefined
  const pt = currentPeriod !== null ? periodTimes.find((p) => p.period === currentPeriod) : undefined

  const title = isBreak
    ? '쉬는 시간'
    : entry
      ? `${currentPeriod}교시 ${entry.subject || entry.className}`
      : currentPeriod !== null
        ? `${currentPeriod}교시 공강`
        : '수업 외 시간'

  let progress = 0
  if (pt && !isBreak) {
    const s = toMin(pt.startTime)
    const e = toMin(pt.endTime)
    const n = hours * 60 + minutes
    if (e - s > 0) progress = Math.min(100, Math.max(0, ((n - s) / (e - s)) * 100))
  }

  return (
    <div className="h-full flex flex-col" style={{ ...CARD_STYLE, padding: '14px' }}>
      <p style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', marginBottom: '6px' }}>
        지금 이 시간
      </p>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: theme.primary, marginTop: '4px' }}>{title}</h3>
      {pt && !isBreak && currentPeriod !== null && (
        <div className="w-full mt-2 rounded-full overflow-hidden" style={{ height: '6px', background: '#f1f5f9' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: theme.accent, borderRadius: '9999px' }} />
        </div>
      )}
      {minutesLeft > 0 && (
        <p style={{ fontSize: '10px', color: theme.accent, marginTop: '4px' }}>종료까지 {minutesLeft}분 남음</p>
      )}
    </div>
  )
}
