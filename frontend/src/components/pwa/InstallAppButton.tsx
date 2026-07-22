import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallAppButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [isIos, setIsIos] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsInstalled(standalone)
    setIsIos(/iphone|ipad|ipod/i.test(window.navigator.userAgent))

    function handleInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }

    function handleInstalled() {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (isInstalled || (!installPrompt && !isIos)) return null

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      if (choice.outcome === 'accepted') setInstallPrompt(null)
      return
    }

    window.alert('No iPhone ou iPad, abra no Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”.')
  }

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-orange-500 px-4 text-sm font-black text-orange-400 transition hover:bg-orange-500/10"
      onClick={handleInstall}
      type="button"
    >
      Instalar App
    </button>
  )
}
