import { useMemo } from 'react'
import { useAppState } from '../state/AppStateProvider.jsx'
import { WEEKDAY_SHORT, getDateForWeekday, isSameLocalDate, formatDateISOLocal } from '../utils/dateUtils.js'
import { useShifts } from '../state/ShiftsProvider.jsx'
import { diffMinutes, minutesToLabel } from '../utils/timeUtils.js'

export default function RotaGrid() {
  const { selectedWeekStart, currentDate } = useAppState()
  const { staff, shiftsMap } = useShifts()

  const isoDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => formatDateISOLocal(getDateForWeekday(selectedWeekStart, i))),
    [selectedWeekStart],
  )

  return (
    <table>
      <thead>
        <tr>
          <th>Staff</th>
          {WEEKDAY_SHORT.map((label, i) => {
            const dayDate = getDateForWeekday(selectedWeekStart, i)
            const isToday = isSameLocalDate(dayDate, currentDate)
            const dayNum = dayDate.getDate()
            return (
              <th key={i} aria-current={isToday ? 'date' : undefined}>
                {label} {dayNum}
              </th>
            )
          })}
          <th>Weekly Total</th>
        </tr>
      </thead>
      <tbody>
        {staff.length === 0 ? (
          <tr>
            <td colSpan={9}>No staff yet</td>
          </tr>
        ) : (
          staff.map((s) => {
            const perDay = isoDays.map((iso) => shiftsMap[`${s.staffId}|${iso}`] || null)
            const totalMin = perDay.reduce((acc, sh) => (sh ? acc + diffMinutes(sh.start, sh.end) : acc), 0)
            return (
              <tr key={s.staffId}>
                <td>{s.fullName || s.staffId}</td>
                {perDay.map((sh, idx) => (
                  <td key={idx}>{sh ? `${sh.start} – ${sh.end}` : '-'}</td>
                ))}
                <td>{totalMin ? minutesToLabel(totalMin) : '-'}</td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}
