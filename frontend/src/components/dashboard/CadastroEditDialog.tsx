import { useEffect, useRef, useState } from 'react'
import { updateCliente, type Cliente } from '../../services/clientes'
import { updateMecanico, type Mecanico } from '../../services/mecanicos'
import { updateVeiculo, type Veiculo } from '../../services/veiculos'
import { databaseErrorMessage } from '../../services/databaseErrors'
import { transferErrorMessage } from '../../services/vehicleHistory'

type Props = { oficinaId: string; onCancel: () => void } & (
  { tipo: 'cliente'; registro: Cliente; onSaved: (value: Cliente) => void }
  | { tipo: 'mecanico'; registro: Mecanico; onSaved: (value: Mecanico) => void }
  | { tipo: 'veiculo'; registro: Veiculo; onSaved: (value: Veiculo) => void }
)

export default function CadastroEditDialog(props: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { ref.current?.showModal() }, [])
  const fields = props.tipo === 'veiculo' ? [
    { name: 'modelo', label: 'Modelo', type: 'text', value: props.registro.modelo, required: true },
    { name: 'marca', label: 'Marca', type: 'text', value: props.registro.marca },
    { name: 'placa', label: 'Placa', type: 'text', value: props.registro.placa },
    { name: 'ano', label: 'Ano', type: 'number', value: props.registro.ano, min: 1886, max: 9999 },
    { name: 'quilometragem', label: 'Quilometragem (km)', type: 'number', value: props.registro.quilometragem, min: 0, max: 2147483647, required: true },
  ] : [
    { name: 'nome', label: 'Nome', type: 'text', value: props.registro.nome, required: true },
    { name: 'telefone', label: 'Telefone', type: 'tel', value: props.registro.telefone },
    { name: 'email', label: 'E-mail', type: 'email', value: props.registro.email },
  ]
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) ?? '').trim()
    setBusy(true); setError('')
    try {
      const base = { id: props.registro.id, oficinaId: props.oficinaId }
      if (props.tipo === 'veiculo') {
        props.onSaved(await updateVeiculo({ ...base, modelo: text('modelo'), marca: text('marca'), placa: text('placa'), ano: text('ano'), quilometragem: Number(text('quilometragem')) }))
      } else {
        const params = { ...base, nome: text('nome'), telefone: text('telefone'), email: text('email') }
        if (props.tipo === 'cliente') props.onSaved(await updateCliente(params))
        else props.onSaved(await updateMecanico(params))
      }
    } catch (err) { setError(databaseErrorMessage(err, transferErrorMessage(err))) }
    finally { setBusy(false) }
  }
  return <dialog ref={ref} aria-labelledby="editar-cadastro-title"
    onCancel={(event) => { event.preventDefault(); if (!busy) props.onCancel() }}
    className="m-auto max-h-[90vh] w-[min(92vw,520px)] overflow-y-auto rounded-2xl bg-white p-6 text-slate-950 shadow-xl backdrop:bg-slate-950/60">
    <h2 id="editar-cadastro-title" className="text-xl font-black">Editar {props.tipo === 'mecanico' ? 'mecânico' : props.tipo === 'veiculo' ? 'veículo' : 'cliente'}</h2>
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        {fields.map((field) => <label key={field.name} className="block text-sm font-bold">
          {field.label}
          <input name={field.name} type={field.type} required={field.required} defaultValue={field.value ?? ''}
            min={'min' in field ? field.min : undefined} max={'max' in field ? field.max : undefined}
            step={field.type === 'number' ? 1 : undefined}
            className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3" />
        </label>)}
      </fieldset>
      {props.tipo === 'veiculo' ? <p className="text-sm text-slate-500">Para mudar o proprietário, use Transferir na listagem. O histórico será preservado.</p> : null}
      {error ? <p role="alert" className="text-sm font-bold text-red-700">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <button autoFocus disabled={busy} type="button" onClick={props.onCancel} className="min-h-11 rounded-lg border border-slate-300 px-4 font-bold">Cancelar</button>
        <button disabled={busy} type="submit" className="min-h-11 rounded-lg bg-orange-600 px-4 font-bold text-white">{busy ? 'Salvando...' : 'Salvar alterações'}</button>
      </div>
    </form>
  </dialog>
}
