import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, Utensils } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { MealData } from '../../types'

interface MealEditModalProps {
  open: boolean
  onClose: () => void
}

function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function MealEditModal({ open, onClose }: MealEditModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [menuText, setMenuText] = useState('')
  const [calories, setCalories] = useState('')

  const loadMeal = useCallback(async (): Promise<void> => {
    const stored = await window.api.loadStore('meal') as MealData | null
    if (stored && stored.date === todayString()) {
      setMenuText(stored.menu.join('\n'))
      setCalories(stored.calories)
    } else {
      setMenuText('')
      setCalories('')
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadMeal()
    }
  }, [open, loadMeal])

  const handleSave = async (): Promise<void> => {
    const menu = menuText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    const data: MealData = {
      date: todayString(),
      menu,
      calories: calories.trim()
    }
    await window.api.saveStore('meal', data)
    onClose()
  }

  if (!open) return null

  const today = todayString()
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6"
        style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Utensils size={20} style={{ color: theme.primary }} />
            <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>급식 메뉴 편집</h2>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: '#f3f4f6' }}
            onClick={onClose}
          >
            <X size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Date display */}
        <div
          className="mb-4 px-4 py-2 rounded-xl text-center"
          style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
        >
          <span className="text-sm font-medium" style={{ color: theme.primary }}>
            {today} ({weekday}요일)
          </span>
        </div>

        {/* Menu textarea */}
        <div className="mb-4">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>
            메뉴 (한 줄에 하나씩)
          </label>
          <textarea
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            placeholder={'현미밥\n미역국\n돈까스\n샐러드\n배추김치\n딸기'}
            rows={6}
            className="w-full px-3 py-2 rounded-lg text-sm resize-none"
            style={{
              border: `1px solid ${theme.border}`,
              outline: 'none',
              lineHeight: '1.8'
            }}
          />
        </div>

        {/* Calories input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#6b7280' }}>
            칼로리
          </label>
          <input
            type="text"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="780 kcal"
            className="w-full px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
        </div>

        {/* Save button */}
        <button
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{
            background: theme.accent,
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          onClick={handleSave}
        >
          저장
        </button>
      </div>
    </div>
  )
}
