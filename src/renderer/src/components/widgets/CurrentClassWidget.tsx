import { type ReactNode } from 'react'
import { Bell } from 'lucide-react'
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
      ? `현재 ${currentPeriod}교시 (${entry.subject || entry.className} ${entry.className})`
      : currentPeriod !== null
        ? `현재 ${currentPeriod}교시 공강`
        : '수업 외 시간'

  let progress = 0
  if (pt && !isBreak) {
    const s = toMin(pt.startTime)
    const e = toMin(pt.endTime)
    const n = hours * 60 + minutes
    if (e - s > 0) progress = Math.min(100, Math.max(0, ((n - s) / (e - s)) * 100))
  }

  return (
    <div
      className="h-full p-5 flex flex-col justify-between relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '10px',
          height: '100%',
          background: theme.accent,
          borderTopLeftRadius: '24px',
          borderBottomLeftRadius: '24px'
        }}
      />

      <div className="pl-4 flex flex-col justify-between h-full">
        <div>
          <p className="text-xs font-medium flex items-center gap-1" style={{ color: '#888' }}>
            <Bell size={14} />
            지금 이 시간
          </p>
          <h2 className="text-lg font-bold mt-1" style={{ color: theme.primary }}>
            {title}
          </h2>
        </div>

        {minutesLeft > 0 && (
          <div
            className="inline-flex items-center self-start px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: '#ffffff', color: theme.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            종료까지 {minutesLeft}분 남음
          </div>
        )}

        {pt && !isBreak && currentPeriod !== null && (
          <div className="mt-2">
            <div
              className="w-full rounded-full relative overflow-hidden"
              style={{ height: '8px', background: '#e5e7eb' }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: theme.accent }}
              />
              {/* pulse animation overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${progress}%`,
                  height: '100%',
                  borderRadius: '9999px',
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
