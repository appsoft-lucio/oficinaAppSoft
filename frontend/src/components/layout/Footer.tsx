import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { creatorLinks, navLinks } from '../../data/home'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-5 py-8 text-white sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <img className="h-14 w-auto" src={logoAppSoft} alt="Oficina AppSoft" />
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Sistema em desenvolvimento para gestão de oficinas mecânicas.
            </p>
          </div>

          <nav className="flex flex-wrap gap-4 text-sm font-bold text-slate-300">
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
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-800 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Oficina AppSoft. Todos os direitos reservados.</span>

          <div className="flex flex-col gap-2 sm:items-end">
            <span>Criado por</span>
            <div className="flex flex-wrap gap-2">
              {creatorLinks.map((link) => (
                <a
                  className="rounded-full border border-slate-700 px-3 py-1 font-bold text-slate-100 transition hover:border-orange-400 hover:text-orange-400"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
