import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, Plus, Trash2, Search, Edit3, Check, Copy, ChevronDown } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { DocumentNumber } from '../../types'

interface DocumentNumberModalProps {
  onClose: () => void
}

const CATEGORY_PRESETS = ['공문', '내부결재', '기안문', '보고서', '기타']

let idCounter = Date.now()
function generateId(): string {
  idCounter += 1
  return `docnum-${idCounter}`
}

export function DocumentNumberModal({ onClose }: DocumentNumberModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [entries, setEntries] = useState<DocumentNumber[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newCategory, setNewCategory] = useState('공문')
  const [newMemo, setNewMemo] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editNumber, setEditNumber] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editMemo, setEditMemo] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    window.api.loadStore('documentNumbers').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setEntries(data as DocumentNumber[])
      }
      setLoaded(true)
    })
  }, [])

  const saveEntries = useCallback((updated: DocumentNumber[]): void => {
    setEntries(updated)
    window.api.saveStore('documentNumbers', updated)
  }, [])

  const addEntry = (): void => {
    if (!newTitle.trim() || !newNumber.trim()) return
    const entry: DocumentNumber = {
      id: generateId(),
      title: newTitle.trim(),
      number: newNumber.trim(),
      category: newCategory,
      memo: newMemo.trim(),
      addedAt: new Date().toISOString()
    }
    saveEntries([entry, ...entries])
    setNewTitle('')
    setNewNumber('')
    setNewCategory('공문')
    setNewMemo('')
    setShowAddForm(false)
  }

  const deleteEntry = (id: string): void => {
    saveEntries(entries.filter((e) => e.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const startEdit = (entry: DocumentNumber): void => {
    setEditingId(entry.id)
    setEditTitle(entry.title)
    setEditNumber(entry.number)
    setEditCategory(entry.category)
    setEditMemo(entry.memo)
  }

  const confirmEdit = (): void => {
    if (!editingId || !editTitle.trim()) return
    saveEntries(
      entries.map((e) =>
        e.id === editingId
          ? { ...e, title: editTitle.trim(), number: editNumber.trim(), category: editCategory, memo: editMemo.trim() }
          : e
      )
    )
    setEditingId(null)
  }

  const copyNumber = (entry: DocumentNumber): void => {
    navigator.clipboard.writeText(entry.number)
    setCopiedId(entry.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return e.title.toLowerCase().includes(q) || e.number.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
  })

  if (!loaded) return null

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
          <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>문서번호 관리</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: '#f3f4f6' }}
            onClick={onClose}
          >
            <X size={16} style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="제목, 번호 또는 분류 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
        </div>

        {/* Add toggle button */}
        {!showAddForm && (
          <button
            className="w-full mb-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{ background: theme.bg, color: theme.primary, border: `1px solid ${theme.border}` }}
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={14} />
            새 문서번호 추가
          </button>
        )}

        {/* Add new entry form */}
        {showAddForm && (
          <div
            className="mb-4 p-4 rounded-xl"
            style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="제목 (예: 학교안전계획)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
                autoFocus
              />
              <div className="relative">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="appearance-none px-3 py-2 pr-7 rounded-lg text-sm"
                  style={{ border: `1px solid ${theme.border}`, outline: 'none', background: '#fff' }}
                >
                  {CATEGORY_PRESETS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9ca3af' }} />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="문서번호 (예: 제2026-123호)"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm"
                style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
              />
            </div>
            <input
              type="text"
              placeholder="메모 (선택)"
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addEntry() }}
              className="w-full px-3 py-2 rounded-lg text-sm mb-3"
              style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
            />
            <div className="flex items-center gap-2">
              <button
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ background: theme.accent, color: '#fff' }}
                onClick={addEntry}
              >
                추가
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{ background: '#e5e7eb', color: '#6b7280' }}
                onClick={() => setShowAddForm(false)}
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* Entry list */}
        <div className="flex flex-col gap-1.5">
          {filteredEntries.length === 0 && (
            <div className="text-center py-6">
              <span className="text-sm" style={{ color: '#9ca3af' }}>
                {searchQuery ? '검색 결과가 없습니다' : '등록된 문서번호가 없습니다'}
              </span>
            </div>
          )}
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col px-3 py-2.5 rounded-xl"
              style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
            >
              {editingId === entry.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-md text-sm"
                      style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
                      autoFocus
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="px-2 py-1 rounded-md text-sm"
                      style={{ border: `1px solid ${theme.border}`, outline: 'none', background: '#fff' }}
                    >
                      {CATEGORY_PRESETS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="flex-1 px-2 py-1 rounded-md text-sm"
                      style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
                    />
                    <input
                      type="text"
                      value={editMemo}
                      onChange={(e) => setEditMemo(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit() }}
                      placeholder="메모"
                      className="flex-1 px-2 py-1 rounded-md text-sm"
                      style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
                    />
                    <button
                      className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: '#16a34a', color: '#fff' }}
                      onClick={confirmEdit}
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: '#374151' }}>
                        {entry.title}
                      </span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: '#e0e7ff', color: '#4338ca' }}
                      >
                        {entry.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        className="flex items-center gap-1 text-sm font-mono transition-all hover:scale-105"
                        style={{ color: copiedId === entry.id ? '#16a34a' : '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        onClick={() => copyNumber(entry)}
                        title="클릭하여 복사"
                      >
                        <Copy size={11} />
                        {copiedId === entry.id ? '복사됨!' : entry.number}
                      </button>
                    </div>
                    {entry.memo && (
                      <div className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>{entry.memo}</div>
                    )}
                  </div>
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                    style={{ color: '#9ca3af' }}
                    onClick={() => startEdit(entry)}
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
                    style={{ color: '#ef4444' }}
                    onClick={() => deleteEntry(entry.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Entry count */}
        <div className="mt-3 text-center">
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            총 {entries.length}개 등록
          </span>
        </div>
      </div>
    </div>
  )
}
