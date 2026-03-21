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
      {visibleWidgets.organizer && <DesktopOrganizer />}

      <main className="flex-1 h-full flex flex-col overflow-hidden" style={{ padding: '12px', gap: '12px' }}>
        <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* ===== 상단 행 (100px) ===== */}
        <div className="shrink-0 flex" style={{ height: '130px', gap: '12px' }}>
          {visibleWidgets.clockWeather && (
            <>
              <div style={{ flex: '1 1 0', minWidth: 0 }}><ClockWidget /></div>
              <div style={{ flex: '1 1 0', minWidth: 0 }}><WeatherWidget /></div>
            </>
          )}
          {visibleWidgets.currentClass && (
            <div style={{ flex: '1 1 0', minWidth: 0 }}><CurrentClassWidget /></div>
          )}
          {visibleWidgets.quotesOffWork && (
            <div style={{ flex: '1 1 0', minWidth: 0 }}><QuotesOffWorkWidget /></div>
          )}
        </div>

        {/* ===== 하단 행 (flex-1) ===== */}
        <div className="flex-1 flex min-h-0 overflow-hidden" style={{ gap: '12px' }}>
          {/* 시간표 */}
          {visibleWidgets.timetable && (
            <div style={{ flex: '3 1 0', minWidth: 0 }} className="min-h-0 overflow-hidden">
              <TimetableWidget />
            </div>
          )}

          {/* 할일 + D-Day + 메모 */}
          <div style={{ flex: '3 1 0', minWidth: 0 }} className="flex flex-col min-h-0 overflow-hidden" >
            <div style={{ gap: '12px' }} className="flex flex-col flex-1 min-h-0">
              {visibleWidgets.todo && (
                <div style={{ flex: '3 1 0' }} className="min-h-0 overflow-hidden"><TodoWidget /></div>
              )}
              {visibleWidgets.lunchDday && (
                <div className="shrink-0"><DdayCompact /></div>
              )}
              <div style={{ flex: '1.5 1 0' }} className="min-h-0 overflow-hidden"><MemoWidget /></div>
            </div>
          </div>

          {/* 스마트도구 + 급식 */}
          <div style={{ flex: '2 1 0', minWidth: 0 }} className="flex flex-col min-h-0 overflow-hidden">
            <div style={{ gap: '12px' }} className="flex flex-col flex-1 min-h-0">
              {visibleWidgets.smartTools && (
                <div style={{ flex: '1 1 0' }} className="min-h-0 overflow-hidden"><SmartToolsWidget /></div>
              )}
              {visibleWidgets.lunchDday && (
                <div style={{ flex: '1 1 0' }} className="min-h-0 overflow-hidden"><MealCard /></div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default App
