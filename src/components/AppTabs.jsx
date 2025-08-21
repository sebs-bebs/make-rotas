import { NavLink } from 'react-router-dom'

export default function AppTabs() {
  return (
    <nav aria-label="Primary">
      <NavLink to="/rota" end>Rota</NavLink>
      {' | '}
      <NavLink to="/staff">Staff</NavLink>
      {' | '}
      <NavLink to="/import">Import/Export</NavLink>
    </nav>
  )
}
