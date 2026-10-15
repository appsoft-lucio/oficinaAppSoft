import type { AutoriaRegistro } from '../../services/equipe'

export default function RegistroAutoria({ registro }: { registro: AutoriaRegistro }) {
  const label = (autor: NonNullable<AutoriaRegistro['criado_por']>) => `${autor.nome} (${autor.perfil === 'dono' ? 'Dono' : 'Gerente'})`
  return (
    <div className="mt-3 text-xs leading-5 text-slate-500">
      <p>Criado por: {registro.criado_por ? label(registro.criado_por) : 'Autoria não registrada (cadastro antigo)'}</p>
      {registro.alterado_por && registro.alterado_em ? <p>Última atualização: {label(registro.alterado_por)} em {new Date(registro.alterado_em).toLocaleString('pt-BR')}</p> : null}
    </div>
  )
}
