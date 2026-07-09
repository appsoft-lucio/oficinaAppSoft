import type { ReactNode } from 'react'
import logoAppSoft from '../../assets/logo-appsoft-orange-semFundo.png'

type AuthLayoutProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export default function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <a className="inline-block" href="/">
            <img className="h-20 w-auto sm:h-24" src={logoAppSoft} alt="Oficina AppSoft" />
          </a>
          <p className="mt-10 text-sm font-black uppercase tracking-[0.18em] text-orange-400">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-[17px] leading-8 text-slate-300">
            {description}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-white p-5 text-slate-950 shadow-2xl shadow-black/30 sm:p-8">
          {children}
        </section>
      </div>
    </main>
  )
}
