import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { CloudSun } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const CACHE_MS = 30 * 60 * 1000

const CARD = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '24px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

export function WeatherWidget(): ReactNode {
  const region = useSettingsStore((s) => s.settings.region)
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

  useEffect(() => { load(); const i = setInterval(load, CACHE_MS); return (): void => clearInterval(i) }, [load])

  return (
    <div className="h-full p-3 flex items-center justify-between" style={CARD}>
      <div className="min-w-0">
        <p className="flex items-center gap-1" style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
          <CloudSun size={11} /> 오늘 날씨 <span style={{ color: '#cbd5e1' }}>{region}</span>
        </p>
        {weather ? (
          <>
            <div className="flex items-end gap-1.5 mt-0.5">
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{weather.temp}°</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b', marginBottom: '2px' }}>{weather.condition}</span>
            </div>
            <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
              <span style={{ color: '#3b82f6' }}>최저 {weather.tempMin}°</span> / <span style={{ color: '#f87171' }}>최고 {weather.tempMax}°</span>
            </p>
            {/* 미세먼지 */}
            <div className="flex gap-1 mt-1">
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '1px 5px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                미세 보통
              </span>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '1px 5px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                초미세 좋음
              </span>
            </div>
          </>
        ) : error ? (
          <span style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>날씨 정보 없음</span>
        ) : (
          <span style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>로딩중...</span>
        )}
      </div>
      {weather && <span style={{ fontSize: '32px', opacity: 0.25, flexShrink: 0 }}>{weather.icon}</span>}
    </div>
  )
}
