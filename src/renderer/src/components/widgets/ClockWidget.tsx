import { type ReactNode } from 'react'
import { Calendar } from 'lucide-react'
import { useCurrentTime } from '../../hooks/useCurrentTime'

export function ClockWidget(): ReactNode {
  const { hours, minutes, seconds, dateString, dayName } = useCurrentTime()
  const pad = (n: number): string => String(n).padStart(2, '0')

  return (
    <div
      className="h-full p-4 flex flex-col justify-center"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
    >
      <p className="text-[10px] font-medium" style={{ color: '#999' }}>현재 시각</p>
      <div className="flex items-baseline mt-0.5">
        <span
          className="font-extrabold tracking-tight leading-none"
          style={{ fontSize: '48px', color: '#1a1a2e' }}
        >
          {pad(hours)}:{pad(minutes)}
        </span>
        <span className="ml-1 font-normal" style={{ fontSize: '20px', color: '#bbb' }}>
          {pad(seconds)}
        </span>
      </div>
      <div
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg mt-2 self-start"
        style={{ background: '#eef0ff', color: '#4338ca' }}
      >
        <Calendar size={12} />
        <span className="text-xs font-semibold">{dateString} {dayName}</span>
      </div>
    </div>
  )
}
