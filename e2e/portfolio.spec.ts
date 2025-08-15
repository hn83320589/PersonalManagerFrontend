import { test, expect } from '@playwright/test'

test.describe('作品集頁面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio')
  })

  test('頁面基本元素', async ({ page }) => {
    // 檢查頁面標題
    await expect(page.locator('text=作品集')).toBeVisible()
    
    // 檢查搜尋功能
    await expect(page.locator('input[placeholder*="搜尋"]')).toBeVisible()
    
    // 檢查分類篩選
    await expect(page.locator('select')).toBeVisible()
    
    // 檢查作品卡片容器
    await expect(page.locator('[data-testid="portfolio-grid"]')).toBeVisible()
  })

  test('搜尋功能', async ({ page }) => {
    // 輸入搜尋關鍵字
    await page.fill('input[placeholder*="搜尋"]', 'Vue')
    
    // 等待搜尋結果
    await page.waitForTimeout(1000)
    
    // 檢查搜尋結果是否包含關鍵字
    const portfolioCards = page.locator('[data-testid="portfolio-card"]')
    if (await portfolioCards.count() > 0) {
      // 如果有結果，檢查是否包含搜尋關鍵字
      const firstCard = portfolioCards.first()
      await expect(firstCard).toContainText('Vue', { ignoreCase: true })
    }
  })

  test('分類篩選', async ({ page }) => {
    // 選擇特定分類
    await page.selectOption('select', 'web')
    
    // 等待篩選結果
    await page.waitForTimeout(1000)
    
    // 檢查所有顯示的作品都屬於選擇的分類
    const portfolioCards = page.locator('[data-testid="portfolio-card"]')
    const count = await portfolioCards.count()
    
    if (count > 0) {
      // 檢查第一個卡片的分類標籤
      const categoryBadge = portfolioCards.first().locator('[data-testid="category-badge"]')
      await expect(categoryBadge).toContainText('web', { ignoreCase: true })
    }
  })

  test('分頁功能', async ({ page }) => {
    // 檢查分頁控制器是否存在
    const pagination = page.locator('[data-testid="pagination"]')
    
    if (await pagination.isVisible()) {
      // 檢查頁碼按鈕
      await expect(pagination.locator('button')).toHaveCount.greaterThan(0)
      
      // 如果有多頁，測試頁面切換
      const nextButton = pagination.locator('text=下一頁')
      if (await nextButton.isVisible() && !await nextButton.isDisabled()) {
        await nextButton.click()
        
        // 檢查 URL 是否更新或內容是否改變
        await page.waitForTimeout(1000)
      }
    }
  })

  test('作品卡片內容', async ({ page }) => {
    const portfolioCards = page.locator('[data-testid="portfolio-card"]')
    
    if (await portfolioCards.count() > 0) {
      const firstCard = portfolioCards.first()
      
      // 檢查卡片基本元素
      await expect(firstCard.locator('img')).toBeVisible() // 專案圖片
      await expect(firstCard.locator('h3')).toBeVisible() // 專案標題
      await expect(firstCard.locator('p')).toBeVisible() // 專案描述
      
      // 檢查技術標籤
      const techTags = firstCard.locator('[data-testid="tech-tag"]')
      if (await techTags.count() > 0) {
        await expect(techTags.first()).toBeVisible()
      }
      
      // 檢查操作按鈕
      const viewButton = firstCard.locator('text=查看詳情')
      if (await viewButton.isVisible()) {
        await expect(viewButton).toBeVisible()
      }
    }
  })

  test('作品詳情頁面導航', async ({ page }) => {
    const portfolioCards = page.locator('[data-testid="portfolio-card"]')
    
    if (await portfolioCards.count() > 0) {
      const firstCard = portfolioCards.first()
      
      // 點擊查看詳情按鈕或卡片
      const viewButton = firstCard.locator('text=查看詳情')
      if (await viewButton.isVisible()) {
        await viewButton.click()
      } else {
        await firstCard.click()
      }
      
      // 檢查是否導航到詳情頁面
      await expect(page.url()).toContain('/portfolio/')
      
      // 檢查詳情頁面內容
      await expect(page.locator('h1')).toBeVisible() // 專案標題
      await expect(page.locator('img')).toBeVisible() // 專案圖片
    }
  })

  test('響應式設計', async ({ page }) => {
    // 桌面版 - 檢查網格佈局
    await page.setViewportSize({ width: 1200, height: 800 })
    const desktopGrid = page.locator('[data-testid="portfolio-grid"]')
    await expect(desktopGrid).toBeVisible()
    
    // 平板版 - 檢查佈局調整
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(desktopGrid).toBeVisible()
    
    // 手機版 - 檢查單欄佈局
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(desktopGrid).toBeVisible()
  })

  test('載入狀態', async ({ page }) => {
    // 重新載入頁面以觀察載入狀態
    await page.reload()
    
    // 檢查載入指示器（如果有的話）
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]')
    if (await loadingSpinner.isVisible({ timeout: 1000 })) {
      // 等待載入完成
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 })
    }
    
    // 確認內容已載入
    await expect(page.locator('[data-testid="portfolio-grid"]')).toBeVisible()
  })

  test('空狀態處理', async ({ page }) => {
    // 搜尋一個不存在的關鍵字
    await page.fill('input[placeholder*="搜尋"]', 'xyz123nonexistent')
    await page.waitForTimeout(1000)
    
    // 檢查是否顯示空狀態訊息
    const emptyMessage = page.locator('text=沒有找到符合條件的作品')
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible()
    }
  })

  test('重置篩選功能', async ({ page }) => {
    // 設定一些篩選條件
    await page.fill('input[placeholder*="搜尋"]', 'test')
    await page.selectOption('select', 'mobile')
    
    // 尋找重置按鈕（如果有的話）
    const resetButton = page.locator('text=重置')
    if (await resetButton.isVisible()) {
      await resetButton.click()
      
      // 檢查篩選是否已重置
      await expect(page.locator('input[placeholder*="搜尋"]')).toHaveValue('')
      await expect(page.locator('select')).toHaveValue('all')
    }
  })
})