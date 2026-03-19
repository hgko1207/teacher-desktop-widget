import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { X, Play, Pause, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

interface TimerModalProps {
  onClose: () => void
  initialMinutes?: number
}

const PRESETS = [5, 10, 15, 20, 30]

export function TimerModal({ onClose, initialMinutes }: TimerModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [totalSeconds, setTotalSeconds] = useState(initialMinutes ? initialMinutes * 60 : 0)
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes ? initialMinutes * 60 : 0)
  const [isRunning, setIsRunning] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [autoClose, setAutoClose] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const playBeep = useCallback((): void => {
    try {
      const ctx = audioCtxRef.current ?? new AudioContext()
      audioCtxRef.current = ctx
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.value = 880
      oscillator.type = 'sine'
      gainNode.gain.value = 0.5
      oscillator.start()
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
      oscillator.stop(ctx.currentTime + 0.8)
    } catch {
      // Audio API not available
    }
  }, [])

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsCompleted(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return (): void => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, remainingSeconds])

  useEffect(() => {
    if (!isCompleted) return
    playBeep()
    const t1 = setTimeout(() => playBeep(), 800)
    const t2 = setTimeout(() => playBeep(), 1600)
    const t3 = autoClose ? setTimeout(() => onClose(), 3000) : null
    return (): void => {
      clearTimeout(t1)
      clearTimeout(t2)
      if (t3) clearTimeout(t3)
    }
  }, [isCompleted, autoClose, onClose, playBeep])

  useEffect(() => {
    return (): void => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  const selectPreset = (minutes: number): void => {
    const secs = minutes * 60
    setTotalSeconds(secs)
    setRemainingSeconds(secs)
    setIsRunning(false)
    setIsCompleted(false)
  }

  const applyCustom = (): void => {
    const mins = parseInt(customMinutes, 10)
    if (mins > 0 && mins <= 180) {
      selectPreset(mins)
      setCustomMinutes('')
    }
  }

  const toggleRunning = (): void => {
    if (remainingSeconds > 0) {
      setIsRunning((prev) => !prev)
      setIsCompleted(false)
    }
  }

  const reset = (): void => {
    setIsRunning(false)
    setRemainingSeconds(totalSeconds)
    setIsCompleted(false)
  }

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0
  const circumference = 2 * Math.PI * 90

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6"
        style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>팝업 타이머</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: '#f3f4f6' }}
            onClick={onClose}
          >
            <X size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Circular progress */}
        <div className="flex justify-center mb-5">
          <div className="relative" style={{ width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke={isCompleted ? '#ef4444' : theme.accent}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span
                className="font-mono font-bold"
                style={{ fontSize: '42px', color: isCompleted ? '#ef4444' : '#1f2937' }}
              >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              {isCompleted && (
                <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>완료!</span>
              )}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 mb-4 justify-center flex-wrap">
          {PRESETS.map((m) => (
            <button
              key={m}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
              style={{
                background: totalSeconds === m * 60 ? theme.accent : theme.bg,
                color: totalSeconds === m * 60 ? '#fff' : theme.primary,
                border: `1px solid ${theme.border}`
              }}
              onClick={() => selectPreset(m)}
            >
              {m}분
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="flex items-center gap-2 mb-5 justify-center">
          <input
            type="number"
            min={1}
            max={180}
            placeholder="직접 입력 (분)"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyCustom() }}
            className="w-36 px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          <button
            className="px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ background: theme.bg, color: theme.primary, border: `1px solid ${theme.border}` }}
            onClick={applyCustom}
          >
            적용
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 justify-center mb-4">
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: totalSeconds === 0 ? '#d1d5db' : theme.accent,
              color: '#fff',
              boxShadow: totalSeconds > 0 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              cursor: totalSeconds === 0 ? 'not-allowed' : 'pointer'
            }}
            onClick={toggleRunning}
            disabled={totalSeconds === 0}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: '#f3f4f6', color: '#6b7280' }}
            onClick={reset}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Auto-close toggle */}
        <div className="flex items-center justify-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoClose}
              onChange={(e) => setAutoClose(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs" style={{ color: '#6b7280' }}>타이머 종료 후 자동 닫기</span>
          </label>
        </div>
      </div>
    </div>
  )
}
