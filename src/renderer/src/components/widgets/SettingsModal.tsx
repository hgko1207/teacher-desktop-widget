import { type ReactNode } from 'react'
import { ToggleLeft, ToggleRight, X } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { ThemeKey, WidgetKey } from '../../types'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

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

export function SettingsModal({ open, onClose }: SettingsModalProps): ReactNode {
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)

  if (!open) return null

  const currentThemeKey = settings.themeKey

  const toggleWidget = (key: WidgetKey): void => {
    setSettings({
      visibleWidgets: {
        ...settings.visibleWidgets,
        [key]: !settings.visibleWidgets[key]
      }
    })
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
        className="w-full max-w-md p-6"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: '#1a1a2e' }}>위젯 편집 및 테마</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: '#f3f4f6' }}
          >
            <X size={16} style={{ color: '#666' }} />
          </button>
        </div>

        {/* Theme selection */}
        <div className="mb-6">
          <span className="text-sm font-semibold" style={{ color: '#555' }}>테마 선택</span>
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
        <div className="mb-6">
          <span className="text-sm font-semibold" style={{ color: '#555' }}>위젯 표시 설정</span>
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
                      <ToggleRight size={28} style={{ color: THEMES[currentThemeKey].accent }} />
                    ) : (
                      <ToggleLeft size={28} style={{ color: '#d1d5db' }} />
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <button
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: THEMES[currentThemeKey].accent,
            color: '#ffffff'
          }}
          onClick={onClose}
        >
          완료
        </button>
      </div>
    </div>
  )
}
