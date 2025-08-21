import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { getWeekStart } from '../utils/dateUtils.js'

const AppStateContext = createContext(null)

export function AppStateProvider({ children }) {
  // Source of truth for "today" in local time
  const [currentDate, setCurrentDate] = useState(() => new Date())

  // Update currentDate periodically (minute-level) to keep weekday/date fresh
  useEffect(() => {
    const id = setInterval(() => setCurrentDate(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Monday-based weeks by default (invariant)
  const mondayWeekStart = true

  // Selected week start (local midnight)
  const [selectedWeekStart, setSelectedWeekStart] = useState(() =>
    getWeekStart(currentDate, mondayWeekStart)
  )

  // Sync selectedWeekStart if the calendar week of currentDate changes
  useEffect(() => {
    const nextWeekStart = getWeekStart(currentDate, mondayWeekStart)
    // Only update if week changes to avoid unnecessary re-renders
    if (nextWeekStart.getTime() !== selectedWeekStart.getTime()) {
      setSelectedWeekStart(nextWeekStart)
    }
  }, [currentDate])

  // Derive weekday index (Monday=0..Sunday=6)
  const currentWeekday = useMemo(() => {
    const jsDay = currentDate.getDay() // 0=Sun..6=Sat
    return mondayWeekStart ? (jsDay + 6) % 7 : jsDay
  }, [currentDate])

  // Timezone info (capture once per render cycle)
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const timezoneOffsetMinutes = new Date().getTimezoneOffset()

  const value = useMemo(
    () => ({
      currentDate,
      selectedWeekStart,
      setSelectedWeekStart,
      currentWeekday,
      timeZone,
      timezoneOffsetMinutes,
    }),
    [currentDate, selectedWeekStart, currentWeekday, timeZone, timezoneOffsetMinutes]
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
