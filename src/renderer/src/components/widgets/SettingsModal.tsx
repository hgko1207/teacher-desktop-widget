import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { ToggleLeft, ToggleRight, X, Plus, Trash2, ChevronUp, ChevronDown, RotateCcw, Search, Loader2 } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { ThemeKey, WidgetKey, SchoolType, LauncherItem, PeriodTime } from '../../types'

interface ComciganSearchResult {
  schoolCode: string
  schoolName: string
  region: string
  comciganCode: number
  eduCode: string
  address: string
  schoolType: string
}

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

type TabKey = 'themeWidget' | 'school' | 'time' | 'launcher'

interface TabDef {
  key: TabKey
  label: string
}

const TABS: TabDef[] = [
  { key: 'themeWidget', label: '테마 & 위젯' },
  { key: 'school', label: '학교 정보' },
  { key: 'time', label: '시간 설정' },
  { key: 'launcher', label: '즐겨찾기' }
]

const WIDGET_LABELS: Record<WidgetKey, string> = {
  organizer: '데스크톱 정리함',
  clockWeather: '시계 & 날씨',
  currentClass: '현재 수업',
  quotesOffWork: '명언 & 퇴근',
  timetable: '주간 시간표',
  todo: '할 일 목록',
  lunchDday: '급식 & D-Day',
  smartTools: '스마트 도구'
}

const THEME_KEYS: ThemeKey[] = ['indigo', 'pink', 'teal']

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]

const SCHOOL_TYPES: { value: SchoolType; label: string; maxGrade: number }[] = [
  { value: 'elementary', label: '초등학교', maxGrade: 6 },
  { value: 'middle', label: '중학교', maxGrade: 3 },
  { value: 'high', label: '고등학교', maxGrade: 3 }
]

const DEFAULT_PERIOD_TIMES: PeriodTime[] = [
  { period: 1, startTime: '08:50', endTime: '09:35' },
  { period: 2, startTime: '09:45', endTime: '10:30' },
  { period: 3, startTime: '10:40', endTime: '11:25' },
  { period: 4, startTime: '11:35', endTime: '12:20' },
  { period: 5, startTime: '13:10', endTime: '13:55' },
  { period: 6, startTime: '14:05', endTime: '14:50' },
  { period: 7, startTime: '15:00', endTime: '15:45' }
]

const LAUNCHER_COLORS = [
  '#3b82f6', '#14b8a6', '#eab308', '#ef4444', '#8b5cf6',
  '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#6366f1'
]


// -- Shared input style helper --
function inputStyle(borderColor: string): React.CSSProperties {
  return {
    background: '#f9fafb',
    border: `1px solid ${borderColor}`,
    borderRadius: '10px',
    color: '#333',
    outline: 'none'
  }
}

function sectionLabel(): React.CSSProperties {
  return { color: '#555' }
}

