import { type ReactNode } from 'react'
import { Calendar } from 'lucide-react'
import { useCurrentTime } from '../../hooks/useCurrentTime'

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '16px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

export function ClockWidget(): ReactNode {
  const { hours, minutes, seconds, dateString, dayName } = useCurrentTime()
  const pad = (n: number): string => String(n).padStart(2, '0')

  return (
    <div className="h-full flex flex-col justify-center" style={{ ...CARD_STYLE, padding: '14px' }}>
      <p className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>현재 시각</p>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
          {pad(hours)}:{pad(minutes)}
        </span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>{pad(seconds)}</span>
      </div>
      <p className="flex items-center gap-1 mt-1" style={{ fontSize: '11px', color: '#6366f1', fontWeight: 500 }}>
        <Calendar size={10} /> {dateString} {dayName}
      </p>
    </div>
  )
}
