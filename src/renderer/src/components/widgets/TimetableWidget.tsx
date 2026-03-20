import { type ReactNode, useState } from 'react'
import { List, MoreHorizontal } from 'lucide-react'
import { useTimetableStore, getClassColor } from '../../stores/timetableStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { useCurrentPeriod } from '../../hooks/useCurrentPeriod'
import { THEMES } from '../../config/themes'
import type { DayOfWeek, TimetableEntry } from '../../types'

const DAYS: { key: DayOfWeek; label: string; idx: number }[] = [
  { key: 'mon', label: '월', idx: 1 },
  { key: 'tue', label: '화', idx: 2 },
  { key: 'wed', label: '수', idx: 3 },
  { key: 'thu', label: '목', idx: 4 },
  { key: 'fri', label: '금', idx: 5 }
]

function CellEditor({
  day,
  period,
  onSave,
  onCancel
}: {
  day: DayOfWeek
  period: number
  onSave: (e: TimetableEntry) => void
  onCancel: () => void
}): ReactNode {
  const [val, setVal] = useState('')
  const submit = (): void => {
    if (!val.trim()) {
      onCancel()
      return
    }
    onSave({
      day,
      period,
      className: val.trim(),
      subject: '',
      room: '',
      color: getClassColor(val.trim())
    })
  }
  return (
    <input
      autoFocus
      className="w-full h-full text-center text-sm font-semibold outline-none rounded-xl"
      style={{ border: '2px solid #818cf8', background: '#fff' }}
      placeholder="반"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submit()
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={submit}
    />
  )
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function TimetableWidget(): ReactNode {
  const entries = useTimetableStore((s) => s.entries)
  const isEditing = useTimetableStore((s) => s.isEditing)
  const setEditing = useTimetableStore((s) => s.setEditing)
  const addEntry = useTimetableStore((s) => s.addEntry)
  const removeEntry = useTimetableStore((s) => s.removeEntry)
  const periodTimes = useSettingsStore((s) => s.settings.periodTimes)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]
  const { hours, minutes: curMinutes, dayIndex } = useCurrentTime()
  const { currentPeriod } = useCurrentPeriod()
  const [editCell, setEditCell] = useState<{ day: DayOfWeek; period: number } | null>(null)

  const nowMinutes = hours * 60 + curMinutes

  const get = (day: DayOfWeek, p: number): TimetableEntry | undefined =>
    entries.find((e) => e.day === day && e.period === p)

  const isPast = (dayIdx: number, period: number): boolean => {
    if (dayIdx < dayIndex) return true
    if (dayIdx > dayIndex) return false
    const pt = periodTimes.find((p) => p.period === period)
    if (!pt) return false
    return nowMinutes > timeToMinutes(pt.endTime)
  }

  return (
    <div
      className="h-full p-5 flex flex-col overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3
          className="text-base font-bold flex items-center gap-2"
          style={{ color: '#1a1a2e' }}
        >
          <List size={18} />
          주간 시간표
        </h3>
        <button
          onClick={() => setEditing(!isEditing)}
          className="px-3 py-1 rounded-xl text-xs font-semibold transition-all"
          style={
            isEditing
              ? { background: theme.accent, color: '#fff' }
              : { color: '#999' }
          }
        >
          {isEditing ? '완료' : <MoreHorizontal size={16} />}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '5px' }}>
          <thead>
            <tr>
              <th style={{ width: '48px' }} />
              {DAYS.map((d) => {
                const isToday = dayIndex === d.idx
                return (
                  <th
                    key={d.key}
                    className="text-center text-sm font-semibold py-2 rounded-xl"
                    style={
                      isToday
                        ? {
                            background: '#1f2937',
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }
                        : { color: '#999' }
                    }
                  >
                    {d.label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {periodTimes.map((pt) => (
              <tr key={pt.period}>
                <td
                  className="text-center"
                  style={{ fontSize: '11px', color: '#999', lineHeight: '1.2' }}
                >
                  <div className="font-semibold">{pt.period}</div>
                  <div style={{ color: '#ccc', fontSize: '10px' }}>{pt.startTime}</div>
                </td>
                {DAYS.map((d) => {
                  const entry = get(d.key, pt.period)
                  const isCur = dayIndex === d.idx && currentPeriod === pt.period
                  const past = isPast(d.idx, pt.period)
                  const editing = editCell?.day === d.key && editCell?.period === pt.period

                  let cellStyle: React.CSSProperties = {
                    height: '48px',
                    cursor: isEditing ? 'pointer' : 'default',
                    transition: 'all 0.2s ease'
                  }

                  if (isCur) {
                    cellStyle = {
                      ...cellStyle,
                      background: theme.accent,
                      color: '#ffffff',
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      outline: '4px solid white'
                    }
                  } else if (past) {
                    cellStyle = {
                      ...cellStyle,
                      background: 'rgba(229,231,235,0.5)',
                      color: 'rgba(156,163,175,0.6)'
                    }
                  } else if (entry) {
                    cellStyle = {
                      ...cellStyle,
                      background: entry.color
                    }
                  } else {
                    cellStyle = {
                      ...cellStyle,
                      background: 'rgba(243,244,246,0.5)'
                    }
                  }

                  return (
                    <td
                      key={`${d.key}-${pt.period}`}
                      className="text-center rounded-xl"
                      style={cellStyle}
                      onClick={() => {
                        if (!isEditing) return
                        if (entry) removeEntry(d.key, pt.period)
                        else setEditCell({ day: d.key, period: pt.period })
                      }}
                    >
                      {editing ? (
                        <CellEditor
                          day={d.key}
                          period={pt.period}
                          onSave={(e) => {
                            addEntry(e)
                            setEditCell(null)
                          }}
                          onCancel={() => setEditCell(null)}
                        />
                      ) : entry ? (
                        <span
                          className="text-sm font-bold"
                          style={{ color: isCur ? '#ffffff' : past ? 'rgba(156,163,175,0.6)' : '#333' }}
                        >
                          {entry.subject ? `${entry.subject} ` : ''}
                          {entry.className}
                        </span>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
