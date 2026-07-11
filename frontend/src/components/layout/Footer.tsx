import { Link } from 'react-router-dom'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'
import { creatorLinks, navLinks } from '../../data/home'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-5 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <Link aria-label="Ir para o início" className="inline-block" to="/">
              <img className="h-16 w-auto" src={logoAppSoft} alt="Oficina AppSoft" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
              Plataforma online para gestão de oficinas mecânicas, com controle de clientes,
              veículos, ordens de serviço, peças, documentos e pagamentos.
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-600 px-5 text-sm font-black text-white transition hover:bg-orange-700"
              to="/dashboard"
            >
              Acessar o sistema
            </Link>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">
              Navegação
            </h2>
            <nav aria-label="Navegação do rodapé" className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-300">
              {navLinks.map((link) => (
                <a className="transition hover:text-orange-400" href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-white">
              Atendimento
            </h2>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm text-slate-300">
              <a
                className="transition hover:text-orange-400"
                href="https://wa.me/5531983044087"
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp: (31) 98304-4087
              </a>
              <a
                className="break-all transition hover:text-orange-400"
                href="mailto:luciocdesouza@gmail.com"
              >
                luciocdesouza@gmail.com
              </a>
              <span className="leading-6 text-slate-400">
                Atendimento comercial e suporte à implantação.
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {currentYear} Oficina AppSoft. Todos os direitos reservados.</span>

          <div className="flex flex-wrap items-center gap-2">
            <span>Desenvolvido por</span>
            <div className="flex flex-wrap gap-3">
              {creatorLinks.map((link) => (
                <a
                  className="font-bold text-slate-200 transition hover:text-orange-400"
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
