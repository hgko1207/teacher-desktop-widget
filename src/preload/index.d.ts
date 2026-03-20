interface PathInfo {
  exists: boolean
  isDirectory: boolean
}

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

interface WidgetApi {
  toggleAlwaysOnTop: () => Promise<boolean>
  getAlwaysOnTop: () => Promise<boolean>
  setOpacity: (opacity: number) => Promise<void>
  minimizeToTray: () => Promise<void>
  closeApp: () => Promise<void>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<boolean>
  loadStore: (key: string) => Promise<unknown>
  saveStore: (key: string, value: unknown) => Promise<void>
  fetchMeal: (schoolCode: string, region: string, date: string, apiKey: string) => Promise<MealResult | null>
  fetchWeather: (region: string) => Promise<WeatherResult | null>
  openPath: (filePath: string) => Promise<string>
  showInFolder: (filePath: string) => Promise<void>
  selectFiles: () => Promise<string[]>
  selectFolder: () => Promise<string[]>
  getPathInfo: (filePath: string) => Promise<PathInfo>
}

declare global {
  interface Window {
    api: WidgetApi
  }
}

export {}
