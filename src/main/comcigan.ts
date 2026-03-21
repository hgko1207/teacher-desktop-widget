/**
 * Comcigan API - Direct HTTP implementation
 * No external dependencies except iconv-lite (for EUC-KR encoding)
 * No cheerio, no undici, no node:sqlite
 */

import * as http from 'http'
import * as iconv from 'iconv-lite'

// === Types ===

interface ComciganState {
  baseUrl: string
  extractCode: string
  scData: string[]
  pageSource: string
  initialized: boolean
}

export interface ComciganSearchResult {
  _: number
  region: string
  name: string
  code: number
}

interface ComciganPeriodItem {
  subject: string
  teacher: string
  classTime: number
  weekday: number
  weekdayString: string
  grade: number
  class: number
}

export type ComciganTimetableData = Record<number, Record<number, ComciganPeriodItem[][]>>

export interface ComciganTimetableItem {
  day: string
  period: number
  subject: string
  teacher: string
}

// === State ===

let state: ComciganState = {
  baseUrl: '',
  extractCode: '',
  scData: [],
  pageSource: '',
  initialized: false
}

// === HTTP utility ===

function httpGet(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

// === Init ===

export async function initComcigan(): Promise<void> {
  if (state.initialized) return

  const mainBuf = await httpGet('http://xn--s39aj90b0nb2xw6xh.kr/')
  const html = mainBuf.toString()
  const frame = html
    .toLowerCase()
    .replace(/'/g, '"')
    .match(/<frame [^>]*src="[^"]*"[^>]*>/m)
  if (!frame) throw new Error('frame not found')

  const uri = frame[0].match(/".*?"/i)
  if (!uri) throw new Error('uri not found')

  const frameHref = uri[0].replace(/"/g, '')
  const url = new URL(frameHref)
  state.baseUrl = url.origin

  const pageBuf = await httpGet(frameHref)
  const source = iconv.decode(pageBuf, 'EUC-KR')

  const idx = source.indexOf('school_ra(sc)')
  const idx2 = source.indexOf("sc_data('")

  if (idx === -1 || idx2 === -1) {
    throw new Error('Cannot find identification codes in source')
  }

  const extractSchoolRa = source.substr(idx, 50).replace(' ', '')
  const schoolRa = extractSchoolRa.match(/url:'.(.*?)'/)
  if (!schoolRa) throw new Error('extract code not found')
  state.extractCode = schoolRa[1]

  const extractScData = source.substr(idx2, 30).replace(' ', '')
  const scData = extractScData.match(/\(.*?\)/)
  if (!scData) throw new Error('sc_data not found')
  state.scData = scData[0]
    .replace(/[()]/g, '')
    .replace(/'/g, '')
    .split(',')

  state.pageSource = source
  state.initialized = true
}

// === School search ===

export async function searchSchool(keyword: string): Promise<ComciganSearchResult[]> {
  await initComcigan()

  let hexString = ''
  for (const byte of iconv.encode(keyword, 'euc-kr')) {
    hexString += '%' + byte.toString(16)
  }

  const searchUrl = state.baseUrl + state.extractCode + hexString
  const buf = await httpGet(searchUrl)
  const text = buf.toString()
  const jsonStr = text.substr(0, text.lastIndexOf('}') + 1)

  interface SearchResponse {
    '\uD559\uAD50\uAC80\uC0C9': [number, string, string, number][]
  }
  const data = JSON.parse(jsonStr) as SearchResponse
  const results = data['\uD559\uAD50\uAC80\uC0C9'] || []

  if (results.length <= 0) {
    return []
  }

  return results.map(([innerCode, region, name, code]) => ({
    _: innerCode,
    region,
    name,
    code
  }))
}

// === Timetable fetch ===

function parseHtmlTable(htmlStr: string, grade: number, classNum: number): ComciganPeriodItem[][] {
  const weekdayString = ['일', '월', '화', '수', '목', '금', '토']
  const timetable: ComciganPeriodItem[][] = []

  // Extract rows with regex instead of cheerio
  const trMatches = htmlStr.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || []

  for (let timeIdx = 0; timeIdx < trMatches.length; timeIdx++) {
    const currentTime = timeIdx - 2
    if (timeIdx <= 1) continue

    const tdMatches = trMatches[timeIdx].match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []

    for (let weekDayIdx = 0; weekDayIdx < tdMatches.length; weekDayIdx++) {
      const currentWeekDay = weekDayIdx - 1
      if (weekDayIdx === 0 || weekDayIdx === 6) continue

      if (!timetable[currentWeekDay]) {
        timetable[currentWeekDay] = []
      }

      // Extract text content, strip HTML tags
      const cellHtml = tdMatches[weekDayIdx].replace(/<td[^>]*>/, '').replace(/<\/td>/, '')
      // Split by <br> to get subject and teacher
      const parts = cellHtml.split(/<br\s*\/?>/i).map((p: string) => p.replace(/<[^>]*>/g, '').trim())

      const subject = parts[0] || ''
      const teacher = parts.length > 1 ? parts[parts.length - 1] : ''

      timetable[currentWeekDay][currentTime] = {
        grade,
        class: classNum,
        weekday: weekDayIdx - 1,
        weekdayString: weekdayString[weekDayIdx],
        classTime: currentTime + 1,
        teacher,
        subject
      }
    }
  }

  return timetable
}

export async function fetchTimetable(
  schoolCode: number,
  maxGrade: number
): Promise<ComciganTimetableData> {
  await initComcigan()

  const da1 = '0'
  const s7 = state.scData[0] + schoolCode
  const sc3 =
    state.extractCode.split('?')[0] +
    '?' +
    Buffer.from(s7 + '_' + da1 + '_' + state.scData[2]).toString('base64')

  const dataUrl = state.baseUrl + sc3
  const buf = await httpGet(dataUrl)
  const body = buf.toString()

  if (!body) {
    throw new Error('No timetable data received')
  }

  const jsonString = body.substr(0, body.lastIndexOf('}') + 1)
  const resultJson = JSON.parse(jsonString) as {
    '\uD559\uAE09\uC218': number[]
  }

  // Extract JavaScript from page source
  const startTagMatch = state.pageSource.match(/<script language(.*?)>/gm)
  if (!startTagMatch) throw new Error('script tag not found')
  const startTag = startTagMatch[0]
  const regex = new RegExp(startTag + '(.*?)</script>', 'gi')

  let match: RegExpExecArray | null
  let script = ''
  while ((match = regex.exec(state.pageSource))) {
    script += match[1]
  }

  // Extract data processing function name
  const funcNameMatch = script.match(/function 자료[^(]*/gm)
  if (!funcNameMatch) throw new Error('data function not found')
  const functionName = funcNameMatch[0].replace(/\+s/, '').replace('function', '')

  const classCount = resultJson['\uD559\uAE09\uC218']

  const timetableData: ComciganTimetableData = {}

  for (let grade = 1; grade <= maxGrade; grade++) {
    if (!timetableData[grade]) {
      timetableData[grade] = {}
    }

    for (let classNum = 1; classNum <= classCount[grade]; classNum++) {
      const args = [jsonString, grade, classNum]
      const call = functionName + '(' + args.join(',') + ')'
      const evalScript = script + '\n\n' + call

      // eslint-disable-next-line no-eval
      const res = eval(evalScript) as string

      timetableData[grade][classNum] = parseHtmlTable(res, grade, classNum)
    }
  }

  return timetableData
}
