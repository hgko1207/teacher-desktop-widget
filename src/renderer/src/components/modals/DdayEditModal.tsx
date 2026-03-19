import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, Plus, Star, Trash2, CalendarDays } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { DdayItem } from '../../types'

interface DdayEditModalProps {
  open: boolean
  onClose: () => void
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function calcDdays(targetDate: string): number {
  const target = new Date(targetDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function ddayText(diff: number): string {
  if (diff > 0) return `D-${diff}`
  if (diff === 0) return 'D-Day!'
  return `D+${Math.abs(diff)}`
}

function ddayColor(diff: number): string {
  if (diff <= 0) return '#ef4444'
  if (diff <= 7) return '#ef4444'
  if (diff <= 30) return '#f59e0b'
  return '#1f2937'
}

export function DdayEditModal({ open, onClose }: DdayEditModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [items, setItems] = useState<DdayItem[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const loadItems = useCallback(async (): Promise<void> => {
    const stored = await window.api.loadStore('ddays') as DdayItem[] | null
    if (stored && Array.isArray(stored)) {
      setItems(stored)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadItems()
    }
  }, [open, loadItems])

  const save = useCallback(async (next: DdayItem[]): Promise<void> => {
    setItems(next)
    await window.api.saveStore('ddays', next)
  }, [])

  const handleAdd = (): void => {
    if (!newTitle.trim() || !newDate) return
    const item: DdayItem = {
      id: generateId(),
      title: newTitle.trim(),
      targetDate: newDate
    }
    const next = [...items, item]
    save(next)
    setNewTitle('')
    setNewDate('')
  }

  const handleDelete = (id: string): void => {
    if (confirmDeleteId === id) {
      const next = items.filter((it) => it.id !== id)
      save(next)
      setConfirmDeleteId(null)
    } else {
      setConfirmDeleteId(id)
    }
  }

  const handlePin = (id: string): void => {
    const idx = items.findIndex((it) => it.id === id)
    if (idx <= 0) return
    const next = [...items]
    const [item] = next.splice(idx, 1)
    next.unshift(item)
    save(next)
  }

  if (!open) return null

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
          <div className="flex items-center gap-2">
            <CalendarDays size={20} style={{ color: theme.primary }} />
            <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>D-Day 관리</h2>
          </div>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: '#f3f4f6' }}
            onClick={onClose}
          >
            <X size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Add new */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="D-Day 제목"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: theme.accent, color: '#fff' }}
            onClick={handleAdd}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* D-Day list */}
        <div
          className="flex flex-col gap-2"
          style={{ maxHeight: '320px', overflowY: 'auto' }}
        >
          {items.length === 0 && (
            <div className="py-8 text-center">
              <span className="text-sm" style={{ color: '#9ca3af' }}>D-Day를 추가하세요</span>
            </div>
          )}
          {items.map((item, idx) => {
            const diff = calcDdays(item.targetDate)
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: idx === 0 ? theme.bg : '#f9fafb',
                  border: idx === 0 ? `1px solid ${theme.border}` : '1px solid #f3f4f6'
                }}
              >
                {/* Pin/star button */}
                <button
                  className="flex-shrink-0"
                  style={{ color: idx === 0 ? theme.accent : '#d1d5db', cursor: idx === 0 ? 'default' : 'pointer' }}
                  onClick={() => handlePin(item.id)}
                  title="메인 D-Day로 설정"
                >
                  <Star size={16} fill={idx === 0 ? theme.accent : 'none'} />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: '#1f2937' }}>
                    {item.title}
                  </div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>
                    {item.targetDate}
                  </div>
                </div>

                {/* D-Day count */}
                <span
                  className="text-sm font-bold flex-shrink-0"
                  style={{ color: ddayColor(diff) }}
                >
                  {ddayText(diff)}
                </span>

                {/* Delete button */}
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    background: confirmDeleteId === item.id ? '#fee2e2' : '#f3f4f6',
                    color: confirmDeleteId === item.id ? '#ef4444' : '#9ca3af'
                  }}
                  onClick={() => handleDelete(item.id)}
                  title={confirmDeleteId === item.id ? '한번 더 클릭하면 삭제' : '삭제'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Hint */}
        <div className="mt-4 text-center">
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            별 아이콘을 클릭하면 위젯에 표시할 메인 D-Day를 변경할 수 있습니다
          </span>
        </div>
      </div>
    </div>
  )
}
