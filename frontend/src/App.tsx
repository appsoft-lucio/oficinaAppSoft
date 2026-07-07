import { useState } from 'react'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage/LoginPage'
import type { AppPage } from './types/navigation'

function App() {
  const [page, setPage] = useState<AppPage>('landing')

  if (page === 'landing') {
    return <LandingPage onNavigate={setPage} />
  }

  return <LoginPage onNavigate={setPage} />
}

export default App
