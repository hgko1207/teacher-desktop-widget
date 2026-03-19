import { useState, useEffect, type ReactNode } from 'react'
import { CalendarDays, Utensils, ChevronRight } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import { DdayEditModal } from '../modals/DdayEditModal'
import { MealEditModal } from '../modals/MealEditModal'
import type { DdayItem, MealData } from '../../types'

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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

export function LunchDdayWidget(): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [ddays, setDdays] = useState<DdayItem[]>([])
  const [meal, setMeal] = useState<MealData | null>(null)
  const [ddayModalOpen, setDdayModalOpen] = useState(false)
  const [mealModalOpen, setMealModalOpen] = useState(false)

  const loadData = async (): Promise<void> => {
    const storedDdays = await window.api.loadStore('ddays')
    if (storedDdays && Array.isArray(storedDdays)) setDdays(storedDdays as DdayItem[])

    const storedMeal = await window.api.loadStore('meal')
    if (storedMeal && typeof storedMeal === 'object' && 'date' in (storedMeal as MealData)) {
      const m = storedMeal as MealData
      if (m.date === todayString() && m.menu.length > 0) setMeal(m)
      else setMeal(null)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleDdayClose = (): void => { setDdayModalOpen(false); setTimeout(loadData, 150) }
  const handleMealClose = (): void => { setMealModalOpen(false); setTimeout(loadData, 150) }

  const mainDday = ddays[0]
  const mainDiff = mainDday ? calcD(mainDday.targetDate) : null

  return (
    <>
      <div className="h-full flex flex-col gap-3">

        {/* ===== D-Day 카드 ===== */}
        <div
          className="p-4 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
          onClick={() => setDdayModalOpen(true)}
        >
          {/* 메인 D-Day */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: mainDday ? theme.bg : '#f3f4f6' }}>
                <CalendarDays size={14} style={{ color: mainDday ? theme.primary : '#bbb' }} />
              </div>
              <div>
                <div className="text-[10px] font-medium" style={{ color: '#aaa' }}>D-DAY</div>
                <div className="text-sm font-bold" style={{ color: '#333' }}>
                  {mainDday ? mainDday.title : 'D-Day 추가하기'}
                </div>
              </div>
            </div>
            {mainDday && mainDiff !== null ? (
              <span className="text-2xl font-black tabular-nums" style={{ color: ddayColor(mainDiff) }}>
                {ddayLabel(mainDiff)}
              </span>
            ) : (
              <ChevronRight size={16} style={{ color: '#ccc' }} />
            )}
          </div>

          {/* 서브 D-Day */}
          {ddays.length > 1 && (
            <div className="mt-2 pt-2 flex flex-col gap-1" style={{ borderTop: '1px solid #f0f0f0' }}>
              {ddays.slice(1, 3).map((item) => {
                const d = calcD(item.targetDate)
                return (
                  <div key={item.id} className="flex items-center justify-between px-1">
                    <span className="text-[11px]" style={{ color: '#999' }}>{item.title}</span>
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: ddayColor(d) }}>{ddayLabel(d)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ===== 급식 카드 ===== */}
        <div
          className="flex-1 p-5 flex flex-col relative overflow-hidden min-h-0"
          style={{
            background: `linear-gradient(145deg, ${theme.bg}, #ffffff)`,
            borderRadius: '20px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
          onClick={() => setMealModalOpen(true)}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.8)' }}>
                <Utensils size={14} style={{ color: theme.primary }} />
              </div>
              <span className="text-sm font-bold" style={{ color: theme.primary }}>오늘의 급식</span>
            </div>
            {meal?.calories && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.8)', color: theme.primary }}>
                {meal.calories}
              </span>
            )}
          </div>

          {/* 메뉴 목록 */}
          {meal && meal.menu.length > 0 ? (
            <div className="flex-1 overflow-auto space-y-1.5">
              {meal.menu.map((item, i) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: theme.accent }} />
                  <span className="text-sm font-medium" style={{ color: '#333' }}>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Utensils size={28} style={{ color: theme.border }} />
              <span className="text-sm font-medium" style={{ color: '#bbb' }}>
                클릭하여 급식을 입력하세요
              </span>
            </div>
          )}

          {/* 워터마크 */}
          <Utensils size={90} style={{
            position: 'absolute', bottom: '-12px', right: '-12px',
            opacity: 0.04, color: theme.primary, pointerEvents: 'none',
            transform: 'rotate(-15deg)'
          }} />
        </div>
      </div>

      <DdayEditModal open={ddayModalOpen} onClose={handleDdayClose} />
      <MealEditModal open={mealModalOpen} onClose={handleMealClose} />
    </>
  )
}
