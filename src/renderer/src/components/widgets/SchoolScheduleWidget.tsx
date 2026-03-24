import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { ScheduleEvent } from '../../types'

const CACHE_MS = 24 * 60 * 60 * 1000 // 1 day
const CARD = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '16px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

interface ScheduleCache {
  events: ScheduleEvent[]
  fetchedAt: number
}

export function SchoolScheduleWidget(): ReactNode {
  const schoolCode = useSettingsStore((s) => s.settings.schoolCode)
  const eduCode = useSettingsStore((s) => s.settings.eduCode)
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(false)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const todayStr = `${year}${String(month).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`

  const load = useCallback(async (): Promise<void> => {
    console.log('[schedule] schoolCode:', schoolCode, 'eduCode:', eduCode)
    if (!schoolCode || !eduCode) return
    try {
      // Check cache
      const cached = await window.api.loadStore('scheduleCache')
      if (cached && typeof cached === 'object') {
        const c = cached as ScheduleCache
        if (Date.now() - c.fetchedAt < CACHE_MS && c.events.length > 0) {
          setEvents(c.events)
          return
        }
      }
      setLoading(true)
      const result = await window.api.fetchSchedule(schoolCode, eduCode, year, month)
      setEvents(result)
      const cacheData: ScheduleCache = { events: result, fetchedAt: Date.now() }
      await window.api.saveStore('scheduleCache', cacheData)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [schoolCode, eduCode, year, month])

  useEffect(() => {
    load()
  }, [load])

  // 이번 달 전체 표시 (과거 일정도 포함)
  const upcoming = events

  return (
    <div className="h-full flex flex-col" style={{ ...CARD, padding: '14px' }}>
      <div className="flex items-center gap-1.5 shrink-0" style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '14px' }}>📅</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>학사 일정</span>
        <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8', marginLeft: '4px' }}>{month}월</span>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>로딩중...</span>
          </div>
        ) : !schoolCode ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>설정에서 학교를 선택하세요</span>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>이번 달 일정 없음</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {upcoming.map((e, i) => {
              const mm = e.date.slice(4, 6)
              const dd = e.date.slice(6, 8)
              const isPast = e.date < todayStr
              return (
                <div key={`${e.date}-${i}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 6px',
                  borderRadius: '8px',
                  background: e.isHoliday ? 'rgba(254,226,226,0.5)' : 'transparent',
                  opacity: isPast ? 0.4 : 1
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: e.isHoliday ? '#dc2626' : '#64748b',
                    minWidth: '36px',
                    flexShrink: 0
                  }}>
                    {parseInt(mm, 10)}/{parseInt(dd, 10)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: e.isHoliday ? '#dc2626' : '#334155',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {e.eventName}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
