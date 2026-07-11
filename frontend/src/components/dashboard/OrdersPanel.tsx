import { Link } from 'react-router-dom'
import type { Cliente } from '../../services/clientes'
import type { OrdemServico } from '../../services/ordens'
import type { Veiculo } from '../../services/veiculos'

type OrdersPanelProps = {
  clientes: Cliente[]
  ordens: OrdemServico[]
  veiculos: Veiculo[]
}

export default function OrdersPanel({ clientes, ordens, veiculos }: OrdersPanelProps) {
  const clientesById = clientes.reduce<Record<string, Cliente>>((acc, cliente) => {
    acc[cliente.id] = cliente
    return acc
  }, {})

  const veiculosById = veiculos.reduce<Record<string, Veiculo>>((acc, veiculo) => {
    acc[veiculo.id] = veiculo
    return acc
  }, {})

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">Ordens recentes</h2>
          <p className="mt-1 text-sm text-slate-500">Serviços cadastrados no Supabase.</p>
        </div>
        <Link
          className="hidden rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white sm:block"
          to="/ordens"
        >
          Ver todas
        </Link>
      </div>

      <div className="mt-5 grid gap-3">
        {ordens.length > 0 ? (
          ordens.slice(0, 5).map((ordem) => (
            <article
              className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
              key={ordem.id}
            >
              <div>
                <strong className="block font-black text-slate-950">
                  {clientesById[ordem.cliente_id ?? '']?.nome ?? 'Cliente não informado'}
                </strong>
                <span className="text-sm text-slate-500">
                  {veiculosById[ordem.veiculo_id ?? '']?.modelo ?? 'Veículo não informado'}
                </span>
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-700">{ordem.titulo}</span>
                <span className="text-sm font-black text-orange-600">{ordem.status}</span>
              </div>
              <strong className="text-left text-lg font-black text-slate-950 md:text-right">
                {Number(ordem.valor).toLocaleString('pt-BR', {
                  currency: 'BRL',
                  style: 'currency',
                })}
              </strong>
            </article>
          ))
        ) : (
          <p className="rounded-lg bg-slate-50 p-4 text-sm font-bold text-slate-500">
            Nenhuma ordem cadastrada ainda.
          </p>
        )}
      </div>
    </section>
  )
}
