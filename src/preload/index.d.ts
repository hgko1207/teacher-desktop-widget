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
}

declare global {
  interface Window {
    api: WidgetApi
  }
}

export {}
