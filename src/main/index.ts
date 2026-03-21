import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, net, dialog } from 'electron'
import { statSync } from 'fs'
import { join } from 'path'
import { initStore, loadStore, saveStore } from './store'

// === 교육청 코드 매핑 ===
const REGION_TO_EDU_CODE: Record<string, string> = {
  '서울': 'B10', '부산': 'C10', '대구': 'D10', '인천': 'E10',
  '광주': 'F10', '대전': 'G10', '울산': 'H10', '세종': 'I10',
  '경기': 'J10', '강원': 'K10', '충북': 'M10', '충남': 'N10',
  '전북': 'P10', '전남': 'Q10', '경북': 'R10', '경남': 'S10', '제주': 'T10'
}

// === 지역명 → wttr.in 도시명 매핑 ===
const REGION_TO_CITY: Record<string, string> = {
  '서울': 'Seoul', '부산': 'Busan', '대구': 'Daegu', '인천': 'Incheon',
  '광주': 'Gwangju', '대전': 'Daejeon', '울산': 'Ulsan', '세종': 'Sejong',
  '경기': 'Suwon', '강원': 'Chuncheon', '충북': 'Cheongju', '충남': 'Daejeon',
  '전북': 'Jeonju', '전남': 'Mokpo', '경북': 'Andong', '경남': 'Changwon', '제주': 'Jeju'
}

// === 영문 날씨 → 한글 매핑 ===
interface WeatherMapping {
  label: string
  icon: string
}

const WEATHER_MAP: Record<string, WeatherMapping> = {
  'Sunny': { label: '맑음', icon: '☀️' },
  'Clear': { label: '맑음', icon: '☀️' },
  'Partly cloudy': { label: '구름조금', icon: '⛅' },
  'Cloudy': { label: '흐림', icon: '☁️' },
  'Overcast': { label: '흐림', icon: '☁️' },
  'Mist': { label: '안개', icon: '🌫️' },
  'Fog': { label: '안개', icon: '🌫️' },
  'Patchy rain possible': { label: '비 가능', icon: '🌦️' },
  'Light rain': { label: '가벼운 비', icon: '🌧️' },
  'Moderate rain': { label: '비', icon: '🌧️' },
  'Heavy rain': { label: '폭우', icon: '🌧️' },
  'Light drizzle': { label: '이슬비', icon: '🌧️' },
  'Patchy light rain': { label: '가벼운 비', icon: '🌧️' },
  'Moderate or heavy rain shower': { label: '소나기', icon: '🌧️' },
  'Light rain shower': { label: '소나기', icon: '🌦️' },
  'Patchy snow possible': { label: '눈 가능', icon: '🌨️' },
  'Light snow': { label: '가벼운 눈', icon: '❄️' },
  'Moderate snow': { label: '눈', icon: '❄️' },
  'Heavy snow': { label: '폭설', icon: '❄️' },
  'Thundery outbreaks possible': { label: '뇌우 가능', icon: '⛈️' }
}

function getWeatherKorean(desc: string): WeatherMapping {
  return WEATHER_MAP[desc] ?? { label: desc, icon: '🌤️' }
}

// === 메인 프로세스 HTTP 요청 유틸리티 ===
async function fetchUrl(url: string): Promise<string> {
  const response = await net.fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.text()
}

// === 컴시간 타입 ===
interface ComciganSearchItem {
  _: number
  region: string
  name: string
  code: number
}

interface ComciganSchoolResult {
  schoolCode: string
  schoolName: string
  region: string
  comciganCode: number
  eduCode: string
  address: string
  schoolType: string
}

interface ComciganPeriodItem {
  subject: string
  teacher: string
  classTime: number
  weekday: number
  weekdayString: string
}

type ComciganTimetableData = Record<number, Record<number, ComciganPeriodItem[][]>>

interface ComciganTimetableItem {
  day: string
  period: number
  subject: string
  teacher: string
}

// === NEIS 시간표 API 결과 ===
interface TimetableApiResult {
  date: string
  grade: number
  classNum: number
  period: number
  subject: string
}

