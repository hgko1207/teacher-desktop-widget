import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Cloud } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const CACHE_MS = 30 * 60 * 1000
const CARD = {
  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)', borderRadius: '16px',
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
    <div className="h-full flex flex-col justify-center" style={{ ...CARD, padding: '14px' }}>
      {/* Title row */}
      <div className="flex items-center gap-2 shrink-0" style={{ marginBottom: '4px' }}>
        <Cloud size={16} style={{ color: '#60a5fa' }} />
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>오늘 날씨</span>
      </div>
      {/* Region */}
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '6px', paddingLeft: '24px' }}>
        {region}
      </div>

      {weather ? (
        <>
          {/* Temp + condition */}
          <div className="flex items-baseline gap-2" style={{ marginBottom: '2px' }}>
            <span style={{ fontSize: '26px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{weather.temp}°</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{weather.condition}</span>
          </div>
          {/* Min / Max */}
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
            최저 <span style={{ color: '#3b82f6', fontWeight: 600 }}>{weather.tempMin}°</span> / 최고 <span style={{ color: '#f87171', fontWeight: 600 }}>{weather.tempMax}°</span>
          </p>
          {/* Dust badges */}
          <div className="flex" style={{ gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              미세 39 보통
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              초미세 29 보통
            </span>
          </div>
        </>
      ) : error ? (
        <span style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>날씨 정보 없음</span>
      ) : (
        <span style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', display: 'block' }}>로딩중...</span>
      )}
    </div>
  )
}
