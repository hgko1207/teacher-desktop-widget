import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { Calendar, Wind } from 'lucide-react'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { useSettingsStore } from '../../stores/settingsStore'
import type { WeatherData } from '../../types'

const WEATHER_CACHE_DURATION = 30 * 60 * 1000 // 30분

export function ClockWidget(): ReactNode {
  const { hours, minutes, seconds, dateString, dayName } = useCurrentTime()
  const region = useSettingsStore((s) => s.settings.region)
  const pad = (n: number): string => String(n).padStart(2, '0')

  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherError, setWeatherError] = useState(false)

  const fetchWeather = useCallback(async (): Promise<void> => {
    try {
      // 캐시 확인
      const cached = await window.api.loadStore('weatherCache')
      if (cached && typeof cached === 'object' && 'fetchedAt' in (cached as WeatherData)) {
        const w = cached as WeatherData
        if (Date.now() - w.fetchedAt < WEATHER_CACHE_DURATION) {
          setWeather(w)
          setWeatherError(false)
          return
        }
      }

      // 새로 fetch
      const result = await window.api.fetchWeather(region)
      if (result) {
        const weatherData: WeatherData = {
          temp: result.temp,
          condition: result.condition,
          tempMin: result.tempMin,
          tempMax: result.tempMax,
          humidity: result.humidity,
          icon: result.icon,
          fetchedAt: result.fetchedAt
        }
        setWeather(weatherData)
        setWeatherError(false)
        await window.api.saveStore('weatherCache', weatherData)
      } else {
        setWeatherError(true)
      }
    } catch {
      setWeatherError(true)
    }
  }, [region])

  useEffect(() => {
    fetchWeather()
    // 30분마다 갱신
    const interval = setInterval(() => {
      fetchWeather()
    }, WEATHER_CACHE_DURATION)
    return (): void => clearInterval(interval)
  }, [fetchWeather])

  return (
    <div
      className="h-full p-6 flex flex-col justify-between"
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: '#888' }}>현재 시각</p>
        <div className="flex items-baseline mt-1">
          <span
            className="font-extrabold tracking-tight leading-none"
            style={{ fontSize: '72px', color: '#1a1a2e' }}
          >
            {pad(hours)}:{pad(minutes)}
          </span>
          <span className="ml-2 font-normal" style={{ fontSize: '28px', color: '#aaa' }}>
            {pad(seconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* 날짜 뱃지 */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: '#eef0ff', color: '#4338ca' }}
        >
          <Calendar size={14} />
          <span className="text-sm font-medium">{dateString} {dayName}</span>
        </div>

        {/* 날씨 뱃지 */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
          style={{
            background: '#fff',
            color: '#555',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}
        >
          {weather ? (
            <>
              <span style={{ fontSize: '14px' }}>{weather.icon}</span>
              {weather.condition}, {weather.temp}°C
            </>
          ) : weatherError ? (
            <span style={{ color: '#aaa' }}>날씨 정보 없음</span>
          ) : (
            <span style={{ color: '#aaa' }}>로딩중...</span>
          )}
        </div>

        {/* 습도 뱃지 */}
        {weather && (
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0'
            }}
          >
            <Wind size={14} />
            습도 {weather.humidity}%
          </div>
        )}
      </div>
    </div>
  )
}
