import { useEffect, useState, type ReactNode } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { ClockWidget } from './components/widgets/ClockWidget'
import { WeatherWidget } from './components/widgets/WeatherWidget'
import { CurrentClassWidget } from './components/widgets/CurrentClassWidget'
import { TimetableWidget } from './components/widgets/TimetableWidget'
import { TodoWidget } from './components/widgets/TodoWidget'
import { DesktopOrganizer } from './components/widgets/DesktopOrganizer'
import { QuotesOffWorkWidget } from './components/widgets/QuotesOffWorkWidget'
import { DdayCompact } from './components/widgets/DdayCompact'
import { MealCard } from './components/widgets/MealCard'
import { MemoWidget } from './components/widgets/MemoWidget'
import { SmartToolsWidget } from './components/widgets/SmartToolsWidget'
import { SettingsModal } from './components/widgets/SettingsModal'
import { useSettingsStore } from './stores/settingsStore'
import { useTimetableStore } from './stores/timetableStore'
import { useTodoStore } from './stores/todoStore'
import { THEMES } from './config/themes'

const FONT_SIZES = { small: '13px', medium: '14px', large: '16px' }

function App(): ReactNode {
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const loadTimetable = useTimetableStore((s) => s.loadTimetable)
  const loadTodos = useTodoStore((s) => s.loadTodos)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const visibleWidgets = useSettingsStore((s) => s.settings.visibleWidgets)
  const fontSize = useSettingsStore((s) => s.settings.fontSize)
  const theme = THEMES[themeKey]
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    loadSettings()
    loadTimetable()
    loadTodos()
  }, [loadSettings, loadTimetable, loadTodos])

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.bg} 0%, #f8fafc 50%, ${theme.hover} 100%)`,
        fontSize: FONT_SIZES[fontSize] ?? '14px'
      }}
    >
      <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

      {/*
        레이아웃:
        [바탕화면 빠른폴더 320px] | [시계+날짜] [날씨] [현재수업+퇴근타이머] ← 상단 130px
                                  | [시간표 300px] [할일+D-Day+메모] ← 하단 flex
        [명언 + 급식(세로크게) + 스마트도구] ← 우측 280px
      */}
      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0">

        {/* Column 1: Desktop Organizer (320px) */}
        {visibleWidgets.organizer && <DesktopOrganizer />}

        {/* Column 2: Main content (flex-1) */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">

          {/* Top row (130px): Clock | Weather | CurrentClass + OffWork */}
          <div className="flex gap-3 shrink-0" style={{ height: '130px' }}>
            {visibleWidgets.clockWeather && (
              <>
                <div style={{ width: '240px' }} className="shrink-0">
                  <ClockWidget />
                </div>
                <div style={{ width: '200px' }} className="shrink-0">
                  <WeatherWidget />
                </div>
              </>
            )}
            {/* CurrentClass + OffWork timer in a wider combined area */}
            <div className="flex-1 flex gap-3 min-w-0">
              {visibleWidgets.currentClass && (
                <div className="flex-1 min-w-0"><CurrentClassWidget /></div>
              )}
              {visibleWidgets.quotesOffWork && (
                <div className="flex-1 min-w-0"><QuotesOffWorkWidget /></div>
              )}
            </div>
          </div>

          {/* Bottom row (flex-1): Timetable (300px) | Todo + D-Day + Memo column */}
          <div className="flex-1 flex gap-3 min-h-0">

            {/* Timetable (300px fixed) */}
            {visibleWidgets.timetable && (
              <div style={{ width: '300px' }} className="shrink-0 min-h-0">
                <TimetableWidget />
              </div>
            )}

            {/* Todo + D-Day + Memo vertical stack */}
            <div className="flex-1 flex flex-col gap-3 min-h-0 min-w-0">
              {visibleWidgets.todo && (
                <div className="flex-1 min-h-0"><TodoWidget /></div>
              )}
              {visibleWidgets.lunchDday && (
                <div className="shrink-0"><DdayCompact /></div>
              )}
              <div className="shrink-0" style={{ height: '140px' }}>
                <MemoWidget />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Right sidebar (280px) - Quote + Meal + SmartTools */}
        <div style={{ width: '280px' }} className="shrink-0 flex flex-col gap-3 min-h-0">
          {/* Quote card (compact) */}
          {visibleWidgets.quotesOffWork && <QuoteCard />}

          {/* Meal card (tall) */}
          {visibleWidgets.lunchDday && <MealCard />}

          {/* Smart Tools */}
          {visibleWidgets.smartTools && <SmartToolsWidget />}
        </div>
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/** Small quote card for the right column */
function QuoteCard(): ReactNode {
  const [quoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length))

  return (
    <div
      className="shrink-0 p-4 flex items-center gap-3"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <span style={{ fontSize: '24px' }}>💖</span>
      <span className="text-xs font-medium leading-relaxed" style={{ color: '#555' }}>
        {QUOTES[quoteIndex]}
      </span>
    </div>
  )
}

const QUOTES = [
  '오늘 하루도 수고했어요!',
  '작은 변화가 큰 성장을 만듭니다.',
  '학생들의 미래를 밝히는 당신, 멋져요.',
  '쉬어가도 괜찮아요.',
  '당신의 노력은 빛나고 있어요.',
  '오늘의 가르침이 내일의 기적이 됩니다.',
  '좋은 선생님이 좋은 세상을 만듭니다.',
  '힘든 날도 있지만, 보람찬 날이 더 많을 거예요.'
]

export default App
