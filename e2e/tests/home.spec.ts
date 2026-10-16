import { test, expect } from '@playwright/test'

// Testes da página inicial
test.describe('Página Inicial', () => {
  test('deve carregar a home com o título KURIO', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'KURIO' }).first()).toBeVisible()
  })

  test('deve exibir o hero e seções educativas', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=SEJA DONO DA CULTURA DIGITAL')).toBeVisible()
    await expect(page.locator('text=O que são NFTs?')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Como funciona', exact: true })).toBeVisible()
  })

  test('deve navegar para o marketplace ao clicar em EXPLORAR', async ({ page }) => {
    await page.goto('/')
    await page.locator('a:has-text("EXPLORAR")').first().click()
    await expect(page).toHaveURL(/\/marketplace/)
  })

  test('deve ter o footer com crédito do desenvolvedor', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Gustavo Chiposche Pedro')).toBeVisible()
  })

  test('seção de catálogo mostra destaques e links para o detalhe', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Destaques do catálogo' })).toBeVisible()
    await page.waitForSelector('section a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('section a[href*="/nft/"]').first().click()
    await expect(page).toHaveURL(/\/nft\//)
  })

  test('busca da home navega para o marketplace com o termo na URL', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Buscar NFTs').fill('ape')
    await page.getByLabel('Buscar NFTs').press('Enter')
    await expect(page).toHaveURL(/\/marketplace\?search=ape/)
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
  })

  test('chip de categoria da home aplica o filtro no marketplace', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Fotografia' }).click()
    await expect(page).toHaveURL(/\/marketplace\?category=Fotografia/)
  })
})

// Testes do marketplace
test.describe('Marketplace', () => {
  test('deve exibir a lista de NFTs', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    const cards = page.locator('a[href*="/nft/"]')
    await expect(cards.first()).toBeVisible()
  })

  test('deve navegar para detalhes do NFT ao clicar no card', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForSelector('a[href*="/nft/"]', { timeout: 10000 })
    await page.locator('a[href*="/nft/"]').first().click()
    await expect(page).toHaveURL(/\/nft\//)
  })
})
