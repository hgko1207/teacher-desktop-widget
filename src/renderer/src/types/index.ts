// === 시간표 ===
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri'

export interface TimetableEntry {
  day: DayOfWeek
  period: number
  className: string // "1-4", "2-2" 등
  subject: string
  room: string
  color: string // hex color
}

export interface PeriodTime {
  period: number
  startTime: string // "08:50"
  endTime: string // "09:35"
}

// === 할 일 ===
export interface TodoItem {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

// === D-Day ===
export interface DdayItem {
  id: string
  title: string
  targetDate: string // "2026-07-15"
}

// === 급식 ===
export interface MealData {
  date: string       // "2026-03-19"
  menu: string[]     // ["현미밥", "미역국", ...]
  calories: string   // "780 kcal"
  source: 'auto' | 'manual'  // API 자동 vs 수동 입력
}

// === 날씨 ===
export interface WeatherData {
  temp: number          // celsius
  condition: string     // '맑음', '흐림', '비', '눈' etc
  tempMin: number
  tempMax: number
  humidity: number
  icon: string          // emoji like ☀️ ☁️ 🌧️ ❄️
  fetchedAt: number     // timestamp for cache
}

// === NEIS API 응답 타입 ===
export interface NeisApiRow {
  DDISH_NM: string
  CAL_INFO: string
  MLSV_YMD: string
}

export interface NeisApiHead {
  list_total_count?: number
  RESULT?: { CODE: string; MESSAGE: string }
}

export interface NeisApiResponse {
  mealServiceDietInfo?: [
    { head: NeisApiHead[] },
    { row: NeisApiRow[] }
  ]
  RESULT?: { CODE: string; MESSAGE: string }
}

// === wttr.in 응답 타입 ===
export interface WttrCurrentCondition {
  temp_C: string
  humidity: string
  weatherDesc: { value: string }[]
  weatherCode: string
}

export interface WttrWeatherDay {
  mintempC: string
  maxtempC: string
}

export interface WttrResponse {
  current_condition: WttrCurrentCondition[]
  weather: WttrWeatherDay[]
}

// === 위젯 레이아웃 ===
export type WidgetId =
  | 'clock'
  | 'timetable'
  | 'currentClass'
  | 'todo'
  | 'dday'
  | 'memo'
  | 'weather'
  | 'meal'
  | 'schedule'

export interface WidgetLayout {
  widgetId: WidgetId
  x: number
  y: number
  width: number
  height: number
  visible: boolean
}

// === 테마 ===
export type ThemeKey = 'indigo' | 'pink' | 'teal'

export interface ThemeStyle {
  name: string
  primary: string
  bg: string
  accent: string
  border: string
  hover: string
}

// === 위젯 키 (Phase 2) ===
export type WidgetKey = 'organizer' | 'clockWeather' | 'currentClass' | 'quotesOffWork'
  | 'timetable' | 'todo' | 'lunchDday' | 'smartTools'

// === 설정 ===
export type SchoolType = 'elementary' | 'middle' | 'high'
export type ThemeMode = 'light' | 'dark'

// === 학교 검색 결과 (컴시간) ===
export interface SchoolSearchResult {
  schoolCode: string
  schoolName: string
  region: string
  comciganCode: number
}

// === 컴시간 시간표 결과 ===
export interface ComciganTimetableResult {
  day: string
  period: number
  subject: string
  teacher: string
}

// === NEIS 시간표 API 결과 ===
export interface TimetableApiResult {
  date: string
  grade: number
  classNum: number
  period: number
  subject: string
}

export interface AppSettings {
  schoolCode: string
  schoolName: string
  schoolType: SchoolType
  eduCode: string
  comciganCode: number
  grade: number
  classNum: number
  region: string
  neisApiKey: string
  theme: ThemeMode
  themeKey: ThemeKey
  visibleWidgets: Record<WidgetKey, boolean>
  autoStart: boolean
  alwaysOnTop: boolean
  opacity: number // 0.0 ~ 1.0
  periodTimes: PeriodTime[]
  studentCount: number
  offWorkTime: string
  launchers: LauncherItem[]
  fontSize: 'small' | 'medium' | 'large'
  timetableMode: 'class' | 'subject'  // class=반번호(중등교과), subject=과목(초등/특수)
}

// === IPC 채널 ===
export type IpcChannel =
  | 'toggle-always-on-top'
  | 'get-always-on-top'
  | 'set-opacity'
  | 'minimize-to-tray'
  | 'load-store'
  | 'save-store'

// === 즐겨찾기 런처 ===
export interface LauncherItem {
  id: string
  name: string
  letter: string
  url: string
  color: string
}

// === 스마트 도구 ===
export interface PhoneEntry {
  id: string
  name: string
  number: string
}

export interface SubmissionRecord {
  title: string
  checkedNumbers: number[]
}

// === 문서번호 ===
export interface DocumentNumber {
  id: string
  title: string
  number: string
  category: string
  memo: string
  addedAt: string
}

// === 파일 파티션 ===
export interface PartitionCategory {
  id: string
  name: string
  iconColor: string
  order: number
}

export interface PartitionItem {
  id: string
  categoryId: string
  name: string
  path: string
  type: 'file' | 'folder'
  extension: string
  addedAt: string
}

// === electron-store 데이터 ===
export interface StoreSchema {
  settings: AppSettings
  timetable: TimetableEntry[]
  todos: TodoItem[]
  ddays: DdayItem[]
  meal: MealData
  memo: string
  widgetLayouts: WidgetLayout[]
  phoneDirectory: PhoneEntry[]
  submissionRecords: SubmissionRecord[]
  studentCount: number
  weatherCache: WeatherData | null
  partitionCategories: PartitionCategory[]
  partitionItems: PartitionItem[]
  documentNumbers: DocumentNumber[]
}
