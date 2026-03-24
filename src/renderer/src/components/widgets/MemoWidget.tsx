import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { Pencil, Plus, ArrowLeft, Trash2 } from 'lucide-react'
import type { MemoItem } from '../../types'

const CARD = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '16px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

export function MemoWidget(): ReactNode {
  const [memos, setMemos] = useState<MemoItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const init = async (): Promise<void> => {
      const stored = await window.api.loadStore('memos')
      if (Array.isArray(stored)) {
        setMemos(stored as MemoItem[])
      }
      setLoaded(true)
    }
    init()
  }, [])

  const saveMemos = useCallback((items: MemoItem[]): void => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      window.api.saveStore('memos', items)
    }, 500)
  }, [])

  const handleCreate = useCallback((): void => {
    const now = new Date().toISOString()
    const newMemo: MemoItem = {
      id: `memo-${Date.now()}`,
      title: '',
      content: '',
      updatedAt: now,
      createdAt: now
    }
    const updated = [newMemo, ...memos]
    setMemos(updated)
    saveMemos(updated)
    setEditingId(newMemo.id)
    setEditTitle('')
    setEditContent('')
  }, [memos, saveMemos])

  const handleEdit = useCallback((memo: MemoItem): void => {
    setEditingId(memo.id)
    setEditTitle(memo.title)
    setEditContent(memo.content)
    setConfirmDeleteId(null)
  }, [])

  const handleBack = useCallback((): void => {
    setEditingId(null)
    setConfirmDeleteId(null)
  }, [])

  const handleTitleChange = useCallback((val: string): void => {
    setEditTitle(val)
    setMemos((prev) => {
      const updated = prev.map((m) =>
        m.id === editingId ? { ...m, title: val, updatedAt: new Date().toISOString() } : m
      )
      saveMemos(updated)
      return updated
    })
  }, [editingId, saveMemos])

  const handleContentChange = useCallback((val: string): void => {
    setEditContent(val)
    setMemos((prev) => {
      const updated = prev.map((m) =>
        m.id === editingId ? { ...m, content: val, updatedAt: new Date().toISOString() } : m
      )
      saveMemos(updated)
      return updated
    })
  }, [editingId, saveMemos])

  const handleDelete = useCallback((): void => {
    if (!editingId) return
    const updated = memos.filter((m) => m.id !== editingId)
    setMemos(updated)
    saveMemos(updated)
    setEditingId(null)
    setConfirmDeleteId(null)
  }, [editingId, memos, saveMemos])

  if (!loaded) return null

  const editingMemo = editingId ? memos.find((m) => m.id === editingId) : null

  // Edit mode
  if (editingMemo) {
    return (
      <div className="h-full flex flex-col" style={{ ...CARD, padding: '14px' }}>
        {/* Header */}
        <div className="flex items-center justify-between shrink-0" style={{ marginBottom: '8px' }}>
          <button
            onClick={handleBack}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <ArrowLeft size={16} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>목록</span>
          </button>
          {confirmDeleteId === editingId ? (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={handleDelete}
                style={{
                  fontSize: '11px', fontWeight: 600, color: '#fff', background: '#ef4444',
                  border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer'
                }}
              >
                삭제
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{
                  fontSize: '11px', fontWeight: 600, color: '#666', background: '#f1f5f9',
                  border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDeleteId(editingId)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <Trash2 size={14} style={{ color: '#ef4444' }} />
            </button>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          value={editTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목"
          style={{
            width: '100%',
            fontSize: '14px',
            fontWeight: 700,
            color: '#1e293b',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(226,232,240,0.6)',
            outline: 'none',
            padding: '4px 0 8px 0',
            marginBottom: '8px',
            fontFamily: 'inherit'
          }}
        />

        {/* Content */}
        <textarea
          value={editContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="내용을 입력하세요..."
          className="flex-1 w-full resize-none outline-none"
          style={{
            background: 'rgba(255,255,255,0.5)',
            borderRadius: '10px',
            border: '1px solid rgba(250,204,21,0.2)',
            padding: '10px',
            color: '#713f12',
            lineHeight: '1.6',
            fontFamily: 'inherit',
            fontSize: '13px'
          }}
        />
      </div>
    )
  }

  // List mode
  return (
    <div className="h-full flex flex-col" style={{ ...CARD, padding: '14px' }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ marginBottom: '8px' }}>
        <div className="flex items-center gap-2">
          <Pencil size={16} style={{ color: '#ca8a04' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>메모</span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{memos.length}개</span>
        </div>
        <button
          onClick={handleCreate}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '26px', height: '26px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            border: 'none', cursor: 'pointer'
          }}
        >
          <Plus size={14} style={{ color: '#fff' }} />
        </button>
      </div>

      {/* Memo list */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {memos.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>메모를 추가해보세요</span>
          </div>
        ) : (
          memos.map((memo) => {
            const preview = memo.content.split('\n')[0] || ''
            const date = new Date(memo.updatedAt)
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
            return (
              <button
                key={memo.id}
                onClick={() => handleEdit(memo)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1px solid rgba(250,204,21,0.15)',
                  background: 'rgba(255,251,235,0.6)',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 600, color: '#1e293b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1, minWidth: 0
                  }}>
                    {memo.title || '제목 없음'}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', flexShrink: 0, marginLeft: '8px' }}>{dateStr}</span>
                </div>
                {preview && (
                  <div style={{
                    fontSize: '11px', color: '#64748b', marginTop: '2px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {preview}
                  </div>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
