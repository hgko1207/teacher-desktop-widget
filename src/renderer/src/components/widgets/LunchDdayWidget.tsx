import { useState, useEffect, type ReactNode } from 'react'
import { CalendarDays, Utensils, Plus } from 'lucide-react'
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
  return '#1a1a2e'
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
    if (storedDdays && Array.isArray(storedDdays)) {
      setDdays(storedDdays as DdayItem[])
    }
    const storedMeal = await window.api.loadStore('meal')
    if (storedMeal && typeof storedMeal === 'object' && 'date' in (storedMeal as MealData)) {
      const m = storedMeal as MealData
      if (m.date === todayString() && m.menu.length > 0) {
        setMeal(m)
      } else {
        setMeal(null)
      }
    }
  }

  useEffect(() => { loadData() }, [])

  // 모달 닫힐 때 약간의 딜레이 후 리로드 (저장 완료 대기)
  const handleDdayClose = (): void => {
    setDdayModalOpen(false)
    setTimeout(() => { loadData() }, 100)
  }
  const handleMealClose = (): void => {
    setMealModalOpen(false)
    setTimeout(() => { loadData() }, 100)
  }

  const mainDday = ddays[0]
  const diff = mainDday ? calcD(mainDday.targetDate) : null

  return (
    <>
      <div className="h-full flex flex-col gap-3">
        {/* D-Day - 컴팩트하게 */}
        <div
          className="p-4 flex items-center justify-between shrink-0"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            minHeight: '70px'
          }}
          onClick={() => setDdayModalOpen(true)}
        >
          <div className="flex items-center gap-2">
            <CalendarDays size={16} style={{ color: theme.primary }} />
            <span className="text-xs font-semibold" style={{ color: '#888' }}>
              {mainDday ? mainDday.title : 'D-Day 추가'}
            </span>
          </div>
          {mainDday && diff !== null ? (
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: ddayColor(diff) }}>
              {ddayLabel(diff)}
            </span>
          ) : (
            <Plus size={18} style={{ color: '#ccc' }} />
          )}
        </div>

        {/* 추가 D-Day 목록 (2~3개) */}
        {ddays.length > 1 && (
          <div className="px-2 space-y-1 shrink-0">
            {ddays.slice(1, 4).map((item) => {
              const d = calcD(item.targetDate)
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#999' }}>{item.title}</span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: ddayColor(d) }}>
                    {ddayLabel(d)}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* 급식 - 메인 영역 */}
        <div
          className="flex-1 p-4 flex flex-col relative overflow-hidden min-h-0"
          style={{
            background: theme.bg,
            borderRadius: '20px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
          onClick={() => setMealModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Utensils size={14} style={{ color: theme.primary }} />
              <span className="text-xs font-bold" style={{ color: theme.primary }}>오늘의 급식</span>
            </div>
            {meal?.calories && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.7)', color: '#888' }}>
                {meal.calories}
              </span>
            )}
          </div>

          {meal && meal.menu.length > 0 ? (
            <div className="flex-1 overflow-auto">
              {meal.menu.map((item, i) => (
                <div key={i} className="text-xs py-0.5" style={{ color: '#444' }}>• {item}</div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs" style={{ color: '#aaa' }}>클릭하여 급식 메뉴를 입력하세요</span>
            </div>
          )}

          <Utensils size={70} style={{
            position: 'absolute', bottom: '-8px', right: '-8px',
            opacity: 0.04, color: theme.primary, pointerEvents: 'none'
          }} />
        </div>
      </div>

      <DdayEditModal open={ddayModalOpen} onClose={handleDdayClose} />
      <MealEditModal open={mealModalOpen} onClose={handleMealClose} />
    </>
  )
}
