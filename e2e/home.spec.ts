import { test, expect } from '@playwright/test'

test.describe('首頁', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('應該顯示主要元素', async ({ page }) => {
    // 檢查頁面標題
    await expect(page).toHaveTitle(/Personal Manager/)

    // 檢查導航列
    await expect(page.locator('nav')).toBeVisible()
    
    // 檢查 Hero 區塊
    await expect(page.locator('text=歡迎來到我的個人管理系統')).toBeVisible()
    await expect(page.locator('text=探索我的專業技能、工作經歷和精選作品')).toBeVisible()
    
    // 檢查主要按鈕
    await expect(page.locator('text=查看作品集')).toBeVisible()
    await expect(page.locator('text=了解更多')).toBeVisible()
  })

  test('功能介紹區塊', async ({ page }) => {
    // 檢查功能介紹標題
    await expect(page.locator('text=系統功能')).toBeVisible()
    
    // 檢查功能卡片
    await expect(page.locator('text=個人展示')).toBeVisible()
    await expect(page.locator('text=作品管理')).toBeVisible()
    await expect(page.locator('text=任務追蹤')).toBeVisible()
    await expect(page.locator('text=部落格')).toBeVisible()
  })

  test('精選作品區塊', async ({ page }) => {
    await expect(page.locator('text=精選作品')).toBeVisible()
    await expect(page.locator('text=查看所有作品')).toBeVisible()
  })

  test('導航功能', async ({ page }) => {
    // 測試導航到關於我頁面
    await page.click('text=關於我')
    await expect(page.url()).toContain('/about')
    
    // 回到首頁
    await page.goto('/')
    
    // 測試導航到作品集頁面
    await page.click('text=作品集')
    await expect(page.url()).toContain('/portfolio')
  })

  test('響應式設計', async ({ page }) => {
    // 桌面版
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('nav')).toBeVisible()
    
    // 平板版
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('nav')).toBeVisible()
    
    // 手機版
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('nav')).toBeVisible()
  })

  test('CTA 按鈕功能', async ({ page }) => {
    // 點擊查看作品集按鈕
    await page.click('text=查看作品集')
    await expect(page.url()).toContain('/portfolio')
    
    // 回到首頁
    await page.goto('/')
    
    // 點擊了解更多按鈕
    await page.click('text=了解更多')
    await expect(page.url()).toContain('/about')
  })

  test('頁腳顯示', async ({ page }) => {
    // 滾動到頁面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // 檢查頁腳
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('text=© 2024 Personal Manager')).toBeVisible()
  })
})