// === NEIS 시간표 API 응답 ===
interface NeisTimetableRow {
  ALL_TI_YMD: string
  GRADE: string
  CLASS_NM: string
  PERIO: string
  ITRT_CNTNT: string
}

interface NeisTimetableData {
  head: NeisHead[]
}

interface NeisTimetableRowData {
  row: NeisTimetableRow[]
}

function parseTimetableResponse(json: Record<string, unknown>, endpoint: string): NeisTimetableRow[] {
  const data = json[endpoint] as [NeisTimetableData, NeisTimetableRowData] | undefined
  if (data && Array.isArray(data) && data.length >= 2) {
    return data[1].row
  }
  return []
}

// === NEIS 급식 데이터 파싱 ===
interface ParsedMealResult {
  menu: string[]
  calories: string
  date: string
}

interface NeisRow {
  DDISH_NM: string
  CAL_INFO: string
  MLSV_YMD: string
}

interface NeisHead {
  list_total_count?: number
  RESULT?: { CODE: string; MESSAGE: string }
}

interface NeisResponse {
  mealServiceDietInfo?: [
    { head: NeisHead[] },
    { row: NeisRow[] }
  ]
  RESULT?: { CODE: string; MESSAGE: string }
}

function parseMealMenu(raw: string): string[] {
  return raw
    .split('<br/>')
    .map((item) => item.replace(/\([0-9.]+\)/g, '').trim())
    .filter((item) => item.length > 0)
}

// === wttr.in 응답 파싱 ===
interface WttrCurrent {
  temp_C: string
  humidity: string
  weatherDesc: { value: string }[]
}

interface WttrDay {
  mintempC: string
  maxtempC: string
}

interface WttrJson {
  current_condition?: WttrCurrent[]
  weather?: WttrDay[]
  data?: {
    current_condition: WttrCurrent[]
    weather: WttrDay[]
  }
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

const icon = join(__dirname, '../../resources/icon.png')

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): void {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width: screenW,
    height: screenH,
    x: 0,
    y: 0,
    show: false,
    frame: false,
    transparent: false,
    alwaysOnTop: false,
    skipTaskbar: false,
    autoHideMenuBar: true,
    backgroundColor: '#f0f1f5',
    resizable: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon)
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '위젯 보이기/숨기기',
      click: (): void => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide()
        } else {
          mainWindow?.show()
          mainWindow?.focus()
        }
      }
    },
    {
      label: '항상 위에',
      type: 'checkbox',
      checked: false,
      click: (menuItem): void => {
        mainWindow?.setAlwaysOnTop(menuItem.checked)
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      click: (): void => {
        mainWindow?.removeAllListeners('close')
        app.quit()
      }
    }
  ])

  tray.setToolTip('교사 위젯')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
      mainWindow?.focus()
    }
  })
}

