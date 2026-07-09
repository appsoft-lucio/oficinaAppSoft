import { Navigate, Route, Routes } from 'react-router-dom'
import ClientesPage from './pages/ClientesPage/ClientesPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import VeiculosPage from './pages/VeiculosPage/VeiculosPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/clientes" element={<ClientesPage />} />
      <Route path="/veiculos" element={<VeiculosPage />} />
      <Route path="/criar-conta" element={<RegisterPage />} />
      <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
