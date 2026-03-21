import { useState, type ReactNode } from 'react'
import { CheckSquare } from 'lucide-react'
import { useTodoStore } from '../../stores/todoStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { THEMES } from '../../config/themes'

export function TodoWidget(): ReactNode {
  const todos = useTodoStore((s) => s.todos)
  const addTodo = useTodoStore((s) => s.addTodo)
  const toggleTodo = useTodoStore((s) => s.toggleTodo)
  const removeTodo = useTodoStore((s) => s.removeTodo)
  const themeKey = useSettingsStore((s) => s.settings.themeKey)
  const theme = THEMES[themeKey]
  const [input, setInput] = useState('')

  const handleAdd = (): void => {
    const t = input.trim()
    if (!t) return
    addTodo(t)
    setInput('')
  }

  const incomplete = todos.filter((t) => !t.completed)
  const completed = todos.filter((t) => t.completed)

  return (
    <div
      className="h-full p-5 flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(226,232,240,0.6)',
        borderRadius: '24px',
        boxShadow: '0 2px 10px -4px rgba(0,0,0,0.02)'
      }}
    >
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3
          className="text-base font-bold flex items-center gap-2"
          style={{ color: '#1a1a2e' }}
        >
          <CheckSquare size={18} style={{ color: theme.primary }} />
          나의 할 일
        </h3>
      </div>

      <div className="flex gap-2 mb-3 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="할 일을 입력 후 Enter..."
          className="flex-1 text-sm px-4 py-2.5 rounded-2xl outline-none transition"
          style={{ background: '#f9fafb', border: `1px solid ${theme.border}` }}
        />
      </div>

      <div className="flex-1 overflow-auto space-y-1.5">
        {incomplete.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center p-3 rounded-2xl group transition-all"
            style={{ background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className="w-5 h-5 rounded-md shrink-0 mr-3 transition relative"
              style={{ border: `2px solid ${theme.accent}` }}
            />
            {/* Important indicator - red dot for items with ! */}
            {todo.text.includes('!') && (
              <div
                className="w-2 h-2 rounded-full shrink-0 mr-2"
                style={{ background: '#ef4444' }}
              />
            )}
            <span className="text-sm flex-1 font-medium" style={{ color: '#333' }}>
              {todo.text}
            </span>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: '#ccc' }}
            >
              삭제
            </button>
          </div>
        ))}
        {completed.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center p-3 rounded-2xl group"
            style={{ background: '#fafafa' }}
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className="w-5 h-5 rounded-md shrink-0 mr-3 flex items-center justify-center"
              style={{ background: theme.accent }}
            >
              <CheckSquare size={12} color="#fff" />
            </button>
            <span className="text-sm flex-1 line-through" style={{ color: '#bbb' }}>
              {todo.text}
            </span>
            <button
              onClick={() => removeTodo(todo.id)}
              className="text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: '#ddd' }}
            >
              삭제
            </button>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm" style={{ color: '#ccc' }}>할 일을 추가해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
