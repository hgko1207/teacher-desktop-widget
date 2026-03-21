import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { CloudSun, Droplets } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const CACHE_MS = 30 * 60 * 1000

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
    <div
      className="h-full p-4 flex flex-col justify-between"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <div className="flex items-center gap-1.5">
        <CloudSun size={14} style={{ color: '#f59e0b' }} />
        <span className="text-[10px] font-semibold" style={{ color: '#888' }}>오늘 날씨</span>
        <span className="text-[10px] font-medium ml-auto" style={{ color: '#aaa' }}>{region}</span>
      </div>

      {weather ? (
        <>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: '36px', lineHeight: 1 }}>{weather.icon}</span>
            <div>
              <span className="font-extrabold" style={{ fontSize: '28px', color: '#1a1a2e', lineHeight: 1 }}>
                {weather.temp}°
              </span>
              <p className="text-[10px] font-medium" style={{ color: '#888' }}>
                {weather.condition}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              style={{ background: '#eff6ff', color: '#2563eb' }}
            >
              최저 {weather.tempMin}° / 최고 {weather.tempMax}°
            </div>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
              style={{ background: '#f0fdf4', color: '#16a34a' }}
            >
              <Droplets size={10} />
              {weather.humidity}%
            </div>
          </div>
        </>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs" style={{ color: '#ccc' }}>날씨 정보 없음</span>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs" style={{ color: '#ccc' }}>로딩중...</span>
        </div>
      )}
    </div>
  )
}
