import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ChallengesPage from './pages/ChallengesPage'
import ChallengePage from './pages/ChallengePage'
import Layout from './components/layout/Layout'

function RequireAuth({ children }) {
  const token = useAuthStore(s => s.token)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <RequireAuth><Layout /></RequireAuth>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="challenges" element={<ChallengesPage />} />
        <Route path="challenge/:id" element={<ChallengePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
