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

function App(): ReactNode {
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const loadTimetable = useTimetableStore((s) => s.loadTimetable)
  const loadTodos = useTodoStore((s) => s.loadTodos)
  const visibleWidgets = useSettingsStore((s) => s.settings.visibleWidgets)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    loadSettings()
    loadTimetable()
    loadTodos()
  }, [loadSettings, loadTimetable, loadTodos])

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: '#F8F9FB' }}>
      {/* 좌측 사이드바 */}
      {visibleWidgets.organizer && <DesktopOrganizer />}

      {/* 메인 영역 */}
      <main className="flex-1 h-full flex flex-col p-3 overflow-hidden" style={{ gap: '12px' }}>
        {/* 헤더 */}
        <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* 상단 (100px, 8단 그리드) */}
        <div className="grid grid-cols-8 shrink-0" style={{ gap: '12px', height: '100px' }}>
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

        {/* 하단 (flex-1, 8단 그리드) */}
        <div className="flex-1 grid grid-cols-8 min-h-0 overflow-hidden" style={{ gap: '12px' }}>
          {visibleWidgets.timetable && (
            <div className="col-span-3 min-h-0 overflow-hidden"><TimetableWidget /></div>
          )}
          <div className="col-span-3 flex flex-col min-h-0 overflow-hidden" style={{ gap: '12px' }}>
            {visibleWidgets.todo && (
              <div style={{ flex: '3 1 0' }} className="min-h-0 overflow-hidden"><TodoWidget /></div>
            )}
            {visibleWidgets.lunchDday && (
              <div className="shrink-0"><DdayCompact /></div>
            )}
            <div style={{ flex: '1.5 1 0' }} className="min-h-0 overflow-hidden"><MemoWidget /></div>
          </div>
          <div className="col-span-2 flex flex-col min-h-0 overflow-hidden" style={{ gap: '12px' }}>
            {visibleWidgets.smartTools && (
              <div style={{ flex: '1 1 0' }} className="min-h-0 overflow-hidden"><SmartToolsWidget /></div>
            )}
            {visibleWidgets.lunchDday && (
              <div style={{ flex: '1 1 0' }} className="min-h-0 overflow-hidden"><MealCard /></div>
            )}
          </div>
        </div>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
