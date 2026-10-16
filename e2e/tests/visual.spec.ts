import { test, expect } from '@playwright/test'
import { resetScenario, login, addFirstNftToCart } from '../helpers/test'

// Testes de regressão visual: screenshots das telas principais
// Baselines versionadas em e2e/tests/visual.spec.ts-snapshots/
test.describe('Regressão visual', () => {
  test.beforeEach(async ({ page }) => {
    await resetScenario(page)
  })

  test('home', async ({ page }) => {
    await page.goto('/')
    // Espera o conteúdo principal carregar
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    // Espera imagens e animações carregarem
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('home.png', { fullPage: true, maxDiffPixelRatio: 0.05 })
  })

  test('detalhe do NFT', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await page.waitForURL(/\/nft\//)
    // Espera o detalhe carregar completamente
    await page.waitForSelector('img:visible', { timeout: 10000 })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true, maxDiffPixelRatio: 0.05 })
  })

  test('carrinho', async ({ page }) => {
    await login(page)
    await addFirstNftToCart(page)
    await page.goto('/cart')
    await expect(page.locator('text=Carrinho de NFTs')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('cart.png', { fullPage: true, maxDiffPixelRatio: 0.05 })
  })

  test('pagamento', async ({ page }) => {
    await login(page)
    await addFirstNftToCart(page)
    // Espera a cotação carregar antes do screenshot
    const quoteReady = page.waitForResponse(
      (r) => r.url().includes('/api/cart/quote') && r.request().method() === 'POST' && r.ok(),
    )
    await page.goto('/checkout')
    await quoteReady
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('checkout.png', { fullPage: true, maxDiffPixelRatio: 0.05 })
  })
})
