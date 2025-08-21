import './App.css'
import { Outlet } from 'react-router-dom'
import AppTabs from './components/AppTabs.jsx'
import WeekHeader from './components/WeekHeader.jsx'
import { useAuth } from './state/AuthProvider.jsx'

function App() {
  const { uid, firebase } = useAuth()
  const online = !!(firebase && uid)
  return (
    <div>
      <div className="hide-when-exporting">
        <AppTabs />
        <WeekHeader />
        {!online && (
          <div aria-live="polite">
            <span className="chip" title="Firebase not configured or not signed in">Offline mode (local only)</span>
          </div>
        )}
      </div>
      <Outlet />
    </div>
  )
}

export default App
