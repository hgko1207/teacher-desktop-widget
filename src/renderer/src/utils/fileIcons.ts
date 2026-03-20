export function getFileIcon(extension: string, type: 'file' | 'folder'): string {
  if (type === 'folder') return '\u{1F4C1}'
  const ext = extension.toLowerCase()
  if (['hwp', 'hwpx', 'doc', 'docx'].includes(ext)) return '\u{1F4C4}'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '\u{1F4CA}'
  if (['ppt', 'pptx'].includes(ext)) return '\u{1F4D0}'
  if (['pdf'].includes(ext)) return '\u{1F4D5}'
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) return '\u{1F5BC}\uFE0F'
  if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return '\u{1F3AC}'
  if (['mp3', 'wav', 'ogg'].includes(ext)) return '\u{1F3B5}'
  if (['zip', 'rar', '7z'].includes(ext)) return '\u{1F4E6}'
  if (['txt'].includes(ext)) return '\u{1F4DD}'
  return '\u{1F4CE}'
}

export function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}
