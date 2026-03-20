import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { CalendarDays, Utensils, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import { DdayEditModal } from '../modals/DdayEditModal'
import { MealEditModal } from '../modals/MealEditModal'
import type { DdayItem, MealData } from '../../types'

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateStringFromOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateYYYYMMDDFromOffset(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

function formatDateLabel(offset: number): string {
  if (offset === 0) return '오늘'
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[d.getDay()]
  return `${month}/${day}(${weekday})`
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
  const schoolCode = useSettingsStore((s) => s.settings.schoolCode)
  const region = useSettingsStore((s) => s.settings.region)
  const neisApiKey = useSettingsStore((s) => s.settings.neisApiKey)
  const theme = THEMES[themeKey]

  const [ddays, setDdays] = useState<DdayItem[]>([])
  const [meal, setMeal] = useState<MealData | null>(null)
  const [ddayModalOpen, setDdayModalOpen] = useState(false)
  const [mealModalOpen, setMealModalOpen] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [mealDateOffset, setMealDateOffset] = useState(0)

  const loadData = useCallback(async (): Promise<void> => {
    const storedDdays = await window.api.loadStore('ddays')
    if (storedDdays && Array.isArray(storedDdays)) setDdays(storedDdays as DdayItem[])

    const storedMeal = await window.api.loadStore('meal')
    if (storedMeal && typeof storedMeal === 'object' && 'date' in (storedMeal as MealData)) {
      const m = storedMeal as MealData
      if (m.date === todayString() && m.menu.length > 0) {
        setMeal(m)
        return
      }
    }
    setMeal(null)
  }, [])

  const fetchMealForDate = useCallback(async (offset: number): Promise<void> => {
    if (!schoolCode) return

    setFetching(true)
    try {
      const dateStr = dateStringFromOffset(offset)
      const dateYMD = dateYYYYMMDDFromOffset(offset)
      const result = await window.api.fetchMeal(schoolCode, region, dateYMD, neisApiKey)
      if (result && result.menu.length > 0) {
        const mealData: MealData = {
          date: dateStr,
          menu: result.menu,
          calories: result.calories,
          source: 'auto'
        }
        setMeal(mealData)
        // Only persist if it's today's meal
        if (offset === 0) {
          await window.api.saveStore('meal', mealData)
        }
      } else {
        setMeal(null)
      }
    } catch {
      setMeal(null)
    } finally {
      setFetching(false)
    }
  }, [schoolCode, region, neisApiKey])

  const autoFetchMeal = useCallback(async (): Promise<void> => {
    await fetchMealForDate(0)
  }, [fetchMealForDate])

  useEffect(() => {
    const init = async (): Promise<void> => {
      await loadData()
    }
    init()
  }, [loadData])

  useEffect(() => {
    if (meal === null && schoolCode && mealDateOffset === 0) {
      autoFetchMeal()
    }
  }, [meal, schoolCode, autoFetchMeal, mealDateOffset])

  const handleDdayClose = (): void => { setDdayModalOpen(false); setTimeout(() => { loadData() }, 150) }
  const handleMealClose = (): void => { setMealModalOpen(false); setTimeout(() => { loadData() }, 150) }

  const handleRefresh = (e: React.MouseEvent): void => {
    e.stopPropagation()
    fetchMealForDate(mealDateOffset)
  }

  const handleMealPrev = (e: React.MouseEvent): void => {
    e.stopPropagation()
    const newOffset = mealDateOffset - 1
    setMealDateOffset(newOffset)
    fetchMealForDate(newOffset)
  }

  const handleMealNext = (e: React.MouseEvent): void => {
    e.stopPropagation()
    const newOffset = mealDateOffset + 1
    setMealDateOffset(newOffset)
    fetchMealForDate(newOffset)
  }

  const handleMealToday = (e: React.MouseEvent): void => {
    e.stopPropagation()
    setMealDateOffset(0)
    fetchMealForDate(0)
  }

  const mainDday = ddays[0]
  const mainDiff = mainDday ? calcD(mainDday.targetDate) : null

  return (
    <>
      <div className="h-full flex flex-col gap-2">

        {/* ===== D-Day 카드 ===== */}
        <div
          className="p-3 shrink-0"
          style={{
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.04)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            cursor: 'pointer'
          }}
          onClick={() => setDdayModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: mainDday ? theme.bg : '#f3f4f6' }}>
                <CalendarDays size={12} style={{ color: mainDday ? theme.primary : '#bbb' }} />
              </div>
              <div>
                <div className="text-[9px] font-medium" style={{ color: '#aaa' }}>D-DAY</div>
                <div className="text-xs font-bold" style={{ color: '#333' }}>
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
                    <span className="text-[10px]" style={{ color: '#999' }}>{item.title}</span>
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: ddayColor(d) }}>{ddayLabel(d)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ===== 급식 카드 ===== */}
        <div
          className="flex-1 p-3 flex flex-col relative overflow-hidden min-h-0"
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
          <div className="flex items-center justify-between mb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.8)' }}>
                <Utensils size={12} style={{ color: theme.primary }} />
              </div>
              <span className="text-xs font-bold" style={{ color: theme.primary }}>급식</span>
              {meal && (
                <span
                  className="text-[8px] font-bold px-1 py-0.5 rounded-full"
                  style={{
                    background: meal.source === 'auto' ? '#dbeafe' : '#fef3c7',
                    color: meal.source === 'auto' ? '#2563eb' : '#d97706'
                  }}
                >
                  {meal.source === 'auto' ? '자동' : '수동'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {schoolCode && (
                <button
                  onClick={handleRefresh}
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    borderRadius: '6px',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: fetching ? 0.5 : 1,
                    transition: 'opacity 0.2s'
                  }}
                  title="급식 새로고침"
                >
                  <RefreshCw
                    size={10}
                    style={{
                      color: theme.primary,
                      animation: fetching ? 'spin 1s linear infinite' : 'none'
                    }}
                  />
                </button>
              )}
              {meal?.calories && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.8)', color: theme.primary }}>
                  {meal.calories}
                </span>
              )}
            </div>
          </div>

          {/* Date navigation */}
          <div className="flex items-center justify-center gap-2 mb-2 shrink-0">
            <button
              onClick={handleMealPrev}
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: 'none',
                borderRadius: '6px',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={12} style={{ color: '#666' }} />
            </button>
            <button
              onClick={handleMealToday}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
              style={{
                background: mealDateOffset === 0 ? theme.accent : 'rgba(255,255,255,0.7)',
                color: mealDateOffset === 0 ? '#fff' : '#666',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {formatDateLabel(mealDateOffset)}
            </button>
            <button
              onClick={handleMealNext}
              style={{
                background: 'rgba(255,255,255,0.7)',
                border: 'none',
                borderRadius: '6px',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={12} style={{ color: '#666' }} />
            </button>
          </div>

          {/* 메뉴 목록 */}
          {fetching ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <RefreshCw size={18} style={{ color: theme.border, animation: 'spin 1s linear infinite' }} />
              <span className="text-xs font-medium" style={{ color: '#bbb' }}>
                가져오는 중...
              </span>
            </div>
          ) : meal && meal.menu.length > 0 ? (
            <div className="flex-1 overflow-auto space-y-1">
              {meal.menu.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 py-0.5">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: theme.accent }} />
                  <span className="text-xs font-medium" style={{ color: '#333' }}>{item}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              <Utensils size={20} style={{ color: theme.border }} />
              <span className="text-xs font-medium" style={{ color: '#bbb' }}>
                {schoolCode ? '급식 정보 없음' : '클릭하여 입력'}
              </span>
            </div>
          )}

          {/* 워터마크 */}
          <Utensils size={60} style={{
            position: 'absolute', bottom: '-8px', right: '-8px',
            opacity: 0.04, color: theme.primary, pointerEvents: 'none',
            transform: 'rotate(-15deg)'
          }} />
        </div>
      </div>

      <DdayEditModal open={ddayModalOpen} onClose={handleDdayClose} />
      <MealEditModal open={mealModalOpen} onClose={handleMealClose} />

      {/* spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
