import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import { DdayEditModal } from '../modals/DdayEditModal'
import type { DdayItem } from '../../types'

function calcD(targetDate: string): number {
  const t = new Date(targetDate), today = new Date()
  t.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - today.getTime()) / 86400000)
}

function ddayLabel(diff: number): string {
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return 'D-Day!'
  return `D+${Math.abs(diff)}`
}

function ddayColor(diff: number): string {
  if (diff <= 0) return '#ef4444'
  if (diff <= 7) return '#ef4444'
  if (diff <= 30) return '#f59e0b'
  return '#6366f1'
}

export function DdayCompact(): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]
  const [ddays, setDdays] = useState<DdayItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async (): Promise<void> => {
    const storedDdays = await window.api.loadStore('ddays')
    if (storedDdays && Array.isArray(storedDdays)) setDdays(storedDdays as DdayItem[])
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleClose = (): void => { setModalOpen(false); setTimeout(() => { loadData() }, 150) }

  const mainDday = ddays[0]
  const mainDiff = mainDday ? calcD(mainDday.targetDate) : null

  return (
    <>
      <div
        className="h-full"
        style={{
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(226,232,240,0.6)',
          borderRadius: '16px',
          boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)',
          cursor: 'pointer',
          padding: '16px',
          transition: 'filter 0.15s'
        }}
        onClick={() => setModalOpen(true)}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.97)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} style={{ color: mainDday ? theme.primary : '#bbb' }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>D-DAY</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#333' }}>
                {mainDday ? mainDday.title : 'D-Day 추가하기'}
              </div>
            </div>
          </div>
          {mainDday && mainDiff !== null ? (
            <span className="text-xl font-black tabular-nums" style={{ color: ddayColor(mainDiff) }}>
              {ddayLabel(mainDiff)}
            </span>
          ) : (
            <ChevronRight size={14} style={{ color: '#ccc' }} />
          )}
        </div>

        {ddays.length > 1 && (
          <div className="mt-1.5 pt-1.5 flex flex-col gap-0.5" style={{ borderTop: '1px solid #f0f0f0' }}>
            {ddays.slice(1, 3).map((item) => {
              const d = calcD(item.targetDate)
              return (
                <div key={item.id} className="flex items-center justify-between px-1">
                  <span className="text-xs" style={{ color: '#666' }}>{item.title}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: ddayColor(d) }}>{ddayLabel(d)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <DdayEditModal open={modalOpen} onClose={handleClose} />
    </>
  )
}
