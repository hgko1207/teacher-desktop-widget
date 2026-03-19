import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { X, Shuffle, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

interface RandomPickerModalProps {
  onClose: () => void
}

export function RandomPickerModal({ onClose }: RandomPickerModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [studentCount, setStudentCount] = useState(30)
  const [pickedNumbers, setPickedNumbers] = useState<number[]>([])
  const [excludePicked, setExcludePicked] = useState(false)
  const [currentDisplay, setCurrentDisplay] = useState<number | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load studentCount from store
  useEffect(() => {
    window.api.loadStore('studentCount').then((data) => {
      if (typeof data === 'number' && data > 0) {
        setStudentCount(data)
      }
    })
  }, [])

  // Save studentCount to store
  const saveStudentCount = useCallback((count: number): void => {
    setStudentCount(count)
    window.api.saveStore('studentCount', count)
  }, [])

  const getAvailableNumbers = useCallback((): number[] => {
    const all = Array.from({ length: studentCount }, (_, i) => i + 1)
    if (excludePicked) {
      return all.filter((n) => !pickedNumbers.includes(n))
    }
    return all
  }, [studentCount, excludePicked, pickedNumbers])

  const pick = (): void => {
    const available = getAvailableNumbers()
    if (available.length === 0) return

    setIsAnimating(true)
    setResult(null)

    let count = 0
    const totalTicks = 30
    animationRef.current = setInterval(() => {
      count++
      const randomIdx = Math.floor(Math.random() * available.length)
      setCurrentDisplay(available[randomIdx])

      if (count >= totalTicks) {
        if (animationRef.current) clearInterval(animationRef.current)
        const finalIdx = Math.floor(Math.random() * available.length)
        const picked = available[finalIdx]
        setCurrentDisplay(picked)
        setResult(picked)
        setIsAnimating(false)
        setPickedNumbers((prev) => {
          if (prev.includes(picked)) return prev
          return [...prev, picked]
        })
      }
    }, 70)
  }

  useEffect(() => {
    return (): void => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [])

  const resetPicked = (): void => {
    setPickedNumbers([])
    setResult(null)
    setCurrentDisplay(null)
  }

  const available = getAvailableNumbers()

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
          <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>랜덤 학생 뽑기</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: '#f3f4f6' }}
            onClick={onClose}
          >
            <X size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Student count setting */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-sm font-medium" style={{ color: '#374151' }}>학생 수:</span>
          <input
            type="number"
            min={1}
            max={100}
            value={studentCount}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              if (v > 0 && v <= 100) saveStudentCount(v)
            }}
            className="w-20 px-3 py-1.5 rounded-lg text-sm text-center"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          <span className="text-xs" style={{ color: '#9ca3af' }}>명</span>
        </div>

        {/* Display area */}
        <div
          className="flex flex-col items-center justify-center py-8 mb-5 rounded-2xl"
          style={{ background: theme.bg, minHeight: 160 }}
        >
          {currentDisplay !== null ? (
            <>
              <span
                className="font-bold font-mono"
                style={{
                  fontSize: isAnimating ? '56px' : '72px',
                  color: isAnimating ? '#9ca3af' : theme.primary,
                  transition: 'all 0.3s ease'
                }}
              >
                {currentDisplay}
              </span>
              {result !== null && !isAnimating && (
                <span
                  className="text-lg font-semibold mt-2"
                  style={{ color: theme.accent }}
                >
                  {result}번 학생!
                </span>
              )}
            </>
          ) : (
            <span className="text-sm" style={{ color: '#9ca3af' }}>
              아래 버튼을 눌러 뽑기를 시작하세요
            </span>
          )}
        </div>

        {/* Pick button */}
        <div className="flex items-center gap-3 justify-center mb-5">
          <button
            className="px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
            style={{
              background: available.length === 0 ? '#d1d5db' : theme.accent,
              color: '#fff',
              boxShadow: available.length > 0 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              cursor: available.length === 0 || isAnimating ? 'not-allowed' : 'pointer'
            }}
            onClick={pick}
            disabled={available.length === 0 || isAnimating}
          >
            <Shuffle size={16} />
            {result !== null ? '다시 뽑기' : '뽑기!'}
          </button>
          <button
            className="px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ background: '#f3f4f6', color: '#6b7280' }}
            onClick={resetPicked}
          >
            <RotateCcw size={14} />
            초기화
          </button>
        </div>

        {/* Exclude toggle */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={excludePicked}
              onChange={(e) => setExcludePicked(e.target.checked)}
              className="rounded"
            />
            <span className="text-xs" style={{ color: '#6b7280' }}>이미 뽑힌 학생 제외</span>
          </label>
        </div>

        {/* Picked list */}
        {pickedNumbers.length > 0 && (
          <div>
            <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
              뽑힌 학생 ({pickedNumbers.length}명):
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {pickedNumbers.sort((a, b) => a - b).map((n) => (
                <span
                  key={n}
                  className="px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{ background: theme.bg, color: theme.primary, border: `1px solid ${theme.border}` }}
                >
                  {n}번
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
