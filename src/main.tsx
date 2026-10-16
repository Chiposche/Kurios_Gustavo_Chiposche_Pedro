import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from './lib/query-client'
import { AuthProvider } from './hooks/useAuth'
import { mswEnabled } from './lib/msw'
import './styles/globals.css'

// Ponto de entrada do app
async function startApp() {
  if (mswEnabled) {
    try {
      const { worker } = await import('../mocks/browser')
      await worker.start({
        // Requests fora da API (documento, assets) seguem direto pra rede
        // sem avisar; requests de /api sem handler continuam avisando
        onUnhandledFrame: ({ frame, defaults }) => {
          const url = (frame.data as { request?: Request } | undefined)?.request?.url
          if (url?.includes('/api/')) defaults.warn()
        },
      })

      // Primeira instalação: o start() resolve na ativação, mas o
      // clients.claim() pode ainda não ter tomado a página — sem esperar,
      // as primeiras chamadas escapam do MSW e só o F5 resolvia
      if (!navigator.serviceWorker.controller) {
        await new Promise<void>((resolve) => {
          const timer = window.setTimeout(resolve, 2000)
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => {
              window.clearTimeout(timer)
              resolve()
            },
            { once: true },
          )
        })
      }
    } catch (error) {
      // Sem o service worker a API devolve o HTML do rewrite; o Axios sinaliza
      // o erro e as telas mostram o feedback de recarga (em vez de tela branca)
      console.error('[MSW] Falha ao iniciar o service worker:', error)
    }
  }

  // Router importado depois do worker.start() senão o Socket.IO
  // captura o WebSocket antes do MSW interceptar
  const { router } = await import('./lib/router')

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

startApp()
