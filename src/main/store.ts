import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

let storePath = ''
let data: Record<string, unknown> = {}

const DEFAULTS: Record<string, unknown> = {
  settings: {
    schoolCode: '',
    schoolName: '',
    schoolType: 'middle',
    grade: 1,
    classNum: 1,
    region: '서울',
    neisApiKey: '',
    theme: 'light',
    themeKey: 'indigo',
    visibleWidgets: {
      organizer: true,
      clockWeather: true,
      currentClass: true,
      quotesOffWork: true,
      timetable: true,
      todo: true,
      lunchDday: true,
      smartTools: true
    },
    autoStart: false,
    alwaysOnTop: true,
    opacity: 1.0,
    periodTimes: [
      { period: 1, startTime: '08:50', endTime: '09:35' },
      { period: 2, startTime: '09:45', endTime: '10:30' },
      { period: 3, startTime: '10:40', endTime: '11:25' },
      { period: 4, startTime: '11:35', endTime: '12:20' },
      { period: 5, startTime: '13:10', endTime: '13:55' },
      { period: 6, startTime: '14:05', endTime: '14:50' },
      { period: 7, startTime: '15:00', endTime: '15:45' }
    ]
  },
  timetable: [],
  todos: [],
  ddays: [],
  memo: '',
  widgetLayouts: [
    { widgetId: 'clock', x: 16, y: 16, width: 260, height: 110, visible: true },
    { widgetId: 'weather', x: 290, y: 16, width: 280, height: 110, visible: true },
    { widgetId: 'currentClass', x: 584, y: 16, width: 260, height: 110, visible: true },
    { widgetId: 'timetable', x: 16, y: 140, width: 554, height: 420, visible: true },
    { widgetId: 'todo', x: 584, y: 140, width: 260, height: 200, visible: true },
    { widgetId: 'dday', x: 584, y: 354, width: 260, height: 96, visible: true },
    { widgetId: 'memo', x: 584, y: 464, width: 260, height: 96, visible: true }
  ]
}

export function initStore(): void {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }
  storePath = join(userDataPath, 'teacher-widget-data.json')

  if (existsSync(storePath)) {
    try {
      const raw = readFileSync(storePath, 'utf-8')
      data = JSON.parse(raw) as Record<string, unknown>
    } catch {
      data = { ...DEFAULTS }
    }
  } else {
    data = { ...DEFAULTS }
    persist()
  }
}

function persist(): void {
  try {
    writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // 쓰기 실패 무시
  }
}

export function loadStore(key: string): unknown {
  return data[key] ?? DEFAULTS[key] ?? null
}

export function saveStore(key: string, value: unknown): void {
  data[key] = value
  persist()
}
