import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { Pencil } from 'lucide-react'

export function MemoWidget(): ReactNode {
  const [text, setText] = useState('')
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const init = async (): Promise<void> => {
      const stored = await window.api.loadStore('memo')
      if (typeof stored === 'string') {
        setText(stored)
      }
      setLoaded(true)
    }
    init()
  }, [])

  const save = useCallback((val: string): void => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      window.api.saveStore('memo', val)
    }, 500)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      const val = e.target.value
      setText(val)
      save(val)
    },
    [save]
  )

  if (!loaded) return null

  return (
    <div
      className="h-full flex flex-col p-3"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(226,232,240,0.6)',
        borderRadius: '24px',
        boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
      }}
    >
      <div className="flex items-center gap-1.5 mb-2 shrink-0">
        <Pencil size={14} style={{ color: '#ca8a04' }} />
        <span className="text-sm font-bold" style={{ color: '#a16207' }}>메모</span>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="자유롭게 메모하세요..."
        className="flex-1 w-full resize-none outline-none text-sm"
        style={{
          background: 'rgba(255,255,255,0.5)',
          borderRadius: '12px',
          border: '1px solid rgba(250,204,21,0.2)',
          padding: '10px',
          color: '#713f12',
          lineHeight: '1.6',
          fontFamily: 'inherit'
        }}
      />
    </div>
  )
}
