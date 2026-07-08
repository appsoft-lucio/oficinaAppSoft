import { navLinks } from '../../data/home'

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <strong className="text-lg font-black tracking-tight text-orange-600">
          Oficina AppSoft
        </strong>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white">
          Entrar
        </button>
      </div>
    </header>
  )
}
