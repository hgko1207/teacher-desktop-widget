import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { CloudSun } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const CACHE_MS = 30 * 60 * 1000

const CARD_STYLE = {
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

  useEffect(() => {
    load()
    const i = setInterval(load, CACHE_MS)
    return (): void => clearInterval(i)
  }, [load])

  return (
    <div className="h-full p-4 flex items-center justify-between" style={CARD_STYLE}>
      <div>
        <p className="flex items-center gap-1" style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
          <CloudSun size={12} /> 오늘 날씨 <span style={{ color: '#cbd5e1' }}>{region}</span>
        </p>
        {weather ? (
          <>
            <div className="flex items-end gap-2 mt-1">
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#1e293b' }}>{weather.temp}°</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>{weather.condition}</span>
            </div>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              <span style={{ color: '#3b82f6' }}>최저 {weather.tempMin}°</span> / <span style={{ color: '#f87171' }}>최고 {weather.tempMax}°</span>
            </p>
          </>
        ) : error ? (
          <span style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>날씨 정보 없음</span>
        ) : (
          <span style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>로딩중...</span>
        )}
      </div>
      {weather && (
        <span style={{ fontSize: '36px', opacity: 0.3 }}>{weather.icon}</span>
      )}
    </div>
  )
}
