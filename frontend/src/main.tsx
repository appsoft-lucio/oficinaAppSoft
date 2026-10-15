import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  const hadController = Boolean(navigator.serviceWorker.controller)
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !refreshing) {
      refreshing = true
      window.location.reload()
    }
  })
  window.addEventListener('load', () => {
    if (import.meta.env.DEV) {
      // A previous production worker must not serve old pages during local development.
      navigator.serviceWorker.getRegistration('/').then((registration) => registration?.unregister()).catch(() => undefined)
      return
    }
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((registration) => {
      const checkForUpdate = () => { registration.update().catch(() => undefined) }
      window.addEventListener('online', checkForUpdate)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate()
      })
      checkForUpdate()
    }).catch(() => undefined)
  })
}
