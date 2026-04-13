const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateClassCode(length = 6): string {
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  return Array.from(arr, (v) => CHARS[v % CHARS.length]).join('')
}
