import { useState, type ReactNode } from 'react'
import { Timer, Shuffle, FileX, Phone, ExternalLink } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'
import { TimerModal } from '../modals/TimerModal'
import { RandomPickerModal } from '../modals/RandomPickerModal'
import { MissingSubmissionModal } from '../modals/MissingSubmissionModal'
import { PhoneDirectoryModal } from '../modals/PhoneDirectoryModal'

type ModalType = 'timer' | 'randomPicker' | 'missingSubmission' | 'phoneDirectory' | null

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
  { name: '내선번호', icon: Phone, bgColor: '#f0fdf4', iconColor: '#16a34a', modal: 'phoneDirectory' }
]

export function SmartToolsWidget(): ReactNode {
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const launchers = useSettingsStore((s) => s.settings.launchers)
  const theme = THEMES[themeKey]
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [timerInitialMinutes, setTimerInitialMinutes] = useState<number | undefined>(undefined)

  const openTimerWithPreset = (minutes: number): void => {
    setTimerInitialMinutes(minutes)
    setOpenModal('timer')
  }

  const closeModal = (): void => {
    setOpenModal(null)
    setTimerInitialMinutes(undefined)
  }

  return (
    <>
      <div
        className="h-full flex flex-col p-4"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
        }}
      >
        {/* 즐겨찾기 런처 */}
        <div className="mb-3">
          <span className="text-xs font-semibold" style={{ color: '#888' }}>즐겨찾기 런처</span>
          <div className="flex items-center gap-3 mt-2">
            {launchers.map((l) => (
              <button
                key={l.id}
                className="flex flex-col items-center group"
                onClick={() => { if (l.url) window.open(l.url, '_blank') }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
                  style={{ background: l.color, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  {l.letter}
                </div>
                <span className="text-xs mt-1" style={{ color: '#666' }}>{l.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 스마트 도구 */}
        <div className="flex-1">
          <span className="text-xs font-semibold" style={{ color: '#888' }}>스마트 도구</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.name}
                  className="flex items-center gap-2 p-2.5 rounded-xl transition-all hover:scale-105"
                  style={{ background: tool.bgColor }}
                  onClick={() => setOpenModal(tool.modal)}
                >
                  <Icon size={16} style={{ color: tool.iconColor }} />
                  <span className="text-xs font-medium" style={{ color: tool.iconColor }}>{tool.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 빠른 5분 타이머 */}
        <button
          className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
          style={{
            background: theme.bg,
            color: theme.primary,
            border: `1px solid ${theme.border}`
          }}
          onClick={() => openTimerWithPreset(5)}
        >
          <Timer size={14} />
          빠른 5분 타이머 시작
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Modals */}
      {openModal === 'timer' && (
        <TimerModal onClose={closeModal} initialMinutes={timerInitialMinutes} />
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
    </>
  )
}
