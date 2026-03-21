import { useState, type ReactNode } from 'react'
import { Timer, Shuffle, FileX, Phone, Hash } from 'lucide-react'
import { TimerModal } from '../modals/TimerModal'
import { RandomPickerModal } from '../modals/RandomPickerModal'
import { MissingSubmissionModal } from '../modals/MissingSubmissionModal'
import { PhoneDirectoryModal } from '../modals/PhoneDirectoryModal'
import { DocumentNumberModal } from '../modals/DocumentNumberModal'

type ModalType = 'timer' | 'randomPicker' | 'missingSubmission' | 'phoneDirectory' | 'documentNumber' | null

interface ToolDef {
  name: string
  icon: typeof Timer
  bgColor: string
  iconColor: string
  modal: ModalType
}

const TOOLS: ToolDef[] = [
  { name: '타이머', icon: Timer, bgColor: '#fff7ed', iconColor: '#ea580c', modal: 'timer' },
  { name: '랜덤뽑기', icon: Shuffle, bgColor: '#faf5ff', iconColor: '#9333ea', modal: 'randomPicker' },
  { name: '미제출자', icon: FileX, bgColor: '#fef2f2', iconColor: '#dc2626', modal: 'missingSubmission' },
  { name: '내선번호', icon: Phone, bgColor: '#f0fdf4', iconColor: '#16a34a', modal: 'phoneDirectory' },
  { name: '문서번호', icon: Hash, bgColor: '#eff6ff', iconColor: '#2563eb', modal: 'documentNumber' }
]

const CARD_STYLE = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(226,232,240,0.6)',
  borderRadius: '24px',
  boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
} as const

export function SmartToolsWidget(): ReactNode {
  const [openModal, setOpenModal] = useState<ModalType>(null)

  const closeModal = (): void => {
    setOpenModal(null)
  }

  return (
    <>
      <div className="h-full flex flex-col p-4" style={CARD_STYLE}>
        <span className="text-xs font-semibold shrink-0" style={{ color: '#94a3b8' }}>스마트 도구</span>
        <div className="grid grid-cols-2 gap-2 mt-2 flex-1 content-start">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.name}
                className="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:scale-105"
                style={{ background: tool.bgColor, cursor: 'pointer', border: 'none' }}
                onClick={() => setOpenModal(tool.modal)}
              >
                <Icon size={16} style={{ color: tool.iconColor }} />
                <span className="text-xs font-medium" style={{ color: tool.iconColor }}>{tool.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modals */}
      {openModal === 'timer' && (
        <TimerModal onClose={closeModal} initialMinutes={undefined} />
      )}
      {openModal === 'randomPicker' && (
        <RandomPickerModal onClose={closeModal} />
      )}
      {openModal === 'missingSubmission' && (
        <MissingSubmissionModal onClose={closeModal} />
      )}
      {openModal === 'phoneDirectory' && (
        <PhoneDirectoryModal onClose={closeModal} />
      )}
      {openModal === 'documentNumber' && (
        <DocumentNumberModal onClose={closeModal} />
      )}
    </>
  )
}
