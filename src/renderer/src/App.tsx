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

const ZOOM_LEVELS = { small: 0.92, medium: 1, large: 1.08 }

function App(): ReactNode {
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const loadTimetable = useTimetableStore((s) => s.loadTimetable)
  const loadTodos = useTodoStore((s) => s.loadTodos)
  const visibleWidgets = useSettingsStore((s) => s.settings.visibleWidgets)
  const fontSize = useSettingsStore((s) => s.settings.fontSize)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    loadSettings()
    loadTimetable()
    loadTodos()
  }, [loadSettings, loadTimetable, loadTodos])

  const GAP = '12px'

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: '#F8F9FB',
        zoom: ZOOM_LEVELS[fontSize] ?? 1
      }}
    >
      {/* 좌측 사이드바 (Teacher's Desk 통합) */}
      {visibleWidgets.organizer && <DesktopOrganizer />}

      {/* 메인 영역 */}
      <main className="flex-1 h-full flex flex-col" style={{ padding: GAP, gap: GAP }}>
        {/* 헤더: 런처 + 설정 */}
        <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* 상단 정보 행 (100px, 8단 그리드) */}
        <div className="grid grid-cols-8 shrink-0" style={{ gap: GAP, height: '100px' }}>
          {visibleWidgets.clockWeather && (
            <>
              <div className="col-span-2"><ClockWidget /></div>
              <div className="col-span-2"><WeatherWidget /></div>
            </>
          )}
          {visibleWidgets.currentClass && (
            <div className="col-span-2"><CurrentClassWidget /></div>
          )}
          {visibleWidgets.quotesOffWork && (
            <div className="col-span-2"><QuotesOffWorkWidget /></div>
          )}
        </div>

        {/* 하단 메인 (flex-1, 8단 그리드) */}
        <div className="flex-1 grid grid-cols-8 min-h-0" style={{ gap: GAP }}>
          {/* 시간표 (3칸) */}
          {visibleWidgets.timetable && (
            <div className="col-span-3"><TimetableWidget /></div>
          )}

          {/* 할일 + D-Day + 메모 (3칸) */}
          <div className="col-span-3 flex flex-col min-h-0" style={{ gap: GAP }}>
            {visibleWidgets.todo && (
              <div style={{ flex: '3 1 0' }} className="min-h-0"><TodoWidget /></div>
            )}
            {visibleWidgets.lunchDday && (
              <div className="shrink-0"><DdayCompact /></div>
            )}
            <div style={{ flex: '1.5 1 0' }} className="min-h-0"><MemoWidget /></div>
          </div>

          {/* 스마트도구 + 급식 (2칸) */}
          <div className="col-span-2 flex flex-col min-h-0" style={{ gap: GAP }}>
            {visibleWidgets.smartTools && (
              <div style={{ flex: '1.2 1 0' }} className="min-h-0"><SmartToolsWidget /></div>
            )}
            {visibleWidgets.lunchDday && (
              <div style={{ flex: '1 1 0' }} className="min-h-0"><MealCard /></div>
            )}
          </div>
        </div>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
