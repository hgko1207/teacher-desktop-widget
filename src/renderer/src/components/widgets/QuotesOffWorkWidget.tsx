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

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.7)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.6)',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  }

  return (
    <div className="h-full grid grid-cols-2 gap-3">
      {/* 퇴근 카운트다운 */}
      <div className="flex flex-col items-center justify-center p-4" style={cardStyle}>
        <Coffee size={28} style={{ color: '#f59e0b' }} />
        <span className="text-xs font-medium mt-2" style={{ color: '#888' }}>
          행복한 퇴근까지
        </span>
        <span className="text-xl font-bold mt-1" style={{ color: '#1a1a2e' }}>
          {offWorkText}
        </span>
      </div>

      {/* 명언 */}
      <div className="flex flex-col items-center justify-center p-4 text-center" style={cardStyle}>
        <Heart size={28} style={{ color: '#ec4899' }} />
        <span className="text-xs font-medium mt-2 leading-relaxed" style={{ color: '#555' }}>
          {QUOTES[quoteIndex]}
        </span>
      </div>
    </div>
  )
}