export function SettingsModal({ open, onClose }: SettingsModalProps): ReactNode {
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const [activeTab, setActiveTab] = useState<TabKey>('themeWidget')

  // School search state
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('')
  const [schoolSearchResults, setSchoolSearchResults] = useState<ComciganSearchResult[]>([])
  const [schoolSearching, setSchoolSearching] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSchoolSearch = useCallback((query: string): void => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (query.trim().length < 2) {
      setSchoolSearchResults([])
      setSchoolSearching(false)
      return
    }
    setSchoolSearching(true)
    searchTimerRef.current = setTimeout(() => {
      window.api.searchSchool(query.trim()).then((results) => {
        setSchoolSearchResults(results as ComciganSearchResult[])
        setSchoolSearching(false)
      }).catch(() => {
        setSchoolSearchResults([])
        setSchoolSearching(false)
      })
    }, 500)
  }, [])

  useEffect(() => {
    return (): void => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  // Launcher editor state
  const [newLauncherName, setNewLauncherName] = useState('')
  const [newLauncherUrl, setNewLauncherUrl] = useState('')
  const [newLauncherColor, setNewLauncherColor] = useState(LAUNCHER_COLORS[0])
  const [editingLauncherId, setEditingLauncherId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editColor, setEditColor] = useState('')

  if (!open) return null

  const currentThemeKey = settings.themeKey
  const theme = THEMES[currentThemeKey]
  const borderColor = theme.border

  const toggleWidget = (key: WidgetKey): void => {
    setSettings({
      visibleWidgets: {
        ...settings.visibleWidgets,
        [key]: !settings.visibleWidgets[key]
      }
    })
  }

  const maxGrade = SCHOOL_TYPES.find((s) => s.value === settings.schoolType)?.maxGrade ?? 3

  // Period time helpers
  const updatePeriodTime = (index: number, field: 'startTime' | 'endTime', value: string): void => {
    const updated = settings.periodTimes.map((pt, i) =>
      i === index ? { ...pt, [field]: value } : pt
    )
    setSettings({ periodTimes: updated })
  }

  // Launcher helpers
  const addLauncher = (): void => {
    if (!newLauncherName.trim()) return
    const item: LauncherItem = {
      id: `launcher-${Date.now()}`,
      name: newLauncherName.trim(),
      letter: newLauncherName.trim().charAt(0).toUpperCase(),
      url: newLauncherUrl.trim(),
      color: newLauncherColor
    }
    setSettings({ launchers: [...settings.launchers, item] })
    setNewLauncherName('')
    setNewLauncherUrl('')
    setNewLauncherColor(LAUNCHER_COLORS[0])
  }

  const removeLauncher = (id: string): void => {
    setSettings({ launchers: settings.launchers.filter((l) => l.id !== id) })
  }

  const moveLauncher = (index: number, direction: -1 | 1): void => {
    const target = index + direction
    if (target < 0 || target >= settings.launchers.length) return
    const arr = [...settings.launchers]
    const temp = arr[index]
    arr[index] = arr[target]
    arr[target] = temp
    setSettings({ launchers: arr })
  }

  const startEditing = (launcher: LauncherItem): void => {
    setEditingLauncherId(launcher.id)
    setEditName(launcher.name)
    setEditUrl(launcher.url)
    setEditColor(launcher.color)
  }

  const saveEditing = (): void => {
    if (!editingLauncherId) return
    setSettings({
      launchers: settings.launchers.map((l) =>
        l.id === editingLauncherId
          ? {
              ...l,
              name: editName.trim() || l.name,
              letter: (editName.trim() || l.name).charAt(0).toUpperCase(),
              url: editUrl.trim(),
              color: editColor
            }
          : l
      )
    })
    setEditingLauncherId(null)
  }

  const cancelEditing = (): void => {
    setEditingLauncherId(null)
  }

  // -- Tab content renderers --

  const renderThemeWidget = (): ReactNode => (
    <>
      {/* Theme selection */}
      <div className="mb-6">
        <span className="text-sm font-semibold" style={sectionLabel()}>테마 선택</span>
        <div className="flex items-center gap-4 mt-3">
          {THEME_KEYS.map((key) => {
            const t = THEMES[key]
            const selected = currentThemeKey === key
            return (
              <button
                key={key}
                className="flex flex-col items-center gap-1.5"
                onClick={() => setSettings({ themeKey: key })}
              >
                <div
                  className="w-12 h-12 rounded-full transition-all"
                  style={{
                    background: t.accent,
                    border: selected ? `3px solid ${t.primary}` : '3px solid transparent',
                    boxShadow: selected ? `0 0 0 2px ${t.border}` : 'none'
                  }}
                />
                <span className="text-xs font-medium" style={{ color: selected ? t.primary : '#999' }}>
                  {t.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>



      {/* Widget toggles */}
      <div>
        <span className="text-sm font-semibold" style={sectionLabel()}>위젯 표시 설정</span>
        <div className="mt-3 space-y-2">
          {(Object.keys(WIDGET_LABELS) as WidgetKey[]).map((key) => {
            const enabled = settings.visibleWidgets[key]
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-all"
                style={{ background: enabled ? '#f9fafb' : '#fafafa' }}
              >
                <span className="text-sm font-medium" style={{ color: enabled ? '#333' : '#999' }}>
                  {WIDGET_LABELS[key]}
                </span>
                <button onClick={() => toggleWidget(key)}>
                  {enabled ? (
                    <ToggleRight size={28} style={{ color: theme.accent }} />
                  ) : (
                    <ToggleLeft size={28} style={{ color: '#d1d5db' }} />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  const handleSelectSchool = (result: ComciganSearchResult): void => {
    setSettings({
      schoolCode: result.schoolCode,
      schoolName: result.schoolName,
      comciganCode: result.comciganCode,
      eduCode: result.eduCode || settings.eduCode,
      region: result.region || settings.region
    })
    setSchoolSearchQuery('')
    setSchoolSearchResults([])
  }

  const renderSchool = (): ReactNode => (
    <div className="space-y-4">
      {/* School search */}
      <div>
        <label className="text-sm font-semibold" style={sectionLabel()}>학교 검색</label>
        <div style={{ position: 'relative', marginTop: '6px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              className="w-full px-3 py-2.5 text-sm"
              style={{ ...inputStyle(borderColor), paddingLeft: '32px' }}
              placeholder="학교 이름으로 검색 (예: 정산중학교)"
              value={schoolSearchQuery}
              onChange={(e) => {
                setSchoolSearchQuery(e.target.value)
                doSchoolSearch(e.target.value)
              }}
            />
            {schoolSearching && (
              <Loader2 size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: theme.accent, animation: 'spin 1s linear infinite' }} />
            )}
          </div>
          {schoolSearchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: `1px solid ${borderColor}`,
              borderRadius: '10px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {schoolSearchResults.map((result) => (
                <button
                  key={`${result.comciganCode}-${result.schoolCode}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  onClick={() => handleSelectSchool(result)}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                    {result.schoolName}
                    <span style={{ fontSize: '11px', fontWeight: 500, color: theme.accent, marginLeft: '6px' }}>
                      {result.schoolType || result.region}
                    </span>
                  </div>
                  {result.address && (
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>{result.address}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected school info */}
      {settings.schoolCode && (
        <div style={{
          background: theme.bg,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '12px 14px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: theme.primary }}>{settings.schoolName}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
            컴시간코드: {settings.comciganCode || '-'} | 지역: {settings.region || '-'}
          </div>
        </div>
      )}

      {/* School type */}
      <div>
        <label className="text-sm font-semibold" style={sectionLabel()}>학교 유형</label>
        <select
          className="w-full mt-1.5 px-3 py-2.5 text-sm"
          style={inputStyle(borderColor)}
          value={settings.schoolType}
          onChange={(e) => {
            const schoolType = e.target.value as SchoolType
            const newMax = SCHOOL_TYPES.find((s) => s.value === schoolType)?.maxGrade ?? 3
            setSettings({
              schoolType,
              grade: settings.grade > newMax ? newMax : settings.grade
            })
          }}
        >
          {SCHOOL_TYPES.map((st) => (
            <option key={st.value} value={st.value}>{st.label}</option>
          ))}
        </select>
      </div>

      {/* Grade + Class */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold" style={sectionLabel()}>학년</label>
          <select
            className="w-full mt-1.5 px-3 py-2.5 text-sm"
            style={inputStyle(borderColor)}
            value={settings.grade}
            onChange={(e) => setSettings({ grade: Number(e.target.value) })}
          >
            {Array.from({ length: maxGrade }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>{g}학년</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold" style={sectionLabel()}>반</label>
          <input
            type="number"
            min={1}
            max={30}
            className="w-full mt-1.5 px-3 py-2.5 text-sm"
            style={inputStyle(borderColor)}
            value={settings.classNum}
            onChange={(e) => setSettings({ classNum: Math.max(1, Number(e.target.value)) })}
          />
        </div>
      </div>

      {/* Region */}
      <div>
        <label className="text-sm font-semibold" style={sectionLabel()}>지역 (날씨)</label>
        <select
          className="w-full mt-1.5 px-3 py-2.5 text-sm"
          style={inputStyle(borderColor)}
          value={settings.region}
          onChange={(e) => setSettings({ region: e.target.value })}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Student count */}
      <div>
        <label className="text-sm font-semibold" style={sectionLabel()}>학생 수</label>
        <input
          type="number"
          min={1}
          max={60}
          className="w-full mt-1.5 px-3 py-2.5 text-sm"
          style={inputStyle(borderColor)}
          value={settings.studentCount}
          onChange={(e) => setSettings({ studentCount: Math.max(1, Number(e.target.value)) })}
        />
      </div>

      {/* NEIS API Key */}
      <div>
        <label className="text-sm font-semibold" style={sectionLabel()}>NEIS API 키 (선택사항)</label>
        <input
          type="text"
          className="w-full mt-1.5 px-3 py-2.5 text-sm"
          style={inputStyle(borderColor)}
          placeholder="API 키 입력..."
          value={settings.neisApiKey}
          onChange={(e) => setSettings({ neisApiKey: e.target.value })}
        />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
      `}</style>
    </div>
  )

  const renderTime = (): ReactNode => (
    <div className="space-y-5">
      {/* Period times */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold" style={sectionLabel()}>교시 시간표</span>
          <button
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: theme.bg, color: theme.primary, border: `1px solid ${theme.border}` }}
            onClick={() => setSettings({ periodTimes: DEFAULT_PERIOD_TIMES })}
          >
            <RotateCcw size={12} />
            기본값으로 초기화
          </button>
        </div>
        <div className="space-y-2">
          {settings.periodTimes.map((pt, index) => (
            <div
              key={pt.period}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#f9fafb' }}
            >
              <span className="text-sm font-semibold w-14 shrink-0" style={{ color: '#555' }}>
                {pt.period}교시
              </span>
              <input
                type="time"
                className="flex-1 px-2 py-1.5 text-sm text-center"
                style={inputStyle(borderColor)}
                value={pt.startTime}
                onChange={(e) => updatePeriodTime(index, 'startTime', e.target.value)}
              />
              <span className="text-sm" style={{ color: '#999' }}>~</span>
              <input
                type="time"
                className="flex-1 px-2 py-1.5 text-sm text-center"
                style={inputStyle(borderColor)}
                value={pt.endTime}
                onChange={(e) => updatePeriodTime(index, 'endTime', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Off-work time */}
      <div>
        <span className="text-sm font-semibold" style={sectionLabel()}>퇴근 시간</span>
        <input
          type="time"
          className="w-full mt-1.5 px-3 py-2.5 text-sm"
          style={inputStyle(borderColor)}
          value={settings.offWorkTime}
          onChange={(e) => setSettings({ offWorkTime: e.target.value })}
        />
      </div>
    </div>
  )

  const renderLauncher = (): ReactNode => (
    <div className="space-y-4">
      <span className="text-sm font-semibold" style={sectionLabel()}>즐겨찾기 런처 관리</span>

      {/* Existing launchers */}
      <div className="space-y-2">
        {settings.launchers.map((launcher, index) => (
          <div key={launcher.id}>
            {editingLauncherId === launcher.id ? (
              /* Editing mode */
              <div
                className="p-3 rounded-xl space-y-2"
                style={{ background: '#f0f9ff', border: `1px solid ${borderColor}` }}
              >
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm"
                  style={inputStyle(borderColor)}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="이름"
                />
                <input
                  type="text"
                  className="w-full px-2.5 py-1.5 text-sm"
                  style={inputStyle(borderColor)}
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="URL"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {LAUNCHER_COLORS.map((c) => (
                    <button
                      key={c}
                      className="w-6 h-6 rounded-full transition-all"
                      style={{
                        background: c,
                        border: editColor === c ? '2px solid #333' : '2px solid transparent',
                        transform: editColor === c ? 'scale(1.2)' : 'scale(1)'
                      }}
                      onClick={() => setEditColor(c)}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: theme.accent, color: '#fff' }}
                    onClick={saveEditing}
                  >
                    저장
                  </button>
                  <button
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: '#e5e7eb', color: '#555' }}
                    onClick={cancelEditing}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: '#f9fafb' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ background: launcher.color }}
                >
                  {launcher.letter}
                </div>
                <button
                  className="flex-1 text-left"
                  onClick={() => startEditing(launcher)}
                >
                  <div className="text-sm font-medium" style={{ color: '#333' }}>{launcher.name}</div>
                  <div className="text-xs truncate" style={{ color: '#999' }}>
                    {launcher.url || '(URL 없음)'}
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#f3f4f6' }}
                    onClick={() => moveLauncher(index, -1)}
                  >
                    <ChevronUp size={14} style={{ color: '#666' }} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#f3f4f6' }}
                    onClick={() => moveLauncher(index, 1)}
                  >
                    <ChevronDown size={14} style={{ color: '#666' }} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#fef2f2' }}
                    onClick={() => removeLauncher(launcher.id)}
                  >
                    <Trash2 size={14} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new launcher */}
      <div
        className="p-3 rounded-xl space-y-2"
        style={{ background: '#f9fafb', border: `1px dashed ${borderColor}` }}
      >
        <span className="text-xs font-semibold" style={{ color: '#888' }}>새 런처 추가</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            className="px-2.5 py-1.5 text-sm"
            style={inputStyle(borderColor)}
            placeholder="이름"
            value={newLauncherName}
            onChange={(e) => setNewLauncherName(e.target.value)}
          />
          <input
            type="text"
            className="px-2.5 py-1.5 text-sm"
            style={inputStyle(borderColor)}
            placeholder="URL (https://...)"
            value={newLauncherUrl}
            onChange={(e) => setNewLauncherUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {LAUNCHER_COLORS.map((c) => (
            <button
              key={c}
              className="w-6 h-6 rounded-full transition-all"
              style={{
                background: c,
                border: newLauncherColor === c ? '2px solid #333' : '2px solid transparent',
                transform: newLauncherColor === c ? 'scale(1.2)' : 'scale(1)'
              }}
              onClick={() => setNewLauncherColor(c)}
            />
          ))}
        </div>
        <button
          className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          style={{ background: theme.accent, color: '#fff' }}
          onClick={addLauncher}
        >
          <Plus size={14} />
          추가
        </button>
      </div>
    </div>
  )

  const renderTabContent = (): ReactNode => {
    switch (activeTab) {
      case 'themeWidget': return renderThemeWidget()
      case 'school': return renderSchool()
      case 'time': return renderTime()
      case 'launcher': return renderLauncher()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        background: 'rgba(17,24,39,0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md flex flex-col"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          maxHeight: '85vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>설정</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: '#f3f4f6' }}
          >
            <X size={16} style={{ color: '#666' }} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-6 py-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: isActive ? theme.accent : 'transparent',
                  color: isActive ? '#ffffff' : '#888'
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content (scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: theme.accent,
              color: '#ffffff'
            }}
            onClick={onClose}
          >
            완료
          </button>
        </div>
      </div>
    </div>
  )
}
