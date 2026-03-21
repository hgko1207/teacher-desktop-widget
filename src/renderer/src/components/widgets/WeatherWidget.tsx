import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const CACHE_MS = 30 * 60 * 1000
const CARD = {
  background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)', borderRadius: '24px',
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
    <div className="h-full p-3 flex items-center" style={{ ...CARD, gap: '10px' }}>
      {/* 왼쪽: 날씨 아이콘 (크게) */}
      {weather && (
        <span style={{ fontSize: '38px', lineHeight: 1, flexShrink: 0 }}>{weather.icon}</span>
      )}

      {/* 오른쪽: 정보 */}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
          오늘 날씨 <span style={{ fontWeight: 600, color: '#64748b' }}>{region}</span>
        </p>
        {weather ? (
          <>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{weather.temp}°</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{weather.condition}</span>
            </div>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
              최저 <span style={{ color: '#3b82f6' }}>{weather.tempMin}°</span> / 최고 <span style={{ color: '#f87171' }}>{weather.tempMax}°</span>
            </p>
            {/* 미세먼지 (수치 포함) */}
            <div className="flex gap-1.5 mt-1.5">
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '1px 6px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                미세 39 보통
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '1px 6px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
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
    </div>
  )
}
