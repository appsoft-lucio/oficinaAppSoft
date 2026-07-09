import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage'
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'

const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/criar-conta': RegisterPage,
  '/esqueci-minha-senha': ForgotPasswordPage,
}

function App() {
  const Page = routes[window.location.pathname as keyof typeof routes] ?? HomePage

  return <Page />
}

export default App
