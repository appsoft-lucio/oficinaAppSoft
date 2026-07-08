const metrics = [
  { label: 'Ordens abertas', value: '24' },
  { label: 'Clientes ativos', value: '128' },
  { label: 'Receita mensal', value: 'R$ 42k' },
]

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <strong className="text-lg font-black tracking-tight text-orange-600">
            Oficina AppSoft
          </strong>
          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-600 md:flex">
            <a href="#recursos">Recursos</a>
            <a href="#dashboard">Dashboard</a>
            <a href="#contato">Contato</a>
          </nav>
          <button className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white">
            Entrar
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-orange-600">
            Gestão para oficinas
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
            Controle sua oficina com menos papel e mais previsibilidade.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Organize clientes, veículos, ordens de serviço, pagamentos e relatórios em um
            painel simples para o dia a dia da mecânica.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-lg bg-orange-600 px-6 py-3 font-black text-white shadow-lg shadow-orange-600/20">
              Ver demonstração
            </button>
            <button className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-black text-slate-800">
              Conhecer recursos
            </button>
          </div>
        </div>

        <div id="dashboard" className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-400">
                  Hoje
                </p>
                <h2 className="mt-1 text-2xl font-black">Dashboard</h2>
              </div>
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-black">
                Online
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-lg bg-white/10 p-4">
                  <strong className="block text-2xl font-black">{metric.value}</strong>
                  <span className="text-xs font-bold text-slate-300">{metric.label}</span>
                </article>
              ))}
            </div>

            <div className="mt-5 space-y-3 rounded-lg bg-white p-4 text-slate-900">
              <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
                <span className="font-bold">Troca de óleo - Civic</span>
                <span className="text-sm font-black text-orange-600">Em andamento</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
                <span className="font-bold">Revisão completa - Onix</span>
                <span className="text-sm font-black text-slate-600">Aguardando</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
