import type { ThemeKey, ThemeStyle } from '../types'

export const THEMES: Record<ThemeKey, ThemeStyle> = {
  indigo: {
    name: '차분한 인디고',
    primary: '#4f46e5',
    bg: '#eef2ff',
    accent: '#6366f1',
    border: '#c7d2fe',
    hover: '#e0e7ff'
  },
  pink: {
    name: '봄날의 벚꽃',
    primary: '#db2777',
    bg: '#fdf2f8',
    accent: '#ec4899',
    border: '#fbcfe8',
    hover: '#fce7f3'
  },
  teal: {
    name: '청량한 민트',
    primary: '#0d9488',
    bg: '#f0fdfa',
    accent: '#14b8a6',
    border: '#99f6e4',
    hover: '#ccfbf1'
  }
}
