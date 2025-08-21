import { WEEKDAY_SHORT, getDateForWeekday, isSameLocalDate } from '../utils/dateUtils.js'

export default function RotaDayTabs({ weekStart, activeDay, onChangeDay, currentDate }) {
  return (
    <nav aria-label="Week days">
      {WEEKDAY_SHORT.map((label, i) => {
        const dayDate = getDateForWeekday(weekStart, i)
        const isActive = i === activeDay
        const isToday = isSameLocalDate(dayDate, currentDate)
        const dayNum = dayDate.getDate()
        return (
          <button
            key={i}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChangeDay(i)}
            title={isToday ? 'Today' : undefined}
          >
            {label} {dayNum}
          </button>
        )
      })}
    </nav>
  )
}
