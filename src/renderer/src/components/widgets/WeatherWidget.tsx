import { useState, useEffect, useCallback, type ReactNode } from 'react'
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
    <div className="h-full flex" style={{ ...CARD, padding: '16px' }}>
      {weather ? (
        <>
          {/* 왼쪽: 큰 날씨 아이콘 */}
          <div className="flex items-center shrink-0" style={{ marginRight: '14px' }}>
            <span style={{ fontSize: '44px', lineHeight: 1 }}>{weather.icon}</span>
          </div>

          {/* 중앙: 날씨 정보 */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#94a3b8' }}>오늘 날씨</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{region}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{weather.temp}°</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{weather.condition}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>
              최저 <span style={{ color: '#3b82f6', fontWeight: 600 }}>{weather.tempMin}°</span> / 최고 <span style={{ color: '#f87171', fontWeight: 600 }}>{weather.tempMax}°</span>
            </p>
          </div>

          {/* 오른쪽: 미세먼지 (세로 배치) */}
          <div className="flex flex-col justify-center shrink-0" style={{ gap: '6px', marginLeft: '10px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '8px', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
              미세 39 보통
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '8px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
              초미세 29 보통
            </span>
          </div>
        </>
      ) : error ? (
        <div className="flex items-center justify-center flex-1">
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>날씨 정보 없음</span>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1">
          <span style={{ fontSize: '12px', color: '#cbd5e1' }}>로딩중...</span>
        </div>
      )}
    </div>
  )
}
