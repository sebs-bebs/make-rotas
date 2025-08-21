import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/tokens.css'
import './styles/global.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './state/AuthProvider.jsx'
import Rota from './routes/Rota.jsx'
import Staff from './routes/Staff.jsx'
import ImportExport from './routes/ImportExport.jsx'
import { AppStateProvider } from './state/AppStateProvider.jsx'
import { ShiftsProvider } from './state/ShiftsProvider.jsx'
import { ToastProvider } from './state/ToastProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppStateProvider>
        <ShiftsProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />}>
                  <Route index element={<Navigate to="/rota" replace />} />
                  <Route path="rota" element={<Rota />} />
                  <Route path="staff" element={<Staff />} />
                  <Route path="import" element={<ImportExport />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </ShiftsProvider>
      </AppStateProvider>
    </AuthProvider>
  </StrictMode>,
)
