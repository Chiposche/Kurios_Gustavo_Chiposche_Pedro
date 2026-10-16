import { test, expect } from '@playwright/test'

// Primeira visita e reload precisam funcionar sem F5 extra e sem erros do MSW
test.describe('Ciclo de vida do MSW', () => {
  test('carrega dados na primeira visita e no reload com console limpo', async ({ page }) => {
    const msErrors: string[] = []
    let mswEnabled = false

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Mocking enabled')) mswEnabled = true
      if (
        text.includes('no matching request handler') ||
        text.includes('A API respondeu HTML') ||
        text.includes('Failed to fetch') ||
        text.includes('resulted in a network error response')
      ) {
        msErrors.push(text.split('\n')[0])
      }
    })
    page.on('pageerror', (err) => msErrors.push(String(err)))

    // Primeira visita (contexto novo, sem service worker instalado)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Destaques do catálogo' })).toBeVisible()
    await expect(page.locator('a[href^="/nft/"]').first()).toBeVisible()
    await page.waitForTimeout(1500)
    expect(mswEnabled).toBe(true)

    // Primeiro reload — era aqui que aparecia o aviso do GET /
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Destaques do catálogo' })).toBeVisible()
    await expect(page.locator('a[href^="/nft/"]').first()).toBeVisible()
    await page.waitForTimeout(1000)

    expect(msErrors).toEqual([])
  })
})
