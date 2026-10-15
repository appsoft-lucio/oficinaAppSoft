export function databaseErrorMessage(error: unknown, fallback: string) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  if (code === '42703' || code === 'PGRST204' || code === '42P01' || code === 'PGRST205') {
    return 'O banco de dados precisa ser atualizado. Aplique as migrations 20261015120000_add_veiculo_quilometragem.sql e 20261015130000_add_mecanicos.sql no Supabase e recarregue a página.'
  }
  if (code === '42501') {
    return 'Acesso negado pelo banco de dados. Verifique se a oficina está ativa e se sua conta tem permissão para este cadastro.'
  }
  return fallback
}
