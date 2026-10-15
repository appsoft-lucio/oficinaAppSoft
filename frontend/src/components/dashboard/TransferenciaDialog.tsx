import { useEffect, useRef } from 'react'
import type { OrdemServico } from '../../services/ordens'
import type { Veiculo } from '../../services/veiculos'

type Props = {
  veiculo: Veiculo
  anterior: string
  novo: string
  pendentes: OrdemServico[]
  busy: boolean
  error: string
  onCancel: () => void
  onConfirm: () => void
}

export default function TransferenciaDialog({ veiculo, anterior, novo, pendentes, busy, error, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return (
    <dialog ref={ref} aria-labelledby="transferencia-title"
      onCancel={(event) => { event.preventDefault(); if (!busy) onCancel() }}
      className="m-auto max-h-[90vh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl bg-white p-6 text-slate-950 shadow-xl backdrop:bg-slate-950/60">
      <h2 id="transferencia-title" className="text-xl font-black">Confirmar transferência de proprietário</h2>
      <p className="mt-3">O veículo <strong>{veiculo.modelo} — {veiculo.placa || 'Sem placa'}</strong> já está cadastrado.</p>
      <p className="mt-2">Proprietário atual: <strong>{anterior}</strong></p>
      <p>Novo proprietário: <strong>{novo}</strong></p>
      <p className="mt-3 text-sm text-slate-600">O cadastro existente será transferido. Todas as manutenções e proprietários serão preservados. As ordens antigas e seus pagamentos continuam vinculados ao cliente original. Os outros dados do veículo serão mantidos.</p>
      {pendentes.length > 0 ? (
        <div className="mt-4 rounded-xl bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Atenção: há {pendentes.length} ordem(ns) com serviço ou pagamento em aberto.</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {pendentes.map((ordem) => <li key={ordem.id}>{ordem.titulo} — serviço: {ordem.status.replaceAll('_', ' ')}; pagamento: {ordem.pagamento_status.replaceAll('_', ' ')}</li>)}
          </ul>
          <p className="mt-2 font-bold">Deseja realmente transferir mesmo com essas pendências?</p>
        </div>
      ) : <p className="mt-4 text-sm text-slate-600">Não há serviços ou pagamentos pendentes neste veículo. Deseja transferir?</p>}
      {error ? <p role="alert" className="mt-3 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button autoFocus disabled={busy} onClick={onCancel} type="button" className="min-h-11 rounded-lg border border-slate-300 px-4 font-bold disabled:opacity-50">Cancelar</button>
        <button disabled={busy || !!error} onClick={onConfirm} type="button" className="min-h-11 rounded-lg bg-orange-600 px-4 font-bold text-white disabled:opacity-50">{busy ? 'Transferindo...' : 'Confirmar transferência'}</button>
      </div>
    </dialog>
  )
}
