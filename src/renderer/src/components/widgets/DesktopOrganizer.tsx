import { type ReactNode } from 'react'
import { Folder, Users } from 'lucide-react'

interface ZoneProps {
  icon: ReactNode
  label: string
  iconColor: string
  className?: string
  style?: React.CSSProperties
}

function DropZone({ icon, label, iconColor, className = '', style = {} }: ZoneProps): ReactNode {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      style={{
        border: '2px dashed rgba(200,200,200,0.6)',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        borderRadius: '24px',
        ...style
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.5)' }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <span className="text-sm font-medium" style={{ color: 'rgba(100,100,100,0.8)' }}>
        {label}
      </span>
    </div>
  )
}

export function DesktopOrganizer(): ReactNode {
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
      <DropZone
        icon={<Folder size={22} />}
        label="진행중 업무"
        iconColor="#3b82f6"
        className="flex-1"
      />
      <DropZone
        icon={<Folder size={22} />}
        label="나중에 볼 파일"
        iconColor="#22c55e"
        className="flex-1"
      />
      <DropZone
        icon={<Users size={22} />}
        label="2026학년도 우리반"
        iconColor="#f59e0b"
        style={{ height: '160px', flexShrink: 0 }}
      />
    </div>
  )
}
