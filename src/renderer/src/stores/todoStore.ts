import { create } from 'zustand'
import type { TodoItem } from '../types'

interface TodoState {
  todos: TodoItem[]
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  removeTodo: (id: string) => void
  loadTodos: () => Promise<void>
  saveTodos: () => Promise<void>
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],

  addTodo: (text): void => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    }
    set((state) => ({ todos: [...state.todos, newTodo] }))
    get().saveTodos()
  },

  toggleTodo: (id): void => {
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }))
    get().saveTodos()
  },

  removeTodo: (id): void => {
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id)
    }))
    get().saveTodos()
  },

  loadTodos: async (): Promise<void> => {
    const data = await window.api.loadStore('todos')
    if (data && Array.isArray(data)) {
      set({ todos: data as TodoItem[] })
    }
  },

  saveTodos: async (): Promise<void> => {
    await window.api.saveStore('todos', get().todos)
  }
}))
