import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { CalendarDays, Utensils } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import { DdayEditModal } from '../modals/DdayEditModal'
import { MealEditModal } from '../modals/MealEditModal'
import type { DdayItem, MealData } from '../../types'

function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function calcDdays(targetDate: string): number {
  const target = new Date(targetDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function ddayText(diff: number): string {
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

  const loadData = useCallback(async (): Promise<void> => {
    const storedDdays = await window.api.loadStore('ddays') as DdayItem[] | null
    if (storedDdays && Array.isArray(storedDdays)) {
      setDdays(storedDdays)
    }
    const storedMeal = await window.api.loadStore('meal') as MealData | null
    if (storedMeal && storedMeal.date === todayString()) {
      setMeal(storedMeal)
    } else {
      setMeal(null)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reload data when modals close
  const handleDdayClose = (): void => {
    setDdayModalOpen(false)
    loadData()
  }

  const handleMealClose = (): void => {
    setMealModalOpen(false)
    loadData()
  }

  // D-Day display
  const mainDday = ddays.length > 0 ? ddays[0] : null
  const diff = mainDday ? calcDdays(mainDday.targetDate) : null

  // Meal display
  const hasMeal = meal !== null && meal.menu.length > 0
  const mealDisplay = hasMeal ? meal.menu.join(', ') : null

  return (
    <>
      <div className="h-full flex flex-col gap-3">
        {/* D-Day */}
        <div
          className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
          onClick={() => setDdayModalOpen(true)}
        >
          <div className="flex items-center gap-2">
            <CalendarDays size={16} style={{ color: theme.primary }} />
            <span className="text-xs font-medium" style={{ color: '#888' }}>
              {mainDday ? mainDday.title : 'D-Day'}
            </span>
          </div>
          {mainDday && diff !== null ? (
            <span
              className="text-3xl font-extrabold"
              style={{ color: ddayColor(diff) }}
            >
              {ddayText(diff)}
            </span>
          ) : (
            <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>
              클릭하여 D-Day를 추가하세요
            </span>
          )}
        </div>

        {/* 급식 */}
        <div
          className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: theme.bg,
            borderRadius: '24px',
            border: `1px solid ${theme.border}`,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
          onClick={() => setMealModalOpen(true)}
        >
          <div className="flex items-center gap-2">
            <Utensils size={16} style={{ color: theme.primary }} />
            <span className="text-xs font-medium" style={{ color: theme.primary }}>오늘의 급식</span>
            {hasMeal && meal.calories && (
              <span
                className="ml-auto text-xs"
                style={{ color: '#9ca3af' }}
              >
                {meal.calories}
              </span>
            )}
          </div>
          {hasMeal ? (
            <p className="text-xs leading-relaxed mt-1" style={{ color: '#555' }}>
              {mealDisplay}
            </p>
          ) : (
            <span className="text-xs font-medium mt-1" style={{ color: '#9ca3af' }}>
              클릭하여 급식 메뉴를 입력하세요
            </span>
          )}
          <Utensils
            size={80}
            style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              opacity: 0.05,
              color: theme.primary
            }}
          />
        </div>
      </div>

      <DdayEditModal open={ddayModalOpen} onClose={handleDdayClose} />
      <MealEditModal open={mealModalOpen} onClose={handleMealClose} />
    </>
  )
}
