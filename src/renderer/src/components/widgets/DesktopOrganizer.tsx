import { type ReactNode, useState, useEffect, useCallback } from 'react'
import { Folder, Plus } from 'lucide-react'
import { usePartitionStore } from '../../stores/partitionStore'
import { getFileIcon, getExtension } from '../../utils/fileIcons'
import { ContextMenu } from '../ui/ContextMenu'
import type { PartitionCategory, PartitionItem } from '../../types'

interface ContextMenuState {
  x: number
  y: number
  item: PartitionItem
}

interface CategoryZoneProps {
  category: PartitionCategory
  items: PartitionItem[]
  onAddFiles: (categoryId: string) => void
  onContextMenu: (e: React.MouseEvent, item: PartitionItem) => void
}

function CategoryZone({ category, items, onAddFiles, onContextMenu }: CategoryZoneProps): ReactNode {
  const [isDragOver, setIsDragOver] = useState(false)
  const { addItem } = usePartitionStore()

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent): Promise<void> => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const filePath = (file as File & { path: string }).path
        if (!filePath) continue

        const pathInfo = await window.api.getPathInfo(filePath)
        const ext = getExtension(file.name)
        const newItem: PartitionItem = {
          id: `${Date.now()}-${i}`,
          categoryId: category.id,
          name: file.name,
          path: filePath,
          type: pathInfo.isDirectory ? 'folder' : 'file',
          extension: ext,
          addedAt: new Date().toISOString()
        }
        addItem(newItem)
      }
    },
    [category.id, addItem]
  )

  const handleDoubleClick = useCallback(async (item: PartitionItem): Promise<void> => {
    await window.api.openPath(item.path)
  }, [])

  return (
    <div
      className="flex flex-col"
      style={{
        flex: '1 1 0',
        minHeight: '80px',
        border: isDragOver ? '2px dashed #3b82f6' : '2px dashed rgba(200,200,200,0.5)',
        background: isDragOver ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        transition: 'border 0.2s, background 0.2s',
        overflow: 'hidden'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(200,200,200,0.3)', flexShrink: 0 }}
      >
        <Folder size={16} style={{ color: category.iconColor }} />
        <span
          className="flex-1 text-xs font-semibold truncate"
          style={{ color: '#4b5563' }}
        >
          {category.name}
        </span>
        <button
          onClick={() => onAddFiles(category.id)}
          className="flex items-center justify-center"
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '6px',
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            cursor: 'pointer',
            color: '#6b7280',
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
          title="파일/폴더 추가"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Items grid */}
      <div
        className="flex flex-wrap gap-1 p-2"
        style={{ flex: '1 1 0', overflowY: 'auto', minHeight: 0 }}
      >
        {items.length === 0 ? (
          <div
            className="flex items-center justify-center w-full"
            style={{ color: 'rgba(156,163,175,0.7)', fontSize: '11px', minHeight: '36px' }}
          >
            파일을 여기에 드래그하세요
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center"
              style={{
                width: '60px',
                padding: '4px 2px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              onDoubleClick={() => handleDoubleClick(item)}
              onContextMenu={(e) => {
                e.preventDefault()
                onContextMenu(e, item)
              }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1 }}>
                {getFileIcon(item.extension, item.type)}
              </span>
              <span
                className="w-full text-center truncate"
                style={{ fontSize: '10px', color: '#4b5563', marginTop: '2px' }}
                title={item.name}
              >
                {item.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function DesktopOrganizer(): ReactNode {
  const { categories, items, removeItem, loadPartition, addItem } = usePartitionStore()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  useEffect(() => {
    loadPartition()
  }, [loadPartition])

  const handleAddFiles = useCallback(
    async (categoryId: string): Promise<void> => {
      const filePaths = await window.api.selectFiles()
      for (let i = 0; i < filePaths.length; i++) {
        const fp = filePaths[i]
        const pathInfo = await window.api.getPathInfo(fp)
        const name = fp.split(/[\\/]/).pop() ?? fp
        const ext = getExtension(name)
        const newItem: PartitionItem = {
          id: `${Date.now()}-${i}`,
          categoryId,
          name,
          path: fp,
          type: pathInfo.isDirectory ? 'folder' : 'file',
          extension: ext,
          addedAt: new Date().toISOString()
        }
        addItem(newItem)
      }
    },
    [addItem]
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, item: PartitionItem): void => {
      setContextMenu({ x: e.clientX, y: e.clientY, item })
    },
    []
  )

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div
      className="w-72 h-full flex flex-col gap-3 p-3"
      style={{
        background: 'rgba(255,255,255,0.3)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.5)'
      }}
    >
      {sortedCategories.map((cat) => (
        <CategoryZone
          key={cat.id}
          category={cat}
          items={items.filter((item) => item.categoryId === cat.id)}
          onAddFiles={handleAddFiles}
          onContextMenu={handleContextMenu}
        />
      ))}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          items={[
            {
              label: '열기',
              onClick: () => {
                window.api.openPath(contextMenu.item.path)
              }
            },
            {
              label: '폴더에서 보기',
              onClick: () => {
                window.api.showInFolder(contextMenu.item.path)
              }
            },
            {
              label: '제거',
              danger: true,
              onClick: () => {
                removeItem(contextMenu.item.id)
              }
            }
          ]}
        />
      )}
    </div>
  )
}
