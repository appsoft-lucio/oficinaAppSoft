import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ClientesPage from './pages/ClientesPage/ClientesPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import DocumentoPage from './pages/DocumentoPage/DocumentoPage'
import FinanceiroPage from './pages/FinanceiroPage/FinanceiroPage'
import FiscalPage from './pages/FiscalPage/FiscalPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import OrdensPage from './pages/OrdensPage/OrdensPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import VeiculosPage from './pages/VeiculosPage/VeiculosPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordens"
        element={
          <ProtectedRoute>
            <OrdensPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documentos/:ordemId/:tipo"
        element={
          <ProtectedRoute>
            <DocumentoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <ClientesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/veiculos"
        element={
          <ProtectedRoute>
            <VeiculosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financeiro"
        element={
          <ProtectedRoute>
            <FinanceiroPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fiscal"
        element={
          <ProtectedRoute>
            <FiscalPage />
          </ProtectedRoute>
        }
      />
      <Route path="/criar-conta" element={<RegisterPage />} />
      <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
