import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, net, dialog, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import { statSync } from 'fs'
import { join } from 'path'
import { initStore, loadStore, saveStore } from './store'
import {
  searchSchool as comciganSearch,
  fetchTimetable as comciganFetchTimetable
} from './comcigan'
import type { ComciganSearchResult, ComciganTimetableData } from './comcigan'
import { pinToDesktop, unpinFromDesktop } from './windowPin'

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
interface ComciganSchoolResult {
  schoolCode: string
  schoolName: string
  region: string
  comciganCode: number
  eduCode: string
  address: string
  schoolType: string
}

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

// === 학사 일정 API 응답 ===
interface ScheduleEventResult {
  date: string
  eventName: string
  isHoliday: boolean
}

interface NeisScheduleRow {
  AA_YMD: string
  EVENT_NM: string
  SBTR_DD_SC_NM: string
}

interface NeisScheduleResponse {
  SchoolSchedule?: [
    { head: NeisHead[] },
    { row: NeisScheduleRow[] }
  ]
}

// === 미세먼지 API 응답 ===
interface DustResult {
  pm10: number
  pm25: number
  pm10Grade: string
  pm25Grade: string
}

interface AirKoreaItem {
  pm10Value: string
  pm25Value: string
  pm10Grade: string
  pm25Grade: string
}

interface AirKoreaResponse {
  response?: {
    body?: {
      items?: AirKoreaItem[]
    }
  }
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
  MMEAL_SC_CODE: string // 1=조식, 2=중식, 3=석식
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
let isPinned = false
let pinInterval: ReturnType<typeof setInterval> | null = null

function enableDesktopPin(win: BrowserWindow): void {
  isPinned = true
  const hwndBuffer = win.getNativeWindowHandle()
  pinToDesktop(hwndBuffer)
  if (pinInterval) clearInterval(pinInterval)
  pinInterval = setInterval(() => {
    if (!isPinned || !mainWindow) return
    // 위젯에 포커스 없을 때만 re-pin (포커스 있을 땐 사용자가 위젯 조작 중)
    if (!mainWindow.isFocused()) {
      pinToDesktop(hwndBuffer)
    }
  }, 1000)
  saveStore('desktopPin', true)
}

function disableDesktopPin(win: BrowserWindow): void {
  isPinned = false
  if (pinInterval) { clearInterval(pinInterval); pinInterval = null }
  const hwndBuffer = win.getNativeWindowHandle()
  unpinFromDesktop(hwndBuffer)
  saveStore('desktopPin', false)
}

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
    const settings = loadStore('settings') as { startMinimized?: boolean } | null
    if (settings?.startMinimized) {
      // Stay hidden in tray
      return
    }
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

  ipcMain.handle('toggle-desktop-pin', (_event, enable: boolean) => {
    if (!mainWindow) return false
    if (enable) enableDesktopPin(mainWindow)
    else disableDesktopPin(mainWindow)
    return enable
  })

  ipcMain.handle('get-desktop-pin', () => isPinned)

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

        // 중식(2) 우선, 없으면 석식(3), 없으면 조식(1)
        const row = rows.find((r: NeisRow) => r.MMEAL_SC_CODE === '2')
          ?? rows.find((r: NeisRow) => r.MMEAL_SC_CODE === '3')
          ?? rows[0]
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
        // 1. 컴시간 검색 (시간표용) - direct HTTP API
        const comciganResults: ComciganSearchResult[] = await comciganSearch(schoolName)

