import { useState } from 'react'
import useIsMobile from '../hooks/useIsMobile.js'
import { useAppState } from '../state/AppStateProvider.jsx'
import RotaGrid from '../components/RotaGrid.jsx'
import RotaDayTabs from '../components/RotaDayTabs.jsx'
import RotaDayList from '../components/RotaDayList.jsx'

export default function Rota() {
  const isMobile = useIsMobile()
  const { currentWeekday, selectedWeekStart, currentDate } = useAppState()
  const [activeDay, setActiveDay] = useState(currentWeekday)

  if (!isMobile) return <RotaGrid />

  return (
    <div>
      <RotaDayTabs
        weekStart={selectedWeekStart}
        activeDay={activeDay}
        onChangeDay={setActiveDay}
        currentDate={currentDate}
      />
      <RotaDayList weekStart={selectedWeekStart} activeDay={activeDay} />
    </div>
  )
}
