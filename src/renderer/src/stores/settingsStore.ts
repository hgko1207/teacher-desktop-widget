import { create } from 'zustand'
import type { AppSettings, LauncherItem, PeriodTime, ThemeKey, WidgetKey } from '../types'

const DEFAULT_PERIOD_TIMES: PeriodTime[] = [
  { period: 1, startTime: '08:50', endTime: '09:35' },
  { period: 2, startTime: '09:45', endTime: '10:30' },
  { period: 3, startTime: '10:40', endTime: '11:25' },
  { period: 4, startTime: '11:35', endTime: '12:20' },
  { period: 5, startTime: '13:10', endTime: '13:55' },
  { period: 6, startTime: '14:05', endTime: '14:50' },
  { period: 7, startTime: '15:00', endTime: '15:45' }
]

const DEFAULT_LAUNCHERS: LauncherItem[] = [
  { id: 'default-1', name: 'NEIS', letter: 'N', url: 'https://www.neis.go.kr', color: '#3b82f6' },
  { id: 'default-2', name: '업무포털', letter: 'W', url: '', color: '#14b8a6' },
  { id: 'default-3', name: '클래스팅', letter: 'C', url: 'https://www.classting.com', color: '#eab308' }
]

const DEFAULT_VISIBLE_WIDGETS: Record<WidgetKey, boolean> = {
  organizer: true,
  clockWeather: true,
  currentClass: true,
  quotesOffWork: true,
  timetable: true,
  todo: true,
  lunchDday: true,
  smartTools: true
}

const DEFAULT_SETTINGS: AppSettings = {
  schoolCode: '',
  schoolName: '',
  schoolType: 'middle',
  grade: 1,
  classNum: 1,
  region: '서울',
  neisApiKey: '',
  theme: 'light',
  themeKey: 'indigo' as ThemeKey,
  visibleWidgets: DEFAULT_VISIBLE_WIDGETS,
  autoStart: false,
  alwaysOnTop: true,
  opacity: 1.0,
  periodTimes: DEFAULT_PERIOD_TIMES,
  studentCount: 30,
  offWorkTime: '16:30',
  launchers: DEFAULT_LAUNCHERS
}

interface SettingsState {
  settings: AppSettings
  setSettings: (settings: Partial<AppSettings>) => void
  loadSettings: () => Promise<void>
  saveSettings: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  setSettings: (partial): void => {
    set((state) => ({
      settings: { ...state.settings, ...partial }
    }))
    get().saveSettings()
  },

  loadSettings: async (): Promise<void> => {
    const data = await window.api.loadStore('settings')
    if (data && typeof data === 'object') {
      // 기존 저장 데이터에 새 필드가 없을 수 있으므로 기본값과 병합
      const merged: AppSettings = {
        ...DEFAULT_SETTINGS,
        ...(data as Partial<AppSettings>),
        visibleWidgets: {
          ...DEFAULT_VISIBLE_WIDGETS,
          ...((data as Partial<AppSettings>).visibleWidgets ?? {})
        },
        periodTimes: (data as Partial<AppSettings>).periodTimes ?? DEFAULT_PERIOD_TIMES,
        launchers: (data as Partial<AppSettings>).launchers ?? DEFAULT_LAUNCHERS
      }
      set({ settings: merged })
    }
  },

  saveSettings: async (): Promise<void> => {
    await window.api.saveStore('settings', get().settings)
  }
}))
