import { Link } from 'react-router-dom'
import BrandLogo from '../BrandLogo/BrandLogo'

export default function LandingHeader() {
  return (
    <header className="nav-bar">
      <div className="nav-container">
        <BrandLogo className="nav-logo" alt="AppSoft" />
        <nav className="nav-links" aria-label="Principal">
          <button className="nav-link">Recursos</button>
          <button className="nav-link">Preços</button>
          <button className="nav-link">Sobre</button>
        </nav>
        <div className="nav-actions">
          <Link className="btn-login" to="/login">
            Login
          </Link>
          <Link className="btn-signup" to="/login">
            Cadastre-se
          </Link>
        </div>
      </div>
    </header>
  )
}
