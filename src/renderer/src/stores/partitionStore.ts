import { create } from 'zustand'
import type { PartitionCategory, PartitionItem } from '../types'

const DEFAULT_CATEGORIES: PartitionCategory[] = [
  { id: 'cat-1', name: '운영계획', iconColor: '#6366f1', order: 0 },
  { id: 'cat-2', name: '진행중 업무', iconColor: '#3b82f6', order: 1 },
  { id: 'cat-3', name: '나중에 볼 파일', iconColor: '#22c55e', order: 2 },
  { id: 'cat-4', name: '기타', iconColor: '#f59e0b', order: 3 }
]

interface PartitionState {
  categories: PartitionCategory[]
  items: PartitionItem[]
  addItem: (item: PartitionItem) => void
  removeItem: (id: string) => void
  loadPartition: () => Promise<void>
  savePartition: () => Promise<void>
  setCategories: (cats: PartitionCategory[]) => void
}

export const usePartitionStore = create<PartitionState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  items: [],

  addItem: (item: PartitionItem): void => {
    set((state) => ({ items: [...state.items, item] }))
    get().savePartition()
  },

  removeItem: (id: string): void => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    }))
    get().savePartition()
  },

  loadPartition: async (): Promise<void> => {
    const cats = await window.api.loadStore('partitionCategories')
    if (cats && Array.isArray(cats)) {
      set({ categories: cats as PartitionCategory[] })
    }
    const items = await window.api.loadStore('partitionItems')
    if (items && Array.isArray(items)) {
      set({ items: items as PartitionItem[] })
    }
  },

  savePartition: async (): Promise<void> => {
    await window.api.saveStore('partitionCategories', get().categories)
    await window.api.saveStore('partitionItems', get().items)
  },

  setCategories: (cats: PartitionCategory[]): void => {
    set({ categories: cats })
    get().savePartition()
  }
}))