        // 2. 나이스 검색 (급식용 - KEY 없이)
        // 이름+지역 키로 매칭 (동명 학교 구분)
        interface NeisSchoolInfo { schoolCode: string; eduCode: string; address: string; schoolType: string; region: string }
        const neisList: NeisSchoolInfo[] = []
        try {
          const neisUrl = `https://open.neis.go.kr/hub/schoolInfo?Type=json&pIndex=1&pSize=50&SCHUL_NM=${encodeURIComponent(schoolName)}`
          const neisText = await fetchUrl(neisUrl)
          const neisJson = JSON.parse(neisText) as { schoolInfo?: [{ head: unknown[] }, { row: Array<{ SD_SCHUL_CODE: string; SCHUL_NM: string; ATPT_OFCDC_SC_CODE: string; ORG_RDNMA: string; SCHUL_KND_SC_NM: string; LCTN_SC_NM: string }> }] }
          if (neisJson.schoolInfo && neisJson.schoolInfo.length >= 2) {
            for (const row of neisJson.schoolInfo[1].row) {
              neisList.push({
                schoolCode: row.SD_SCHUL_CODE,
                eduCode: row.ATPT_OFCDC_SC_CODE,
                address: row.ORG_RDNMA || '',
                schoolType: row.SCHUL_KND_SC_NM || '',
                region: row.LCTN_SC_NM || ''
              })
            }
          }
        } catch {
          // 나이스 실패해도 컴시간 결과만 반환
        }

