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

const FONT_SIZES = { small: '13px', medium: '14px', large: '16px' }

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

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{
        background: '#F8F9FB',
        fontSize: FONT_SIZES[fontSize] ?? '14px'
      }}
    >
      {/* Left sidebar - 320px */}
      {visibleWidgets.organizer && <DesktopOrganizer />}

      {/* Main area */}
      <main className="flex-1 h-full flex flex-col gap-4 p-4">
        {/* Header: launchers + settings */}
        <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

        {/* Top info row: 100px, grid-cols-8 */}
        <div className="grid grid-cols-8 gap-3 shrink-0" style={{ height: '100px' }}>
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

        {/* Bottom: flex-1, grid-cols-8 */}
        <div className="flex-1 grid grid-cols-8 gap-3 min-h-0">
          {visibleWidgets.timetable && (
            <div className="col-span-3"><TimetableWidget /></div>
          )}
          <div className="col-span-3 flex flex-col gap-3 min-h-0">
            {visibleWidgets.todo && (
              <div style={{ flex: '3 1 0' }} className="min-h-0"><TodoWidget /></div>
            )}
            {visibleWidgets.lunchDday && (
              <div className="shrink-0"><DdayCompact /></div>
            )}
            <div style={{ flex: '1.5 1 0' }} className="min-h-0"><MemoWidget /></div>
          </div>
          <div className="col-span-2 flex flex-col gap-3 min-h-0">
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
