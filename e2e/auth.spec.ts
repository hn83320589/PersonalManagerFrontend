import { test, expect } from '@playwright/test'

test.describe('使用者認證', () => {
  test('登入流程', async ({ page }) => {
    // 訪問需要認證的頁面，應該重導向到登入頁面
    await page.goto('/admin/dashboard')
    await expect(page.url()).toContain('/login')
    
    // 檢查登入表單
    await expect(page.locator('text=登入')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // 嘗試空表單提交
    await page.click('button[type="submit"]')
    // 應該顯示驗證錯誤（如果有實作的話）
    
    // 填寫錯誤的認證資料
    await page.fill('input[type="text"]', 'wronguser')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')
    
    // 填寫正確的 Demo 認證資料
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // 應該重導向到儀表板
    await expect(page.url()).toContain('/admin/dashboard')
    await expect(page.locator('text=管理儀表板')).toBeVisible()
  })

  test('Demo 登入按鈕', async ({ page }) => {
    await page.goto('/login')
    
    // 點擊 Demo 登入按鈕
    await page.click('text=Demo 登入')
    
    // 應該自動重導向到儀表板
    await expect(page.url()).toContain('/admin/dashboard')
    await expect(page.locator('text=管理儀表板')).toBeVisible()
  })

  test('登出功能', async ({ page }) => {
    // 先登入
    await page.goto('/login')
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // 確認已登入
    await expect(page.url()).toContain('/admin/dashboard')
    
    // 登出
    await page.click('text=登出')
    
    // 應該重導向到首頁或登入頁面
    await expect(page.url()).not.toContain('/admin')
  })

  test('受保護路由', async ({ page }) => {
    // 未登入狀態下訪問管理頁面
    const protectedRoutes = [
      '/admin/dashboard',
      '/admin/profile',
      '/admin/experience',
      '/admin/skills',
      '/admin/portfolio',
      '/admin/calendar',
      '/admin/tasks',
      '/admin/blog'
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page.url()).toContain('/login')
    }
  })

  test('記住我功能', async ({ page }) => {
    await page.goto('/login')
    
    // 勾選記住我
    await page.check('input[type="checkbox"]')
    
    // 登入
    await page.fill('input[type="text"]', 'admin')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    
    // 檢查 localStorage 是否保存了認證資訊
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeTruthy()
  })

  test('忘記密碼連結', async ({ page }) => {
    await page.goto('/login')
    
    // 檢查忘記密碼連結存在
    await expect(page.locator('text=忘記密碼')).toBeVisible()
    
    // 點擊忘記密碼連結（如果有實作對應頁面）
    // await page.click('text=忘記密碼')
    // await expect(page.url()).toContain('/forgot-password')
  })

  test('社群登入按鈕', async ({ page }) => {
    await page.goto('/login')
    
    // 檢查社群登入按鈕
    await expect(page.locator('text=使用 Google 登入')).toBeVisible()
    await expect(page.locator('text=使用 GitHub 登入')).toBeVisible()
  })

  test('登入頁面響應式設計', async ({ page }) => {
    await page.goto('/login')
    
    // 桌面版
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('form')).toBeVisible()
    
    // 平板版
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('form')).toBeVisible()
    
    // 手機版
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('form')).toBeVisible()
  })
})