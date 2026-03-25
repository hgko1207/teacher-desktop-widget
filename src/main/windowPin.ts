import koffi from 'koffi'

// Windows only
const isWindows = process.platform === 'win32'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SetWindowPos: any = null

function loadUser32(): boolean {
  if (SetWindowPos) return true
  if (!isWindows) return false
  try {
    const user32 = koffi.load('user32.dll')
    SetWindowPos = user32.func(
      'bool __stdcall SetWindowPos(intptr hWnd, intptr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags)'
    )
    return true
  } catch {
    return false
  }
}

// Special HWND values
const HWND_BOTTOM = 1
const HWND_NOTOPMOST = -2

// SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE
const SWP_FLAGS = 0x0002 | 0x0001 | 0x0010

function hwndFromBuffer(buffer: Buffer): number {
  return process.arch === 'x64'
    ? Number(buffer.readBigInt64LE(0))
    : buffer.readInt32LE(0)
}

export function pinToDesktop(hwndBuffer: Buffer): void {
  if (!loadUser32()) return
  try {
    const hwnd = hwndFromBuffer(hwndBuffer)
    SetWindowPos(hwnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_FLAGS)
  } catch {
    // ignore
  }
}

export function unpinFromDesktop(hwndBuffer: Buffer): void {
  if (!loadUser32()) return
  try {
    const hwnd = hwndFromBuffer(hwndBuffer)
    SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_FLAGS)
  } catch {
    // ignore
  }
}
