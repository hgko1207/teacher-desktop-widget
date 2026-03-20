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
import { LauncherWidget } from './components/widgets/LauncherWidget'
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
        레이아웃 (레퍼런스 기반):
        [파티션] | [시계/날씨] [현재수업] [퇴근/명언] | [런처]
                 | [시간표]           [할일]         | [스마트도구]
                 |                    [D-Day/급식]   |
      */}
      <div className="flex-1 flex gap-3 px-4 pb-4 min-h-0">

        {/* 1열: 파티션 */}
        {visibleWidgets.organizer && <DesktopOrganizer />}

        {/* 2열: 메인 (시계+시간표 / 할일+D-Day) */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">

          {/* 상단: 시계+날씨 | 현재수업 | 퇴근/명언 */}
          <div className="flex gap-3 shrink-0" style={{ height: '130px' }}>
            {visibleWidgets.clockWeather && (
              <div className="flex-1 min-w-0"><ClockWidget /></div>
            )}
            {visibleWidgets.currentClass && (
              <div style={{ width: '180px' }} className="shrink-0"><CurrentClassWidget /></div>
            )}
            {visibleWidgets.quotesOffWork && (
              <div style={{ width: '240px' }} className="shrink-0"><QuotesOffWorkWidget /></div>
            )}
          </div>

          {/* 하단: 시간표 | 할일+D-Day/급식 */}
          <div className="flex-1 flex gap-3 min-h-0">

            {/* 시간표 (넉넉한 크기) */}
            {visibleWidgets.timetable && (
              <div className="flex-1 min-w-0 min-h-0"><TimetableWidget /></div>
            )}

            {/* 할일 + D-Day/급식 (세로 스택) */}
            <div style={{ width: '340px' }} className="shrink-0 flex flex-col gap-3 min-h-0">
              {visibleWidgets.todo && (
                <div className="flex-1 min-h-0"><TodoWidget /></div>
              )}
              {visibleWidgets.lunchDday && (
                <div className="shrink-0"><LunchDdayWidget /></div>
              )}
            </div>
          </div>
        </div>

        {/* 3열: 런처 + 스마트도구 (좁은 우측 바) */}
        <div style={{ width: '200px' }} className="shrink-0 flex flex-col gap-3 min-h-0 overflow-auto">
          <LauncherWidget />
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

export default App
