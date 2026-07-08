import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { navLinks } from '../../data/home'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <img className="h-14 w-auto" src={logoAppSoft} alt="Oficina AppSoft" />
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
            Sistema em desenvolvimento para gestão de oficinas mecânicas.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4 text-sm font-bold text-slate-600">
          {navLinks.map((link) => (
            <a className="transition hover:text-orange-600" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
