import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Calendar, Droplets, Wind } from 'lucide-react'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const CACHE_MS = 30 * 60 * 1000

export function ClockWidget(): ReactNode {
  const { hours, minutes, seconds, dateString, dayName } = useCurrentTime()
  const region = useSettingsStore((s) => s.settings.region)
  const pad = (n: number): string => String(n).padStart(2, '0')

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async (): Promise<void> => {
    try {
      const cached = await window.api.loadStore('weatherCache')
      if (cached && typeof cached === 'object' && 'fetchedAt' in (cached as WeatherData)) {
        const w = cached as WeatherData
        if (Date.now() - w.fetchedAt < CACHE_MS) { setWeather(w); setError(false); return }
      }
      const r = await window.api.fetchWeather(region)
      if (r) {
        const w: WeatherData = { temp: r.temp, condition: r.condition, tempMin: r.tempMin, tempMax: r.tempMax, humidity: r.humidity, icon: r.icon, fetchedAt: r.fetchedAt }
        setWeather(w); setError(false)
        await window.api.saveStore('weatherCache', w)
      } else { setError(true) }
    } catch { setError(true) }
  }, [region])

  useEffect(() => {
    load()
    const i = setInterval(load, CACHE_MS)
    return (): void => clearInterval(i)
  }, [load])

  return (
    <div className="h-full p-4 flex items-center gap-5"
      style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      {/* 시계 */}
      <div className="shrink-0">
        <p className="text-xs font-medium" style={{ color: '#999' }}>현재 시각</p>
        <div className="flex items-baseline">
          <span className="font-extrabold tracking-tight leading-none" style={{ fontSize: '48px', color: '#1a1a2e' }}>
            {pad(hours)}:{pad(minutes)}
          </span>
          <span className="ml-1 font-normal" style={{ fontSize: '20px', color: '#bbb' }}>{pad(seconds)}</span>
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ width: '1px', height: '50px', background: '#e5e7eb' }} />

      {/* 날짜 + 날씨 뱃지들 */}
      <div className="flex flex-col gap-1.5 min-w-0">
        {/* 날짜 */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: '#eef0ff', color: '#4338ca' }}>
          <Calendar size={12} />
          <span className="text-xs font-semibold">{dateString} {dayName}</span>
        </div>

        {/* 날씨 행 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {weather ? (
            <>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                <span>{weather.icon}</span>
                {weather.temp}°C {weather.condition}
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                <Droplets size={10} />
                {weather.humidity}%
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                <Wind size={10} />
                미세먼지 보통
              </div>
            </>
          ) : error ? (
            <span className="text-xs" style={{ color: '#ccc' }}>날씨 정보 없음</span>
          ) : (
            <span className="text-xs" style={{ color: '#ccc' }}>날씨 로딩중...</span>
          )}
        </div>
      </div>
    </div>
  )
}
