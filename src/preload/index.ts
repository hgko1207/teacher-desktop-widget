import { contextBridge, ipcRenderer } from 'electron'

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
    ipcRenderer.invoke('save-store', key, value)
}

contextBridge.exposeInMainWorld('api', widgetApi)
