import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, CheckSquare, Square, RotateCcw } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { SubmissionRecord } from '../../types'

interface MissingSubmissionModalProps {
  onClose: () => void
}

export function MissingSubmissionModal({ onClose }: MissingSubmissionModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [studentCount, setStudentCount] = useState(30)
  const [title, setTitle] = useState('')
  const [checkedNumbers, setCheckedNumbers] = useState<number[]>([])
  const [savedRecords, setSavedRecords] = useState<SubmissionRecord[]>([])

  // Load data from store
  useEffect(() => {
    window.api.loadStore('studentCount').then((data) => {
      if (typeof data === 'number' && data > 0) {
        setStudentCount(data)
      }
    })
    window.api.loadStore('submissionRecords').then((data) => {
      if (Array.isArray(data)) {
        setSavedRecords(data as SubmissionRecord[])
      }
    })
  }, [])

  // When title changes, load matching record
  useEffect(() => {
    if (title.trim()) {
      const found = savedRecords.find((r) => r.title === title.trim())
      if (found) {
        setCheckedNumbers(found.checkedNumbers)
      } else {
        setCheckedNumbers([])
      }
    }
  }, [title, savedRecords])

  const saveRecords = useCallback((records: SubmissionRecord[]): void => {
    setSavedRecords(records)
    window.api.saveStore('submissionRecords', records)
  }, [])

  const toggleNumber = (num: number): void => {
    setCheckedNumbers((prev) => {
      const next = prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
      // Auto-save if title exists
      if (title.trim()) {
        const existing = savedRecords.filter((r) => r.title !== title.trim())
        saveRecords([...existing, { title: title.trim(), checkedNumbers: next }])
      }
      return next
    })
  }

  const selectAll = (): void => {
    const all = Array.from({ length: studentCount }, (_, i) => i + 1)
    setCheckedNumbers(all)
    if (title.trim()) {
      const existing = savedRecords.filter((r) => r.title !== title.trim())
      saveRecords([...existing, { title: title.trim(), checkedNumbers: all }])
    }
  }

  const deselectAll = (): void => {
    setCheckedNumbers([])
    if (title.trim()) {
      const existing = savedRecords.filter((r) => r.title !== title.trim())
      saveRecords([...existing, { title: title.trim(), checkedNumbers: [] }])
    }
  }

  const missingCount = studentCount - checkedNumbers.filter((n) => n <= studentCount).length
  const allNumbers = Array.from({ length: studentCount }, (_, i) => i + 1)

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg p-6"
        style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>미제출자 체크</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: '#f3f4f6' }}
            onClick={onClose}
          >
            <X size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Title input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="확인할 항목 (예: 가정통신문, 체험학습 동의서)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          {savedRecords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {savedRecords.map((r) => (
                <button
                  key={r.title}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background: title.trim() === r.title ? theme.accent : theme.bg,
                    color: title.trim() === r.title ? '#fff' : theme.primary,
                    border: `1px solid ${theme.border}`
                  }}
                  onClick={() => setTitle(r.title)}
                >
                  {r.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: missingCount > 0 ? '#ef4444' : '#16a34a' }}
            >
              미제출 {missingCount}명
            </span>
            <span className="text-sm" style={{ color: '#9ca3af' }}>/ 전체 {studentCount}명</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all hover:scale-105"
              style={{ background: theme.bg, color: theme.primary, border: `1px solid ${theme.border}` }}
              onClick={selectAll}
            >
              <CheckSquare size={12} />
              전체 선택
            </button>
            <button
              className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all hover:scale-105"
              style={{ background: '#f3f4f6', color: '#6b7280' }}
              onClick={deselectAll}
            >
              <RotateCcw size={12} />
              전체 해제
            </button>
          </div>
        </div>

        {/* Number grid */}
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))' }}>
          {allNumbers.map((num) => {
            const isChecked = checkedNumbers.includes(num)
            return (
              <button
                key={num}
                className="h-10 rounded-lg text-xs font-bold flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: isChecked ? '#e5e7eb' : '#fef2f2',
                  color: isChecked ? '#9ca3af' : '#ef4444',
                  border: isChecked ? '1px solid #d1d5db' : '2px solid #fca5a5',
                  textDecoration: isChecked ? 'line-through' : 'none'
                }}
                onClick={() => toggleNumber(num)}
              >
                {num}
              </button>
            )
          })}
        </div>

        {/* Missing numbers summary */}
        {missingCount > 0 && (
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Square size={12} style={{ color: '#ef4444' }} />
              <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>미제출 학생</span>
            </div>
            <span className="text-sm font-medium" style={{ color: '#dc2626' }}>
              {allNumbers.filter((n) => !checkedNumbers.includes(n)).join(', ')}번
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
