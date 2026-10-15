export function databaseErrorMessage(error: unknown, fallback: string) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined
  if (code === '42703' || code === 'PGRST202' || code === 'PGRST204' || code === '42P01' || code === 'PGRST205') {
    return 'Este recurso precisa de uma atualização do sistema. Entre em contato com o suporte da Oficina AppSoft.'
  }
  if (code === '42501') {
    return 'Sua conta não tem acesso a este recurso. Verifique a situação da oficina com o responsável pelo sistema.'
  }
  return fallback
}
