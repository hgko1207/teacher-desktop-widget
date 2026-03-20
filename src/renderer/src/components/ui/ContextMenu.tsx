import { type ReactNode, useEffect, useRef } from 'react'

interface ContextMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps): ReactNode {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEsc(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 9999,
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        border: '1px solid rgba(0,0,0,0.08)',
        padding: '4px',
        minWidth: '140px'
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className="w-full text-left"
          style={{
            display: 'block',
            padding: '8px 14px',
            fontSize: '13px',
            color: item.danger ? '#ef4444' : '#374151',
            background: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = item.danger
              ? 'rgba(239,68,68,0.08)'
              : 'rgba(0,0,0,0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
