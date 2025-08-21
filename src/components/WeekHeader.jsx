import { useAppState } from '../state/AppStateProvider.jsx'
import { addWeeks, formatWeekLabel, getWeekStart } from '../utils/dateUtils.js'

export default function WeekHeader() {
  const { currentDate, selectedWeekStart, setSelectedWeekStart } = useAppState()

  const goPrev = () => setSelectedWeekStart(addWeeks(selectedWeekStart, -1))
  const goNext = () => setSelectedWeekStart(addWeeks(selectedWeekStart, 1))
  const goToday = () => setSelectedWeekStart(getWeekStart(currentDate, true))

  return (
    <header>
      <div>
        <button type="button" onClick={goPrev} aria-label="Previous week">⟨ Prev</button>
        <button type="button" onClick={goToday} aria-label="Go to current week">Today</button>
        <button type="button" onClick={goNext} aria-label="Next week">Next ⟩</button>
      </div>
      <h2>Week of {formatWeekLabel(selectedWeekStart)}</h2>
    </header>
  )
}
