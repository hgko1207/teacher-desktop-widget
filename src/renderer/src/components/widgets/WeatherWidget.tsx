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
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '8px', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
              미세 39 보통
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '3px 8px', borderRadius: '8px', border: '1px solid #bfdbfe', whiteSpace: 'nowrap' }}>
              초미세 29 보통
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
