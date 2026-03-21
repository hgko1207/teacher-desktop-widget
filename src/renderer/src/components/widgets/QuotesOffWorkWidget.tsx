import { useState, useEffect, type ReactNode } from 'react'
import { Coffee, Heart } from 'lucide-react'
import { useCurrentTime } from '../../hooks/useCurrentTime'
import { useSettingsStore } from '../../stores/settingsStore'

const QUOTES = [
  '오늘 하루도 수고했어요!',
  '작은 변화가 큰 성장을 만듭니다.',
  '학생들의 미래를 밝히는 당신, 멋져요.',
  '쉬어가도 괜찮아요.',
  '당신의 노력은 빛나고 있어요.',
  '오늘의 가르침이 내일의 기적이 됩니다.',
  '좋은 선생님이 좋은 세상을 만듭니다.',
  '힘든 날도 있지만, 보람찬 날이 더 많을 거예요.'
]

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '16px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

export function QuotesOffWorkWidget(): ReactNode {
  const { hours, minutes } = useCurrentTime()
  const offWorkTime = useSettingsStore((s) => s.settings.offWorkTime)
  const [quoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [offWorkText, setOffWorkText] = useState('')

  useEffect(() => {
    const [targetH, targetM] = offWorkTime.split(':').map(Number)
    const targetMinutes = (targetH ?? 16) * 60 + (targetM ?? 30)
    const nowMinutes = hours * 60 + minutes
    const diff = targetMinutes - nowMinutes

    if (diff <= 0) {
      setOffWorkText('퇴근 시간이에요!')
    } else {
      const h = Math.floor(diff / 60)
      const m = diff % 60
      if (h > 0) {
        setOffWorkText(`${h}시간 ${m}분`)
      } else {
        setOffWorkText(`${m}분`)
      }
    }
  }, [hours, minutes, offWorkTime])

  return (
    <div className="h-full flex flex-col justify-center" style={{ ...CARD_STYLE, padding: '14px' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="flex items-center gap-1" style={{ fontSize: '11px', color: '#94a3b8' }}>
            <Coffee size={12} /> 행복한 퇴근까지
          </p>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#334155' }}>{offWorkText}</div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
        <p className="flex items-center gap-1" style={{ fontSize: '10px', color: '#64748b' }}>
          <Heart size={10} style={{ color: '#fb7185' }} /> {QUOTES[quoteIndex]}
        </p>
      </div>
    </div>
  )
}
