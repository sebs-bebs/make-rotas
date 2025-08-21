// Time utilities for HH:mm strings in local time

export function parseHHmm(s) {
  if (!s || typeof s !== 'string') return { h: 0, m: 0 }
  const [h, m] = s.split(':').map((n) => parseInt(n, 10))
  return { h: Number.isFinite(h) ? h : 0, m: Number.isFinite(m) ? m : 0 }
}

export function diffMinutes(start, end) {
  const { h: sh, m: sm } = parseHHmm(start)
  const { h: eh, m: em } = parseHHmm(end)
  return eh * 60 + em - (sh * 60 + sm)
}

export function minutesToLabel(mins) {
  const negative = mins < 0
  const abs = Math.abs(mins)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m || parts.length === 0) parts.push(`${m}m`)
  return (negative ? '-' : '') + parts.join(' ')
}
