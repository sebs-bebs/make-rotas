// Date utilities (local timezone aware)

/**
 * Start of week at local midnight.
 * Monday-based weeks by default when mondayStart=true.
 */
export function getWeekStart(date, mondayStart = true) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const jsDay = d.getDay() // 0=Sun..6=Sat
  const offset = mondayStart ? (jsDay + 6) % 7 : jsDay
  d.setDate(d.getDate() - offset)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Add n weeks to the given date
 */
export function addWeeks(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n * 7)
  return d
}

/**
 * Format a week label as YYYY-MM-DD based on the given weekStart Date
 */
export function formatWeekLabel(weekStart) {
  return formatDateISOLocal(weekStart)
}

/**
 * Given a weekStart (local midnight), return the Date for a weekday index (0..6) at local midnight
 */
export function getDateForWeekday(weekStart, weekdayIndex) {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + weekdayIndex)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Format Date to local ISO-like date without timezone: YYYY-MM-DD
 */
export function formatDateISOLocal(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Weekday labels aligned to Monday=0..Sunday=6
export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Compare two Dates by their local date parts
export function isSameLocalDate(a, b) {
  return formatDateISOLocal(a) === formatDateISOLocal(b)
}
