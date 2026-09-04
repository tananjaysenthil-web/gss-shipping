import { Routes, Route, useLocation } from 'react-router-dom'
import { Home } from './pages/Home'
import { Services } from './pages/Services'
import { Fleet } from './pages/Fleet'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Portal } from './pages/Portal'
import { Team } from './pages/Team'
import { ThankYou } from './pages/ThankYou'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { NotFound } from './pages/NotFound'
import { ProtectedRoute } from './auth/ProtectedRoute'

export function AppRoutes() {
  const { pathname } = useLocation()

  return (
    <div key={pathname} className="route-fade flex flex-1 flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/portal"
          element={
            <ProtectedRoute role="client">
              <Portal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute role="staff">
              <Team />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
