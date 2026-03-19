import { contextBridge, ipcRenderer } from 'electron'

interface MealResult {
  menu: string[]
  calories: string
  date: string
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
    ipcRenderer.invoke('fetch-weather', region)
}

contextBridge.exposeInMainWorld('api', widgetApi)
