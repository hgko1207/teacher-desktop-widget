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
    <div className="h-full p-6 flex flex-col justify-between"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: '#888' }}>현재 시각</p>
        <div className="flex items-baseline mt-1">
          <span className="font-extrabold tracking-tight leading-none" style={{ fontSize: '72px', color: '#1a1a2e' }}>
            {pad(hours)}:{pad(minutes)}
          </span>
          <span className="ml-2 font-normal" style={{ fontSize: '28px', color: '#aaa' }}>{pad(seconds)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* 날짜 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: '#eef0ff', color: '#4338ca' }}>
          <Calendar size={14} />
          <span className="text-sm font-medium">{dateString} {dayName}</span>
        </div>

        {/* 날씨 */}
        {weather ? (
          <>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
              <span style={{ fontSize: '14px' }}>{weather.icon}</span>
              {weather.temp}°C {weather.condition}
              <span style={{ color: '#d4a017', fontWeight: 400 }}>
                (최저 {weather.tempMin}° / 최고 {weather.tempMax}°)
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
              <Droplets size={13} />
              습도 {weather.humidity}%
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
              <Wind size={13} />
              미세먼지 보통
            </div>
          </>
        ) : error ? (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            날씨 정보를 불러올 수 없습니다
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: '#f9fafb', color: '#aaa' }}>
            날씨 로딩중...
          </div>
        )}
      </div>
    </div>
  )
}
