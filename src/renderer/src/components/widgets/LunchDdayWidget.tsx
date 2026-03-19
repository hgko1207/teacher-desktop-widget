import { type ReactNode } from 'react'
import { CalendarDays, Utensils } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

export function LunchDdayWidget(): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  // D-Day 계산 (방학까지 - 예시: 2026년 7월 25일)
  const targetDate = new Date('2026-07-25')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const ddayText = diffDays > 0 ? `D-${diffDays}` : diffDays === 0 ? 'D-Day' : `D+${Math.abs(diffDays)}`

  // 급식 메뉴 (예시 데이터)
  const mealMenu = '잡곡밥, 미역국, 돈까스, 샐러드, 배추김치, 딸기'

  return (
    <div className="h-full flex flex-col gap-3">
      {/* D-Day */}
      <div
        className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} style={{ color: theme.primary }} />
          <span className="text-xs font-medium" style={{ color: '#888' }}>여름방학까지</span>
        </div>
        <span className="text-3xl font-extrabold" style={{ color: '#1a1a2e' }}>
          {ddayText}
        </span>
      </div>

      {/* 급식 */}
      <div
        className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden"
        style={{
          background: theme.bg,
          borderRadius: '24px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        <div className="flex items-center gap-2">
          <Utensils size={16} style={{ color: theme.primary }} />
          <span className="text-xs font-medium" style={{ color: theme.primary }}>오늘의 급식</span>
        </div>
        <p className="text-xs leading-relaxed mt-1" style={{ color: '#555' }}>
          {mealMenu}
        </p>
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
  )
}