        // 3. 병합: 컴시간 결과에 나이스 정보 매칭 (이름+지역으로)
        return comciganResults.map((r) => {
          // 같은 이름 + 같은 지역의 나이스 학교 찾기
          const neis = neisList.find((n) =>
            n.region.includes(r.region) && schoolName.length >= 2
          ) ?? neisList.find((n) =>
            r.name === schoolName || n.address.includes(r.region)
          )
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
      } catch (err) {
        console.error('[search-school] ERROR:', err)
        return []
      }
    }
  )

  // === 컴시간 시간표 불러오기 ===
  ipcMain.handle(
    'fetch-timetable-comcigan',
    async (_event, comciganCode: number, grade: number, classNum: number): Promise<ComciganTimetableItem[]> => {
      try {
        const data: ComciganTimetableData = await comciganFetchTimetable(comciganCode, 6)

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

  // === 학사 일정 API ===
  ipcMain.handle(
    'fetch-schedule',
    async (_event, schoolCode: string, eduCode: string, year: number, month: number): Promise<ScheduleEventResult[]> => {
      try {
        const startDate = `${year}${String(month).padStart(2, '0')}01`
        const lastDay = new Date(year, month, 0).getDate()
        const endDate = `${year}${String(month).padStart(2, '0')}${String(lastDay).padStart(2, '0')}`
        const url = `https://open.neis.go.kr/hub/SchoolSchedule?Type=json&ATPT_OFCDC_SC_CODE=${encodeURIComponent(eduCode)}&SD_SCHUL_CODE=${encodeURIComponent(schoolCode)}&AA_FROM_YMD=${startDate}&AA_TO_YMD=${endDate}`
        const text = await fetchUrl(url)
        const json = JSON.parse(text) as NeisScheduleResponse
        if (!json.SchoolSchedule || json.SchoolSchedule.length < 2) {
          return []
        }
        const rows = json.SchoolSchedule[1].row
        return rows.map((r) => ({
          date: r.AA_YMD,
          eventName: r.EVENT_NM,
          isHoliday: r.SBTR_DD_SC_NM !== '해당없음'
        }))
      } catch {
        return []
      }
    }
  )

  // === 미세먼지 API ===
  ipcMain.handle(
    'fetch-dust',
    async (_event, airApiKey: string, region: string): Promise<DustResult | null> => {
      try {
        if (!airApiKey) return null
        const url = `http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?serviceKey=${encodeURIComponent(airApiKey)}&returnType=json&numOfRows=1&pageNo=1&sidoName=${encodeURIComponent(region)}&ver=1.0`
        const text = await fetchUrl(url)
        const json = JSON.parse(text) as AirKoreaResponse
        const items = json.response?.body?.items
        if (!items || items.length === 0) return null
        const item = items[0]
        const gradeMap: Record<string, string> = { '1': '좋음', '2': '보통', '3': '나쁨', '4': '매우나쁨' }
        return {
          pm10: parseInt(item.pm10Value, 10) || 0,
          pm25: parseInt(item.pm25Value, 10) || 0,
          pm10Grade: gradeMap[item.pm10Grade] ?? '보통',
          pm25Grade: gradeMap[item.pm25Grade] ?? '보통'
        }
      } catch {
        return null
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

// === 알림 시스템 ===
interface PeriodTimeSetting {
  period: number
  startTime: string
  endTime: string
}

interface NotificationSettings {
  notificationsEnabled: boolean
  notifyMinutesBefore: number
  periodTimes: PeriodTimeSetting[]
  offWorkTime: string
}

const notifiedKeys = new Set<string>()

function checkNotifications(): void {
  try {
    const settings = loadStore('settings') as NotificationSettings | null
    if (!settings || !settings.notificationsEnabled) return

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTotalMins = currentHour * 60 + currentMinute
    const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
    const minutesBefore = settings.notifyMinutesBefore ?? 5

    // Check period start times
    const periodTimes = settings.periodTimes ?? []
    for (const pt of periodTimes) {
      const [h, m] = pt.startTime.split(':').map(Number)
      const periodMins = h * 60 + m
      const targetMins = periodMins - minutesBefore

      if (currentTotalMins === targetMins) {
        const key = `${todayKey}-period-${pt.period}`
        if (!notifiedKeys.has(key)) {
          notifiedKeys.add(key)
          const notification = new Notification({
            title: '교사 위젯',
            body: `📚 ${pt.period}교시 수업이 곧 시작됩니다`,
            icon: icon
          })
          notification.show()
        }
      }
    }

    // Check off-work time
    const offWork = settings.offWorkTime ?? '16:30'
    const [oh, om] = offWork.split(':').map(Number)
    const offWorkMins = oh * 60 + om
    if (currentTotalMins === offWorkMins) {
      const key = `${todayKey}-offwork`
      if (!notifiedKeys.has(key)) {
        notifiedKeys.add(key)
        const notification = new Notification({
          title: '교사 위젯',
          body: '🏠 퇴근 시간입니다!',
          icon: icon
        })
        notification.show()
      }
    }

    // Clean old keys once per day (keep set manageable)
    if (notifiedKeys.size > 100) {
      notifiedKeys.clear()
    }
  } catch {
    // silently ignore notification errors
  }
}

function setupAutoUpdater(): void {
  if (!app.isPackaged) return // 개발 중엔 업데이트 체크 안 함

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    const notification = new Notification({
      title: 'Teacher\'s Desk 업데이트',
      body: `새 버전 ${info.version}을 다운로드 중입니다...`,
      icon
    })
    notification.show()
  })

  autoUpdater.on('update-downloaded', () => {
    const notification = new Notification({
      title: 'Teacher\'s Desk 업데이트 완료',
      body: '앱을 재시작하면 새 버전이 적용됩니다.',
      icon
    })
    notification.show()
    // 트레이 메뉴에 재시작 항목 추가를 위해 렌더러에 알림
    mainWindow?.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', () => {
    // 업데이트 오류는 무시 (네트워크 없는 환경 등)
  })

  // 앱 시작 5초 후 업데이트 확인
  setTimeout(() => autoUpdater.checkForUpdates(), 5000)
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.teacher-widget.app')

  initStore()
  registerIpcHandlers()
  createWindow()
  createTray()
  setupAutoUpdater()

  // Start notification checker (every 60 seconds)
  setInterval(checkNotifications, 60 * 1000)

  // 저장된 desktopPin 설정 복원
  const savedPin = loadStore('desktopPin')
  if (savedPin === true && mainWindow) {
    // 창이 준비된 후 적용
    mainWindow.once('ready-to-show', () => {
      if (mainWindow) enableDesktopPin(mainWindow)
    })
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  if (isPinned && mainWindow) disableDesktopPin(mainWindow)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
