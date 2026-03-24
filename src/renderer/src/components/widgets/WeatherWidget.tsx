import { useState, useEffect, useCallback, type ReactNode } from 'react'

import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData, DustData } from '../../types'

const WEATHER_CACHE_MS = 30 * 60 * 1000
const DUST_CACHE_MS = 30 * 60 * 1000
const CARD = {
  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)', borderRadius: '16px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

interface DustDisplay {
  pm10: number
  pm25: number
  pm10Grade: string
  pm25Grade: string
}

function getDustColor(grade: string): { color: string; bg: string; border: string } {
  switch (grade) {
    case '좋음': return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
    case '보통': return { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
    case '나쁨': return { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' }
    case '매우나쁨': return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
    default: return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
  }
}

export function WeatherWidget(): ReactNode {
  const region = useSettingsStore((s) => s.settings.region)
  const airApiKey = useSettingsStore((s) => s.settings.airApiKey)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [dust, setDust] = useState<DustDisplay>({ pm10: 39, pm25: 29, pm10Grade: '보통', pm25Grade: '보통' })
  const [error, setError] = useState(false)

  const loadWeather = useCallback(async (): Promise<void> => {
    try {
      const cached = await window.api.loadStore('weatherCache')
      if (cached && typeof cached === 'object' && 'fetchedAt' in (cached as WeatherData)) {
        const w = cached as WeatherData
        if (Date.now() - w.fetchedAt < WEATHER_CACHE_MS) { setWeather(w); setError(false); return }
      }
      const r = await window.api.fetchWeather(region)
      if (r) {
        const w: WeatherData = { temp: r.temp, condition: r.condition, tempMin: r.tempMin, tempMax: r.tempMax, humidity: r.humidity, icon: r.icon, fetchedAt: r.fetchedAt }
        setWeather(w); setError(false)
        await window.api.saveStore('weatherCache', w)
      } else { setError(true) }
    } catch { setError(true) }
  }, [region])

  const loadDust = useCallback(async (): Promise<void> => {
    try {
      // Check cache first
      const cached = await window.api.loadStore('dustCache')
      if (cached && typeof cached === 'object' && 'fetchedAt' in (cached as DustData)) {
        const d = cached as DustData
        if (Date.now() - d.fetchedAt < DUST_CACHE_MS) {
          setDust({ pm10: d.pm10, pm25: d.pm25, pm10Grade: d.pm10Grade, pm25Grade: d.pm25Grade })
          return
        }
      }
      if (!airApiKey) return // keep default values
      const r = await window.api.fetchDust(airApiKey, region)
      if (r) {
        const d: DustData = { pm10: r.pm10, pm25: r.pm25, pm10Grade: r.pm10Grade, pm25Grade: r.pm25Grade, fetchedAt: Date.now() }
        setDust({ pm10: r.pm10, pm25: r.pm25, pm10Grade: r.pm10Grade, pm25Grade: r.pm25Grade })
        await window.api.saveStore('dustCache', d)
      }
    } catch {
      // keep defaults
    }
  }, [airApiKey, region])

  useEffect(() => {
    loadWeather()
    loadDust()
    const i = setInterval(() => { loadWeather(); loadDust() }, WEATHER_CACHE_MS)
    return (): void => clearInterval(i)
  }, [loadWeather, loadDust])

  const pm10Style = getDustColor(dust.pm10Grade)
  const pm25Style = getDustColor(dust.pm25Grade)

  return (
    <div className="h-full flex flex-col" style={{ ...CARD, padding: '14px' }}>
      {/* 타이틀 */}
      <div className="flex items-center gap-1.5 shrink-0" style={{ marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>오늘 날씨</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>{region}</span>
      </div>

      {weather ? (
        <div className="flex-1 flex items-center" style={{ gap: '12px' }}>
          {/* 아이콘 (좌측, 배경 원 안에) */}
          <div className="shrink-0 flex items-center justify-center" style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #fef3c7, #e0f2fe)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <span style={{ fontSize: '30px', lineHeight: 1 }}>{weather.icon}</span>
          </div>

          {/* 날씨 정보 (중앙) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{weather.temp}°</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{weather.condition}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
              최저 <span style={{ color: '#3b82f6', fontWeight: 600 }}>{weather.tempMin}°</span> / 최고 <span style={{ color: '#f87171', fontWeight: 600 }}>{weather.tempMax}°</span>
            </p>
          </div>

          {/* 미세먼지 (우측 세로) */}
          <div className="flex flex-col shrink-0" style={{ gap: '5px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: pm10Style.color, background: pm10Style.bg,
              padding: '3px 8px', borderRadius: '8px',
              border: `1px solid ${pm10Style.border}`, whiteSpace: 'nowrap'
            }}>
              미세 {dust.pm10} {dust.pm10Grade}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: pm25Style.color, background: pm25Style.bg,
              padding: '3px 8px', borderRadius: '8px',
              border: `1px solid ${pm25Style.border}`, whiteSpace: 'nowrap'
            }}>
              초미세 {dust.pm25} {dust.pm25Grade}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{error ? '날씨 정보 없음' : '로딩중...'}</span>
        </div>
      )}
    </div>
  )
}
