import { useEffect, useState, type ReactNode } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { ClockWidget } from './components/widgets/ClockWidget'
import { CurrentClassWidget } from './components/widgets/CurrentClassWidget'
import { TimetableWidget } from './components/widgets/TimetableWidget'
import { TodoWidget } from './components/widgets/TodoWidget'
import { DesktopOrganizer } from './components/widgets/DesktopOrganizer'
import { QuotesOffWorkWidget } from './components/widgets/QuotesOffWorkWidget'
import { LunchDdayWidget } from './components/widgets/LunchDdayWidget'
import { SmartToolsWidget } from './components/widgets/SmartToolsWidget'
import { SettingsModal } from './components/widgets/SettingsModal'
import { useSettingsStore } from './stores/settingsStore'
import { useTimetableStore } from './stores/timetableStore'
import { useTodoStore } from './stores/todoStore'
import { THEMES } from './config/themes'

function App(): ReactNode {
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const loadTimetable = useTimetableStore((s) => s.loadTimetable)
  const loadTodos = useTodoStore((s) => s.loadTodos)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const visibleWidgets = useSettingsStore((s) => s.settings.visibleWidgets)
  const theme = THEMES[themeKey]
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    loadSettings()
    loadTimetable()
    loadTodos()
  }, [loadSettings, loadTimetable, loadTodos])

  return (
    <div
      className="h-screen w-full flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${theme.bg} 0%, #f8fafc 50%, ${theme.hover} 100%)`
      }}
    >
      <TitleBar onOpenSettings={() => setSettingsOpen(true)} />

      <div className="flex-1 flex gap-4 px-4 pb-4 min-h-0">
        {/* Left sidebar: Desktop Organizer */}
        {visibleWidgets.organizer && <DesktopOrganizer />}

        {/* Right: scrollable grid */}
        <div className="flex-1 overflow-auto min-w-0">
          <div className="grid grid-cols-12 gap-3 h-full" style={{ gridTemplateRows: 'auto 1fr' }}>
            {/* Row 1: Clock (7) + CurrentClass (2) + QuotesOffWork (3) */}
            {visibleWidgets.clockWeather && (
              <div className="col-span-7" style={{ minHeight: '200px' }}>
                <ClockWidget />
              </div>
            )}
            {visibleWidgets.currentClass && (
              <div className="col-span-2" style={{ minHeight: '200px' }}>
                <CurrentClassWidget />
              </div>
            )}
            {visibleWidgets.quotesOffWork && (
              <div className="col-span-3" style={{ minHeight: '200px' }}>
                <QuotesOffWorkWidget />
              </div>
            )}

            {/* Row 2: Timetable (6) + Todo (2) + LunchDday (2) + SmartTools (2) */}
            {visibleWidgets.timetable && (
              <div className="col-span-6" style={{ minHeight: '340px' }}>
                <TimetableWidget />
              </div>
            )}
            {visibleWidgets.todo && (
              <div className="col-span-2" style={{ minHeight: '340px' }}>
                <TodoWidget />
              </div>
            )}
            {visibleWidgets.lunchDday && (
              <div className="col-span-2" style={{ minHeight: '340px' }}>
                <LunchDdayWidget />
              </div>
            )}
            {visibleWidgets.smartTools && (
              <div className="col-span-2" style={{ minHeight: '340px' }}>
                <SmartToolsWidget />
              </div>
            )}
          </div>
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

export default App
