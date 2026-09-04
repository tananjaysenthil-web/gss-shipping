import { BrowserRouter } from 'react-router-dom'
import { SceneProvider } from './three/SceneContext'
import { CanvasStage } from './three/CanvasStage'
import { AuthProvider } from './auth/AuthContext'
import { CookieBanner } from './components/CookieBanner'
import { AppShell } from './AppShell'

export default function App() {
  return (
    <SceneProvider>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <CanvasStage />
      <BrowserRouter>
        <AuthProvider>
          <AppShell />
          <CookieBanner />
        </AuthProvider>
      </BrowserRouter>
    </SceneProvider>
  )
}
