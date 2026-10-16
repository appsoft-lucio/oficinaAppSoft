import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DeveloperRoute from './components/auth/DeveloperRoute'
import MecanicosPage from './pages/MecanicosPage/MecanicosPage'
import ClientesPage from './pages/ClientesPage/ClientesPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import DeveloperPage from './pages/DeveloperPage/DeveloperPage'
import DocumentoPage from './pages/DocumentoPage/DocumentoPage'
import FinanceiroPage from './pages/FinanceiroPage/FinanceiroPage'
import FiscalPage from './pages/FiscalPage/FiscalPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import HomePage from './pages/HomePage/HomePage'
import HistoricoPage from './pages/HistoricoPage/HistoricoPage'
import LoginPage from './pages/LoginPage/LoginPage'
import OrdensPage from './pages/OrdensPage/OrdensPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage'
import TrialExpiredPage from './pages/TrialExpiredPage/TrialExpiredPage'
import VeiculosPage from './pages/VeiculosPage/VeiculosPage'
import EquipePage from './pages/EquipePage/EquipePage'
import MecanicoHistoricoPage from './pages/MecanicoHistoricoPage/MecanicoHistoricoPage'
import EstoquePage from './pages/EstoquePage/EstoquePage'

function App() {
  return (
    <Routes>
      <Route path="/estoque" element={<ProtectedRoute><EstoquePage /></ProtectedRoute>} />
      <Route path="/historico/mecanicos/:id" element={<ProtectedRoute><MecanicoHistoricoPage /></ProtectedRoute>} />
      <Route path="/equipe" element={<ProtectedRoute><EquipePage /></ProtectedRoute>} />
      <Route path="/historico/:tipo/:id" element={<ProtectedRoute><HistoricoPage /></ProtectedRoute>} />
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/desenvolvedor"
        element={
          <DeveloperRoute>
            <DeveloperPage />
          </DeveloperRoute>
        }
      />
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
      <Route path="/mecanicos" element={<ProtectedRoute><MecanicosPage /></ProtectedRoute>} />
      <Route path="/criar-conta" element={<RegisterPage />} />
      <Route path="/acesso-indisponivel" element={<TrialExpiredPage />} />
      <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
      <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
