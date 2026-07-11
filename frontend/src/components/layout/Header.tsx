import { Link } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { navLinks } from '../../data/home'

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4 sm:px-6">
        <Link aria-label="Ir para o início" to="/">
          <img
            className="h-16 w-auto sm:h-24"
            src={logoAppSoft}
            alt="Oficina AppSoft"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-[15px] font-bold text-slate-300 md:flex">
          {navLinks.map((link) => (
            <a
              className="transition hover:text-orange-400"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-700"
          to="/login"
        >
          Entrar
        </Link>
      </div>
    </header>
  )
}
