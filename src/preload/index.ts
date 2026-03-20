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

interface WeatherResult {
  temp: number
  condition: string
  tempMin: number
  tempMax: number
  humidity: number
  icon: string
  fetchedAt: number
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
  fetchMeal: (schoolCode: string, region: string, date: string, apiKey: string): Promise<MealResult | null> =>
    ipcRenderer.invoke('fetch-meal', schoolCode, region, date, apiKey),
  fetchWeather: (region: string): Promise<WeatherResult | null> =>
    ipcRenderer.invoke('fetch-weather', region),
  openPath: (filePath: string): Promise<string> => ipcRenderer.invoke('open-path', filePath),
  showInFolder: (filePath: string): Promise<void> => ipcRenderer.invoke('show-in-folder', filePath),
  selectFiles: (): Promise<string[]> => ipcRenderer.invoke('select-files'),
  selectFolder: (): Promise<string[]> => ipcRenderer.invoke('select-folder'),
  getPathInfo: (filePath: string): Promise<PathInfo> => ipcRenderer.invoke('get-path-info', filePath)
}

contextBridge.exposeInMainWorld('api', widgetApi)
