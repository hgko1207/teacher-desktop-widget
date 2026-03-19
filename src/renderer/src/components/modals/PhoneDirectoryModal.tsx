import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { X, Plus, Trash2, Search, Edit3, Check } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import type { PhoneEntry } from '../../types'

interface PhoneDirectoryModalProps {
  onClose: () => void
}

const DEFAULT_ENTRIES: PhoneEntry[] = [
  { id: 'default-1', name: '교무실', number: '' },
  { id: 'default-2', name: '행정실', number: '' },
  { id: 'default-3', name: '보건실', number: '' },
  { id: 'default-4', name: '교장실', number: '' },
  { id: 'default-5', name: '상담실', number: '' }
]

let idCounter = Date.now()
function generateId(): string {
  idCounter += 1
  return `phone-${idCounter}`
}

export function PhoneDirectoryModal({ onClose }: PhoneDirectoryModalProps): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]

  const [entries, setEntries] = useState<PhoneEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNumber, setEditNumber] = useState('')
  const [loaded, setLoaded] = useState(false)

  // Load from store
  useEffect(() => {
    window.api.loadStore('phoneDirectory').then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setEntries(data as PhoneEntry[])
      } else {
        setEntries(DEFAULT_ENTRIES)
      }
      setLoaded(true)
    })
  }, [])

  const saveEntries = useCallback((updated: PhoneEntry[]): void => {
    setEntries(updated)
    window.api.saveStore('phoneDirectory', updated)
  }, [])

  const addEntry = (): void => {
    if (!newName.trim()) return
    const entry: PhoneEntry = {
      id: generateId(),
      name: newName.trim(),
      number: newNumber.trim()
    }
    saveEntries([...entries, entry])
    setNewName('')
    setNewNumber('')
  }

  const deleteEntry = (id: string): void => {
    saveEntries(entries.filter((e) => e.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const startEdit = (entry: PhoneEntry): void => {
    setEditingId(entry.id)
    setEditName(entry.name)
    setEditNumber(entry.number)
  }

  const confirmEdit = (): void => {
    if (!editingId || !editName.trim()) return
    saveEntries(
      entries.map((e) =>
        e.id === editingId ? { ...e, name: editName.trim(), number: editNumber.trim() } : e
      )
    )
    setEditingId(null)
  }

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return e.name.toLowerCase().includes(q) || e.number.includes(q)
  })

  if (!loaded) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md p-6"
        style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: '#1f2937' }}>내선번호 목록</h2>
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
            placeholder="이름 또는 번호 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
        </div>

        {/* Add new entry */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addEntry() }}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          <input
            type="text"
            placeholder="번호"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addEntry() }}
            className="w-28 px-3 py-2 rounded-lg text-sm"
            style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
          />
          <button
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110"
            style={{ background: theme.accent, color: '#fff' }}
            onClick={addEntry}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Entry list */}
        <div className="flex flex-col gap-1.5">
          {filteredEntries.length === 0 && (
            <div className="text-center py-6">
              <span className="text-sm" style={{ color: '#9ca3af' }}>
                {searchQuery ? '검색 결과가 없습니다' : '등록된 번호가 없습니다'}
              </span>
            </div>
          )}
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}
            >
              {editingId === entry.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit() }}
                    className="flex-1 px-2 py-1 rounded-md text-sm"
                    style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit() }}
                    className="w-24 px-2 py-1 rounded-md text-sm"
                    style={{ border: `1px solid ${theme.border}`, outline: 'none' }}
                  />
                  <button
                    className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: '#16a34a', color: '#fff' }}
                    onClick={confirmEdit}
                  >
                    <Check size={14} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium" style={{ color: '#374151' }}>
                    {entry.name}
                  </span>
                  <span className="text-sm font-mono" style={{ color: '#6b7280' }}>
                    {entry.number || '-'}
                  </span>
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
                </>
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
