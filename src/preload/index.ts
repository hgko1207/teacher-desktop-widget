import { contextBridge, ipcRenderer } from 'electron'

interface MealResult {
  menu: string[]
  calories: string
  date: string
}

interface PathInfo {
  exists: boolean
  isDirectory: boolean
}

interface ScheduleEvent {
  date: string
  eventName: string
  isHoliday: boolean
}

interface DustResult {
  pm10: number
  pm25: number
  pm10Grade: string
  pm25Grade: string
}

interface WeatherResult {
  temp: number
  condition: string
  tempMin: number
  tempMax: number
  humidity: number
  icon: string
  fetchedAt: number
}

interface SchoolSearchResult {
  schoolCode: string
  schoolName: string
  region: string
  comciganCode: number
  eduCode: string
  address: string
  schoolType: string
}

interface ComciganTimetableResult {
  day: string
  period: number
  subject: string
  teacher: string
}

interface TimetableApiResult {
  date: string
  grade: number
  classNum: number
  period: number
  subject: string
}

const widgetApi = {
  toggleAlwaysOnTop: (): Promise<boolean> => ipcRenderer.invoke('toggle-always-on-top'),
  getAlwaysOnTop: (): Promise<boolean> => ipcRenderer.invoke('get-always-on-top'),
  setOpacity: (opacity: number): Promise<void> => ipcRenderer.invoke('set-opacity', opacity),
  minimizeToTray: (): Promise<void> => ipcRenderer.invoke('minimize-to-tray'),
  closeApp: (): Promise<void> => ipcRenderer.invoke('close-app'),
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('maximize-window'),
  loadStore: (key: string): Promise<unknown> => ipcRenderer.invoke('load-store', key),
  saveStore: (key: string, value: unknown): Promise<void> =>
    ipcRenderer.invoke('save-store', key, value),
  fetchMeal: (schoolCode: string, region: string, date: string, apiKey: string, eduCode: string): Promise<MealResult | null> =>
    ipcRenderer.invoke('fetch-meal', schoolCode, region, date, apiKey, eduCode),
  fetchWeather: (region: string): Promise<WeatherResult | null> =>
    ipcRenderer.invoke('fetch-weather', region),
  searchSchool: (name: string): Promise<SchoolSearchResult[]> =>
    ipcRenderer.invoke('search-school', name),
  fetchTimetableComcigan: (comciganCode: number, grade: number, classNum: number): Promise<ComciganTimetableResult[]> =>
    ipcRenderer.invoke('fetch-timetable-comcigan', comciganCode, grade, classNum),
  fetchTimetable: (schoolCode: string, eduCode: string, grade: number, classNum: number, apiKey: string, schoolType: string): Promise<TimetableApiResult[]> =>
    ipcRenderer.invoke('fetch-timetable', schoolCode, eduCode, grade, classNum, apiKey, schoolType),
  openPath: (filePath: string): Promise<string> => ipcRenderer.invoke('open-path', filePath),
  showInFolder: (filePath: string): Promise<void> => ipcRenderer.invoke('show-in-folder', filePath),
  selectFiles: (): Promise<string[]> => ipcRenderer.invoke('select-files'),
  selectFolder: (): Promise<string[]> => ipcRenderer.invoke('select-folder'),
  getPathInfo: (filePath: string): Promise<PathInfo> => ipcRenderer.invoke('get-path-info', filePath),
  fetchSchedule: (schoolCode: string, eduCode: string, year: number, month: number): Promise<ScheduleEvent[]> =>
    ipcRenderer.invoke('fetch-schedule', schoolCode, eduCode, year, month),
  fetchDust: (airApiKey: string, region: string): Promise<DustResult | null> =>
    ipcRenderer.invoke('fetch-dust', airApiKey, region)
}

contextBridge.exposeInMainWorld('api', widgetApi)
