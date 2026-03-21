import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Utensils, ChevronRight, ChevronLeft, RefreshCw } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { MealEditModal } from '../modals/MealEditModal'
import type { MealData } from '../../types'

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

export function MealCard(): ReactNode {
  const schoolCode = useSettingsStore((s) => s.settings.schoolCode)
  const region = useSettingsStore((s) => s.settings.region)
  const neisApiKey = useSettingsStore((s) => s.settings.neisApiKey)
  const eduCode = useSettingsStore((s) => s.settings.eduCode)

  const [meal, setMeal] = useState<MealData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [mealDateOffset, setMealDateOffset] = useState(0)

  const loadData = useCallback(async (): Promise<void> => {
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
      const result = await window.api.fetchMeal(schoolCode, region, dateYMD, neisApiKey, eduCode)
      if (result && result.menu.length > 0) {
        const mealData: MealData = {
          date: dateStr,
          menu: result.menu,
          calories: result.calories,
          source: 'auto'
        }
        setMeal(mealData)
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
  }, [schoolCode, region, neisApiKey, eduCode])

  const autoFetchMeal = useCallback(async (): Promise<void> => {
    await fetchMealForDate(0)
  }, [fetchMealForDate])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    if (meal === null && schoolCode && mealDateOffset === 0) {
      autoFetchMeal()
    }
  }, [meal, schoolCode, autoFetchMeal, mealDateOffset])

  const handleClose = (): void => { setModalOpen(false); setTimeout(() => { loadData() }, 150) }

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

  return (
    <>
      <div
        className="h-full flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(255,247,237,0.3))',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(226,232,240,0.6)',
          borderRadius: '16px',
          boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)',
          padding: '16px',
          cursor: 'pointer',
          transition: 'filter 0.15s'
        }}
        onClick={() => setModalOpen(true)}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.97)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center shrink-0" style={{ marginBottom: '10px' }}>
          <div className="flex items-center gap-2">
            <Utensils size={16} style={{ color: '#fb923c' }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>오늘의 급식</span>
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
                    color: '#fb923c',
                    animation: fetching ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </button>
            )}
            <span style={{ fontSize: '10px', fontWeight: 500, color: '#ea580c', background: '#fed7aa', padding: '2px 8px', borderRadius: '9999px' }}>중식</span>
          </div>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-center gap-2 mb-2 shrink-0">
          <button
            onClick={handleMealPrev}
            style={{
              background: 'rgba(255,247,237,0.6)',
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
              background: mealDateOffset === 0 ? '#fb923c' : 'rgba(255,247,237,0.6)',
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
              background: 'rgba(255,247,237,0.6)',
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

        {/* Menu list */}
        {fetching ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <RefreshCw size={18} style={{ color: '#fed7aa', animation: 'spin 1s linear infinite' }} />
            <span className="text-xs font-medium" style={{ color: '#bbb' }}>가져오는 중...</span>
          </div>
        ) : meal && meal.menu.length > 0 ? (
          <>
            <div className="flex-1 flex flex-col justify-center items-center overflow-auto">
              {meal.menu.map((item, i) => (
                <div key={i} style={{
                  fontSize: i < 2 ? '14px' : '13px',
                  fontWeight: i < 2 ? 800 : 600,
                  color: i < 2 ? '#1e293b' : '#475569',
                  textAlign: 'center' as const,
                  paddingBottom: '6px',
                  marginBottom: '6px',
                  borderBottom: i < meal.menu.length - 1 ? '1px solid rgba(255,237,213,0.5)' : 'none',
                  width: '100%'
                }}>
                  {item}
                </div>
              ))}
            </div>
            {meal.calories && (
              <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '8px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' as const }} className="shrink-0">
                {meal.calories}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <Utensils size={20} style={{ color: '#fed7aa' }} />
            <span className="text-xs font-medium" style={{ color: '#bbb' }}>
              {schoolCode ? '급식 정보 없음' : '클릭하여 입력'}
            </span>
          </div>
        )}
      </div>

      <MealEditModal open={modalOpen} onClose={handleClose} />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
