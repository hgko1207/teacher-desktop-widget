import { type ReactNode } from 'react'
import { Calendar, Sun, Wind } from 'lucide-react'
import { useCurrentTime } from '../../hooks/useCurrentTime'

export function ClockWidget(): ReactNode {
  const { hours, minutes, seconds, dateString, dayName } = useCurrentTime()
  const pad = (n: number): string => String(n).padStart(2, '0')

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
          <Sun size={14} style={{ color: '#f59e0b' }} />
          맑음, 12°C
        </div>

        {/* 미세먼지 뱃지 */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
          style={{
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0'
          }}
        >
          <Wind size={14} />
          미세먼지 좋음
        </div>
      </div>
    </div>
  )
}