function registerIpcHandlers(): void {
  ipcMain.handle('toggle-always-on-top', () => {
    if (!mainWindow) return false
    const current = mainWindow.isAlwaysOnTop()
    mainWindow.setAlwaysOnTop(!current)
    return !current
  })

  ipcMain.handle('get-always-on-top', () => {
    return mainWindow?.isAlwaysOnTop() ?? false
  })

  ipcMain.handle('set-opacity', (_event, opacity: number) => {
    mainWindow?.setOpacity(Math.max(0.1, Math.min(1, opacity)))
  })

  ipcMain.handle('minimize-to-tray', () => {
    mainWindow?.hide()
  })

  ipcMain.handle('close-app', () => {
    mainWindow?.removeAllListeners('close')
    app.quit()
  })

  ipcMain.handle('minimize-window', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
    return mainWindow?.isMaximized() ?? false
  })

  ipcMain.handle('load-store', (_event, key: string) => {
    return loadStore(key)
  })

  ipcMain.handle('save-store', (_event, key: string, value: unknown) => {
    saveStore(key, value)
  })

  // === 파일 파티션 ===
  ipcMain.handle('open-path', async (_event, filePath: string) => {
    return shell.openPath(filePath)
  })

  ipcMain.handle('show-in-folder', (_event, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    })
    return result.filePaths
  })

  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths
  })

  ipcMain.handle('get-path-info', async (_event, filePath: string) => {
    try {
      const stats = statSync(filePath)
      return { exists: true, isDirectory: stats.isDirectory() }
    } catch {
      return { exists: false, isDirectory: false }
    }
  })

  // === 급식 API ===
  ipcMain.handle(
    'fetch-meal',
    async (_event, schoolCode: string, region: string, date: string, apiKey: string, eduCodeDirect: string): Promise<ParsedMealResult | null> => {
      try {
        const eduCode = eduCodeDirect || REGION_TO_EDU_CODE[region] || 'B10'
        // KEY 없이도 나이스 API 작동 (KEY 파라미터 생략)
        let url = `https://open.neis.go.kr/hub/mealServiceDietInfo?Type=json&ATPT_OFCDC_SC_CODE=${encodeURIComponent(eduCode)}&SD_SCHUL_CODE=${encodeURIComponent(schoolCode)}&MLSV_YMD=${encodeURIComponent(date)}`
        if (apiKey) {
          url += `&KEY=${encodeURIComponent(apiKey)}`
        }

        const text = await fetchUrl(url)
        const json = JSON.parse(text) as NeisResponse

        // API 에러 확인
        if (json.RESULT && json.RESULT.CODE !== 'INFO-000') {
          return null
        }

        if (!json.mealServiceDietInfo || json.mealServiceDietInfo.length < 2) {
          return null
        }

        const rows = json.mealServiceDietInfo[1].row
        if (!rows || rows.length === 0) {
          return null
        }

        const row = rows[0]
        return {
          menu: parseMealMenu(row.DDISH_NM),
          calories: row.CAL_INFO || '',
          date: `${row.MLSV_YMD.slice(0, 4)}-${row.MLSV_YMD.slice(4, 6)}-${row.MLSV_YMD.slice(6, 8)}`
        }
      } catch {
        return null
      }
    }
  )

  // === 날씨 API ===
  ipcMain.handle(
    'fetch-weather',
    async (_event, region: string): Promise<WeatherResult | null> => {
      try {
        const city = REGION_TO_CITY[region] ?? 'Seoul'
        const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`

        const text = await fetchUrl(url)
        const json = JSON.parse(text) as WttrJson

        // wttr.in은 data 키 안에 감쌀 수도 있음
        const conditions = json.current_condition ?? json.data?.current_condition
        const weatherDays = json.weather ?? json.data?.weather

        if (!conditions || conditions.length === 0) {
          return null
        }

        const current = conditions[0]
        const dayWeather = weatherDays?.[0]
        const desc = current.weatherDesc?.[0]?.value ?? 'Clear'
        const mapped = getWeatherKorean(desc)

        return {
          temp: parseInt(current.temp_C, 10),
          condition: mapped.label,
          tempMin: dayWeather ? parseInt(dayWeather.mintempC, 10) : 0,
          tempMax: dayWeather ? parseInt(dayWeather.maxtempC, 10) : 0,
          humidity: parseInt(current.humidity, 10),
          icon: mapped.icon,
          fetchedAt: Date.now()
        }
      } catch {
        return null
      }
    }
  )

  // === 학교 검색 (컴시간 + 나이스 병합) ===
  ipcMain.handle(
    'search-school',
    async (_event, schoolName: string): Promise<ComciganSchoolResult[]> => {
      try {
        // 1. 컴시간 검색 (시간표용)
        const Timetable = require('comcigan-parser')
        const timetable = new Timetable()
        await timetable.init()
        const comciganResults: ComciganSearchItem[] = await timetable.search(schoolName)

        // 2. 나이스 검색 (급식용 - KEY 없이)
        let neisMap: Record<string, { schoolCode: string; eduCode: string; address: string; schoolType: string }> = {}
        try {
          const neisUrl = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=50&SCHUL_NM=${encodeURIComponent(schoolName)}`
          const neisText = await fetchUrl(neisUrl)
          const neisJson = JSON.parse(neisText) as { schoolInfo?: [{ head: unknown[] }, { row: Array<{ SD_SCHUL_CODE: string; SCHUL_NM: string; ATPT_OFCDC_SC_CODE: string; ORG_RDNMA: string; SCHUL_KND_SC_NM: string }> }] }
          if (neisJson.schoolInfo && neisJson.schoolInfo.length >= 2) {
            for (const row of neisJson.schoolInfo[1].row) {
              neisMap[row.SCHUL_NM] = {
                schoolCode: row.SD_SCHUL_CODE,
                eduCode: row.ATPT_OFCDC_SC_CODE,
                address: row.ORG_RDNMA || '',
                schoolType: row.SCHUL_KND_SC_NM || ''
              }
            }
          }
        } catch {
          // 나이스 실패해도 컴시간 결과만 반환
        }

        // 3. 병합: 컴시간 결과에 나이스 정보 추가
        return comciganResults.map((r) => {
          const neis = neisMap[r.name]
          return {
            schoolCode: neis?.schoolCode ?? '',
            schoolName: r.name,
            region: r.region,
            comciganCode: r.code,
            eduCode: neis?.eduCode ?? '',
            address: neis?.address ?? '',
            schoolType: neis?.schoolType ?? ''
          }
        })
      } catch {
        return []
      }
    }
  )

  // === 컴시간 시간표 불러오기 ===
  ipcMain.handle(
    'fetch-timetable-comcigan',
    async (_event, comciganCode: number, grade: number, classNum: number): Promise<ComciganTimetableItem[]> => {
      try {
        const Timetable = require('comcigan-parser')
        const timetable = new Timetable()
        await timetable.init({ maxGrade: 6 })
        timetable.setSchool(comciganCode)
        const data: ComciganTimetableData = await timetable.getTimetable()

        const DAY_MAP: Record<number, string> = { 0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri' }
        const results: ComciganTimetableItem[] = []

        const classDays = data[grade]?.[classNum]
        if (!classDays) return []

        for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
          const periods = classDays[dayIdx] ?? []
          for (const item of periods) {
            if (item.subject && item.subject.trim()) {
              results.push({
                day: DAY_MAP[dayIdx],
                period: item.classTime,
                subject: item.subject,
                teacher: item.teacher || ''
              })
            }
          }
        }

        return results
      } catch {
        return []
      }
    }
  )

  // === NEIS 시간표 API ===
  ipcMain.handle(
    'fetch-timetable',
    async (
      _event,
      schoolCode: string,
      eduCode: string,
      grade: number,
      classNum: number,
      apiKey: string,
      schoolType: string
    ): Promise<TimetableApiResult[]> => {
      try {
        const key = apiKey || 'SAMPLE'
        const today = new Date()
        const monday = new Date(today)
        const dow = today.getDay()
        monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))

        // Determine endpoint based on school type
        let endpoints: string[]
        if (schoolType === 'elementary') {
          endpoints = ['elsTimetable']
        } else if (schoolType === 'high') {
          endpoints = ['hisTimetable']
        } else {
          endpoints = ['misTimetable']
        }

        const results: TimetableApiResult[] = []
        for (let i = 0; i < 5; i++) {
          const date = new Date(monday)
          date.setDate(monday.getDate() + i)
          const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

          for (const endpoint of endpoints) {
            const url = `https://open.neis.go.kr/hub/${endpoint}?KEY=${encodeURIComponent(key)}&Type=json&ATPT_OFCDC_SC_CODE=${encodeURIComponent(eduCode)}&SD_SCHUL_CODE=${encodeURIComponent(schoolCode)}&ALL_TI_YMD=${dateStr}&GRADE=${grade}&CLASS_NM=${classNum}`

            try {
              const text = await fetchUrl(url)
              const json = JSON.parse(text) as Record<string, unknown>

              const rows = parseTimetableResponse(json, endpoint)
              if (rows.length > 0) {
                for (const row of rows) {
                  results.push({
                    date: row.ALL_TI_YMD,
                    grade: parseInt(row.GRADE, 10),
                    classNum: parseInt(row.CLASS_NM, 10),
                    period: parseInt(row.PERIO, 10),
                    subject: (row.ITRT_CNTNT || '').trim()
                  })
                }
                break
              }
            } catch {
              continue
            }
          }
        }

        return results
      } catch {
        return []
      }
    }
  )
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.teacher-widget')

  initStore()
  registerIpcHandlers()
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
