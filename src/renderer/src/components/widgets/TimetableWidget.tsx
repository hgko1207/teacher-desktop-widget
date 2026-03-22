import { type ReactNode, useState, useCallback } from 'react'
import { List, MoreHorizontal, Download, Loader2 } from 'lucide-react'
import { useTimetableStore, getClassColor } from '../../stores/timetableStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { useCurrentPeriod } from '../../hooks/useCurrentPeriod'
import { THEMES } from '../../config/themes'
import type { DayOfWeek, TimetableEntry } from '../../types'

const SUBJECT_COLORS: string[] = [
  '#FFD4D4', '#FFE4C8', '#E8D4FF', '#D4E8FF', '#D4FFD4',
  '#FFF4D4', '#FFD4F0', '#D4FFF4', '#F4FFD4', '#D4DFFF',
  '#E8FFD4', '#FFE8D4', '#D4FFE8', '#F0D4FF', '#FFFDD4'
]

function getSubjectColor(subject: string): string {
  let hash = 0
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash)
  }
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
}


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
  mode,
  onSave,
  onCancel
}: {
  day: DayOfWeek
  period: number
  mode: 'class' | 'subject'
  onSave: (e: TimetableEntry) => void
  onCancel: () => void
}): ReactNode {
  const [val, setVal] = useState('')
  const submit = (): void => {
    if (!val.trim()) { onCancel(); return }
    const trimmed = val.trim()
    onSave({
      day,
      period,
      className: mode === 'class' ? trimmed : '',
      subject: mode === 'subject' ? trimmed : '',
      room: '',
      color: getClassColor(trimmed)
    })
  }
  return (
    <input
      autoFocus
      className="w-full h-full text-center text-sm font-semibold outline-none rounded-xl"
      style={{ border: '2px solid #818cf8', background: '#fff' }}
      placeholder={mode === 'class' ? '반 (예: 1-4)' : '과목 (예: 국어)'}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel() }}
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
  const setEntries = useTimetableStore((s) => s.setEntries)
  const addEntry = useTimetableStore((s) => s.addEntry)
  const removeEntry = useTimetableStore((s) => s.removeEntry)
  const periodTimes = useSettingsStore((s) => s.settings.periodTimes)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const comciganCode = useSettingsStore((s) => s.settings.comciganCode)
  const grade = useSettingsStore((s) => s.settings.grade)
  const classNum = useSettingsStore((s) => s.settings.classNum)
  const timetableMode = useSettingsStore((s) => s.settings.timetableMode)
  const theme = THEMES[themeKey]
  const { hours, minutes: curMinutes, dayIndex } = useCurrentTime()
  const { currentPeriod } = useCurrentPeriod()
  const [editCell, setEditCell] = useState<{ day: DayOfWeek; period: number } | null>(null)
  const [fetchingTimetable, setFetchingTimetable] = useState(false)

  const handleFetchTimetable = useCallback(async (): Promise<void> => {
    if (!comciganCode) return
    setFetchingTimetable(true)
    try {
      const results = await window.api.fetchTimetableComcigan(comciganCode, grade, classNum)
      if (results.length > 0) {
        const newEntries: TimetableEntry[] = []
        for (const r of results) {
          if (r.day === 'mon' || r.day === 'tue' || r.day === 'wed' || r.day === 'thu' || r.day === 'fri') {
            newEntries.push({
              day: r.day,
              period: r.period,
              className: '',
              subject: r.subject,
              room: r.teacher,
              color: getSubjectColor(r.subject)
            })
          }
        }
        setEntries(newEntries)
      }
    } catch {
      // silently fail
    } finally {
      setFetchingTimetable(false)
    }
  }, [comciganCode, grade, classNum, setEntries])

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
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(226,232,240,0.6)',
        borderRadius: '16px',
        boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)',
        padding: '16px'
      }}
    >
      <div className="flex justify-between items-center shrink-0" style={{ marginBottom: '10px' }}>
        <div className="flex items-center gap-2">
          <List size={16} style={{ color: '#6366f1' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>주간 시간표</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {comciganCode > 0 && (
            <button
              onClick={handleFetchTimetable}
              disabled={fetchingTimetable}
              style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.primary,
                cursor: fetchingTimetable ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                opacity: fetchingTimetable ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              title="시간표 자동 불러오기"
            >
              {fetchingTimetable ? (
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={12} />
              )}
              {fetchingTimetable ? '불러오는 중...' : '자동불러오기'}
            </button>
          )}
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
      </div>

      <div className="flex-1 overflow-auto">
        {/* CSS Grid 기반 시간표 (정사각형 셀) */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(5, 1fr)', gap: '5px' }}>
          {/* 헤더 행 */}
          <div />
          {DAYS.map((d) => {
            const isToday = dayIndex === d.idx
            return (
              <div
                key={d.key}
                className="text-center py-2 rounded-xl"
                style={
                  isToday
                    ? { background: '#1f2937', color: '#ffffff', fontSize: '13px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                    : { color: '#999', fontSize: '13px', fontWeight: 700 }
                }
              >
                {d.label}
              </div>
            )
          })}

          {/* 교시 행 */}
          {periodTimes.map((pt) => (
            <div key={pt.period} style={{ display: 'contents' }}>
              <div className="flex flex-col items-center justify-center" style={{ color: '#999', lineHeight: '1.2' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{pt.period}</div>
                <div style={{ color: '#ccc', fontSize: '10px' }}>{pt.startTime}</div>
              </div>
              {DAYS.map((d) => {
                const entry = get(d.key, pt.period)
                const isCur = dayIndex === d.idx && currentPeriod === pt.period
                const past = isPast(d.idx, pt.period)
                const editing = editCell?.day === d.key && editCell?.period === pt.period
                const isToday = dayIndex === d.idx

                let cellStyle: React.CSSProperties = {
                  aspectRatio: '1',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isEditing ? 'pointer' : 'default',
                  transition: 'all 0.2s ease'
                }

                if (isToday) {
                  cellStyle = { ...cellStyle, background: '#1e293b', color: '#ffffff' }
                  if (isCur && entry) {
                    cellStyle = { ...cellStyle, background: theme.accent, transform: 'scale(1.05)', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', outline: '3px solid white' }
                  }
                } else if (past) {
                  cellStyle = { ...cellStyle, background: 'rgba(229,231,235,0.5)', color: 'rgba(156,163,175,0.6)' }
                } else if (entry) {
                  cellStyle = { ...cellStyle, background: entry.color }
                } else {
                  cellStyle = { ...cellStyle, background: 'rgba(243,244,246,0.5)' }
                }

                return (
                  <div
                    key={`${d.key}-${pt.period}`}
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
                        mode={timetableMode === 'auto' ? 'subject' : timetableMode}
                        onSave={(e) => { addEntry(e); setEditCell(null) }}
                        onCancel={() => setEditCell(null)}
                      />
                    ) : entry ? (
                      <span
                        style={{ fontSize: '13px', fontWeight: 700, color: isToday ? '#ffffff' : past ? 'rgba(156,163,175,0.6)' : '#333' }}
                      >
                        {timetableMode === 'subject'
                          ? (entry.subject || entry.className)
                          : (entry.subject ? `${entry.subject} ` : '') + entry.className}
                      </span>
                      ) : null}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
