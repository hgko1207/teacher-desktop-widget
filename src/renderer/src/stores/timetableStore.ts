import { create } from 'zustand'
import type { TimetableEntry } from '../types'

// 반별 파스텔 색상 매핑
const CLASS_COLORS: Record<string, string> = {
  '1-1': '#FFD4D4',
  '1-2': '#FFE4C8',
  '1-3': '#E8D4FF',
  '1-4': '#D4E8FF',
  '2-1': '#D4FFD4',
  '2-2': '#FFF4D4',
  '2-3': '#FFD4F0',
  '3-1': '#D4FFF4',
  '3-2': '#F4FFD4',
  '3-3': '#FFD4D4',
  '3-4': '#D4DFFF',
  '3-5': '#E8FFD4'
}

export function getClassColor(className: string): string {
  return CLASS_COLORS[className] ?? '#E8E8E8'
}

interface TimetableState {
  entries: TimetableEntry[]
  isEditing: boolean
  setEditing: (editing: boolean) => void
  setEntries: (entries: TimetableEntry[]) => void
  addEntry: (entry: TimetableEntry) => void
  removeEntry: (day: TimetableEntry['day'], period: number) => void
  loadTimetable: () => Promise<void>
  saveTimetable: () => Promise<void>
}

export const useTimetableStore = create<TimetableState>((set, get) => ({
  entries: [],
  isEditing: false,

  setEditing: (editing): void => set({ isEditing: editing }),

  setEntries: (entries): void => {
    set({ entries })
    get().saveTimetable()
  },

  addEntry: (entry): void => {
    set((state) => ({
      entries: [
        ...state.entries.filter((e) => !(e.day === entry.day && e.period === entry.period)),
        entry
      ]
    }))
    get().saveTimetable()
  },

  removeEntry: (day, period): void => {
    set((state) => ({
      entries: state.entries.filter((e) => !(e.day === day && e.period === period))
    }))
    get().saveTimetable()
  },

  loadTimetable: async (): Promise<void> => {
    const data = await window.api.loadStore('timetable')
    if (data && Array.isArray(data)) {
      set({ entries: data as TimetableEntry[] })
    }
  },

  saveTimetable: async (): Promise<void> => {
    await window.api.saveStore('timetable', get().entries)
  }
}))
