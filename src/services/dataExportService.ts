/**
 * 資料匯入匯出服務
 * 提供各種格式的資料匯入匯出功能
 */

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml' | 'pdf' | 'excel'
  includeMetadata: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  categories?: string[]
  fields?: string[]
  password?: string
  compression?: boolean
  template?: string
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'xml' | 'excel'
  mapping?: Record<string, string>
  skipErrors?: boolean
  validateData?: boolean
  overwriteExisting?: boolean
  batchSize?: number
  onProgress?: (progress: ImportProgress) => void
}

export interface ExportResult {
  success: boolean
  fileName: string
  fileSize: number
  recordCount: number
  url?: string
  error?: string
  metadata: {
    exportedAt: Date
    format: string
    version: string
  }
}

export interface ImportResult {
  success: boolean
  totalRecords: number
  importedRecords: number
  skippedRecords: number
  errorRecords: number
  errors: Array<{
    row: number
    field: string
    message: string
    data: any
  }>
  warnings: string[]
  duration: number
}

export interface ImportProgress {
  processed: number
  total: number
  percentage: number
  currentItem: string
  errors: number
  speed: number
  remainingTime: number
}

export interface DataTemplate {
  id: string
  name: string
  description: string
  category: string
  format: string
  fields: Array<{
    name: string
    type: 'string' | 'number' | 'date' | 'boolean'
    required: boolean
    description: string
    defaultValue?: any
    validation?: {
      pattern?: string
      min?: number
      max?: number
      options?: string[]
    }
  }>
  sampleData: Record<string, any>[]
  version: string
  created: Date
  updated: Date
}

export interface BackupOptions {
  includeSettings: boolean
  includeFiles: boolean
  compression: boolean
  encryption: boolean
  password?: string
  excludeCategories?: string[]
}

export interface BackupResult {
  success: boolean
  fileName: string
  fileSize: number
  recordCount: number
  categories: string[]
  created: Date
  url?: string
  error?: string
}

/**
 * 資料匯入匯出服務類別
 */
export class DataExportService {
  private templates: Map<string, DataTemplate> = new Map()

  constructor() {
    this.loadTemplates()
  }

  /**
   * 載入預設範本
   */
  private loadTemplates(): void {
    const defaultTemplates: DataTemplate[] = [
      {
        id: 'tasks-template',
        name: '任務資料',
        description: '個人任務和待辦事項',
        category: 'productivity',
        format: 'json',
        fields: [
          { name: 'title', type: 'string', required: true, description: '任務標題' },
          { name: 'description', type: 'string', required: false, description: '任務描述' },
          { name: 'status', type: 'string', required: true, description: '任務狀態', validation: { options: ['pending', 'in-progress', 'completed'] } },
          { name: 'priority', type: 'string', required: false, description: '優先級', validation: { options: ['low', 'medium', 'high', 'critical'] } },
          { name: 'dueDate', type: 'date', required: false, description: '截止日期' },
          { name: 'tags', type: 'string', required: false, description: '標籤（逗號分隔）' }
        ],
        sampleData: [
          {
            title: '完成專案提案',
            description: '準備下週一的專案提案簡報',
            status: 'in-progress',
            priority: 'high',
            dueDate: '2024-01-15',
            tags: '工作,重要'
          }
        ],
        version: '1.0',
        created: new Date(),
        updated: new Date()
      },
      {
        id: 'contacts-template',
        name: '聯絡人資料',
        description: '個人聯絡人清單',
        category: 'personal',
        format: 'csv',
        fields: [
          { name: 'name', type: 'string', required: true, description: '姓名' },
          { name: 'email', type: 'string', required: false, description: '電子郵件', validation: { pattern: '^[^@]+@[^@]+\\.[^@]+$' } },
          { name: 'phone', type: 'string', required: false, description: '電話號碼' },
          { name: 'company', type: 'string', required: false, description: '公司' },
          { name: 'position', type: 'string', required: false, description: '職位' },
          { name: 'notes', type: 'string', required: false, description: '備註' }
        ],
        sampleData: [
          {
            name: '張三',
            email: 'zhang.san@example.com',
            phone: '0912-345-678',
            company: 'ABC公司',
            position: '專案經理',
            notes: '重要客戶'
          }
        ],
        version: '1.0',
        created: new Date(),
        updated: new Date()
      },
      {
        id: 'calendar-template',
        name: '行事曆事件',
        description: '行事曆事件資料',
        category: 'calendar',
        format: 'json',
        fields: [
          { name: 'title', type: 'string', required: true, description: '事件標題' },
          { name: 'description', type: 'string', required: false, description: '事件描述' },
          { name: 'startTime', type: 'date', required: true, description: '開始時間' },
          { name: 'endTime', type: 'date', required: true, description: '結束時間' },
          { name: 'location', type: 'string', required: false, description: '地點' },
          { name: 'isAllDay', type: 'boolean', required: false, description: '全天事件', defaultValue: false },
          { name: 'reminders', type: 'string', required: false, description: '提醒設定（分鐘，逗號分隔）' }
        ],
        sampleData: [
          {
            title: '團隊會議',
            description: '週例會討論專案進度',
            startTime: '2024-01-15T10:00:00',
            endTime: '2024-01-15T11:00:00',
            location: '會議室A',
            isAllDay: false,
            reminders: '15,5'
          }
        ],
        version: '1.0',
        created: new Date(),
        updated: new Date()
      }
    ]

    try {
      const saved = localStorage.getItem('export-templates')
      if (saved) {
        const templates = JSON.parse(saved)
        for (const template of templates) {
          template.created = new Date(template.created)
          template.updated = new Date(template.updated)
          this.templates.set(template.id, template)
        }
      } else {
        for (const template of defaultTemplates) {
          this.templates.set(template.id, template)
        }
        this.saveTemplates()
      }
    } catch (error) {
      console.warn('Failed to load export templates:', error)
      for (const template of defaultTemplates) {
        this.templates.set(template.id, template)
      }
    }
  }

  /**
   * 儲存範本
   */
  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values())
      localStorage.setItem('export-templates', JSON.stringify(templates))
    } catch (error) {
      console.warn('Failed to save export templates:', error)
    }
  }

  /**
   * 匯出資料為 JSON
   */
  async exportToJSON<T>(
    data: T[],
    options: ExportOptions = { format: 'json', includeMetadata: true }
  ): Promise<ExportResult> {
    try {
      const exportData = {
        metadata: options.includeMetadata ? {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          recordCount: data.length,
          format: 'json'
        } : undefined,
        data: this.filterData(data, options)
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const fileName = `export_${new Date().toISOString().split('T')[0]}.json`
      const url = URL.createObjectURL(blob)

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        recordCount: data.length,
        url,
        metadata: {
          exportedAt: new Date(),
          format: 'json',
          version: '1.0'
        }
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        recordCount: 0,
        error: error.message,
        metadata: {
          exportedAt: new Date(),
          format: 'json',
          version: '1.0'
        }
      }
    }
  }

  /**
   * 匯出資料為 CSV
   */
  async exportToCSV<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = { format: 'csv', includeMetadata: true }
  ): Promise<ExportResult> {
    try {
      const filteredData = this.filterData(data, options)
      
      if (filteredData.length === 0) {
        throw new Error('No data to export')
      }

      // 取得所有欄位名稱
      const fields = options.fields || Object.keys(filteredData[0])
      
      // 建立 CSV 標題行
      const headers = fields.join(',')
      
      // 建立 CSV 資料行
      const rows = filteredData.map(item => 
        fields.map(field => {
          const value = item[field]
          if (value === null || value === undefined) return ''
          
          // 處理包含逗號、引號或換行的值
          const stringValue = String(value)
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        }).join(',')
      )

      const csvContent = [headers, ...rows].join('\n')
      
      // 添加 BOM 以支援中文
      const bom = '\uFEFF'
      const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' })
      const fileName = `export_${new Date().toISOString().split('T')[0]}.csv`
      const url = URL.createObjectURL(blob)

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        recordCount: filteredData.length,
        url,
        metadata: {
          exportedAt: new Date(),
          format: 'csv',
          version: '1.0'
        }
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        recordCount: 0,
        error: error.message,
        metadata: {
          exportedAt: new Date(),
          format: 'csv',
          version: '1.0'
        }
      }
    }
  }

  /**
   * 匯出資料為 XML
   */
  async exportToXML<T extends Record<string, any>>(
    data: T[],
    options: ExportOptions = { format: 'xml', includeMetadata: true },
    rootElement: string = 'data'
  ): Promise<ExportResult> {
    try {
      const filteredData = this.filterData(data, options)
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      xml += `<${rootElement}>\n`

      if (options.includeMetadata) {
        xml += '  <metadata>\n'
        xml += `    <exportedAt>${new Date().toISOString()}</exportedAt>\n`
        xml += `    <version>1.0</version>\n`
        xml += `    <recordCount>${filteredData.length}</recordCount>\n`
        xml += `    <format>xml</format>\n`
        xml += '  </metadata>\n'
      }

      xml += '  <items>\n'
      
      for (const item of filteredData) {
        xml += '    <item>\n'
        for (const [key, value] of Object.entries(item)) {
          const escapedValue = this.escapeXml(String(value || ''))
          xml += `      <${key}>${escapedValue}</${key}>\n`
        }
        xml += '    </item>\n'
      }
      
      xml += '  </items>\n'
      xml += `</${rootElement}>\n`

      const blob = new Blob([xml], { type: 'application/xml' })
      const fileName = `export_${new Date().toISOString().split('T')[0]}.xml`
      const url = URL.createObjectURL(blob)

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        recordCount: filteredData.length,
        url,
        metadata: {
          exportedAt: new Date(),
          format: 'xml',
          version: '1.0'
        }
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        recordCount: 0,
        error: error.message,
        metadata: {
          exportedAt: new Date(),
          format: 'xml',
          version: '1.0'
        }
      }
    }
  }

  /**
   * 從 JSON 匯入資料
   */
  async importFromJSON<T>(
    file: File,
    options: ImportOptions = { format: 'json', validateData: true }
  ): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      totalRecords: 0,
      importedRecords: 0,
      skippedRecords: 0,
      errorRecords: 0,
      errors: [],
      warnings: [],
      duration: 0
    }

    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      
      // 支援不同的 JSON 結構
      let records = []
      if (Array.isArray(jsonData)) {
        records = jsonData
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        records = jsonData.data
      } else if (jsonData.items && Array.isArray(jsonData.items)) {
        records = jsonData.items
      } else {
        throw new Error('Invalid JSON structure. Expected array or object with data/items array.')
      }

      result.totalRecords = records.length

      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        
        try {
          if (options.validateData) {
            this.validateRecord(record, i + 1, result)
          }

          if (options.mapping) {
            this.applyMapping(record, options.mapping)
          }

          // 這裡應該呼叫實際的資料保存邏輯
          // await this.saveRecord(record)
          
          result.importedRecords++

          if (options.onProgress) {
            options.onProgress({
              processed: i + 1,
              total: records.length,
              percentage: ((i + 1) / records.length) * 100,
              currentItem: record.name || record.title || `Record ${i + 1}`,
              errors: result.errorRecords,
              speed: (i + 1) / ((Date.now() - startTime) / 1000),
              remainingTime: ((records.length - i - 1) / ((i + 1) / ((Date.now() - startTime) / 1000)))
            })
          }
        } catch (error) {
          result.errorRecords++
          result.errors.push({
            row: i + 1,
            field: 'general',
            message: error.message,
            data: record
          })

          if (!options.skipErrors) {
            result.success = false
            break
          }
        }
      }

      result.duration = Date.now() - startTime
      return result

    } catch (error) {
      result.success = false
      result.errors.push({
        row: 0,
        field: 'file',
        message: error.message,
        data: null
      })
      result.duration = Date.now() - startTime
      return result
    }
  }

  /**
   * 從 CSV 匯入資料
   */
  async importFromCSV<T>(
    file: File,
    options: ImportOptions = { format: 'csv', validateData: true }
  ): Promise<ImportResult> {
    const startTime = Date.now()
    const result: ImportResult = {
      success: true,
      totalRecords: 0,
      importedRecords: 0,
      skippedRecords: 0,
      errorRecords: 0,
      errors: [],
      warnings: [],
      duration: 0
    }

    try {
      const text = await file.text()
      const lines = this.parseCSV(text)
      
      if (lines.length === 0) {
        throw new Error('Empty CSV file')
      }

      const headers = lines[0]
      const dataLines = lines.slice(1)
      result.totalRecords = dataLines.length

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i]
        const record: Record<string, any> = {}
        
        try {
          // 建立物件
          for (let j = 0; j < headers.length; j++) {
            const header = headers[j]
            const value = line[j] || ''
            record[header] = this.parseValue(value)
          }

          if (options.validateData) {
            this.validateRecord(record, i + 2, result) // +2 因為標題行和 0-based index
          }

          if (options.mapping) {
            this.applyMapping(record, options.mapping)
          }

          // 這裡應該呼叫實際的資料保存邏輯
          // await this.saveRecord(record)
          
          result.importedRecords++

          if (options.onProgress) {
            options.onProgress({
              processed: i + 1,
              total: dataLines.length,
              percentage: ((i + 1) / dataLines.length) * 100,
              currentItem: record.name || record.title || `Row ${i + 2}`,
              errors: result.errorRecords,
              speed: (i + 1) / ((Date.now() - startTime) / 1000),
              remainingTime: ((dataLines.length - i - 1) / ((i + 1) / ((Date.now() - startTime) / 1000)))
            })
          }
        } catch (error) {
          result.errorRecords++
          result.errors.push({
            row: i + 2,
            field: 'general',
            message: error.message,
            data: record
          })

          if (!options.skipErrors) {
            result.success = false
            break
          }
        }
      }

      result.duration = Date.now() - startTime
      return result

    } catch (error) {
      result.success = false
      result.errors.push({
        row: 0,
        field: 'file',
        message: error.message,
        data: null
      })
      result.duration = Date.now() - startTime
      return result
    }
  }

  /**
   * 建立完整備份
   */
  async createBackup(options: BackupOptions): Promise<BackupResult> {
    try {
      const backupData: any = {
        metadata: {
          created: new Date().toISOString(),
          version: '1.0',
          options
        },
        categories: []
      }

      // 收集各類資料
      // 這裡需要與實際的資料服務整合
      const categories = ['tasks', 'contacts', 'calendar', 'notes', 'projects']
      
      for (const category of categories) {
        if (!options.excludeCategories?.includes(category)) {
          // const data = await this.getDataByCategory(category)
          // backupData[category] = data
          backupData.categories.push(category)
        }
      }

      // 包含設定
      if (options.includeSettings) {
        backupData.settings = {
          // 從各種服務收集設定
        }
      }

      let content = JSON.stringify(backupData, null, 2)
      
      // 加密
      if (options.encryption && options.password) {
        content = await this.encryptData(content, options.password)
      }

      // 壓縮
      if (options.compression) {
        content = await this.compressData(content)
      }

      const blob = new Blob([content], { 
        type: options.encryption ? 'application/octet-stream' : 'application/json' 
      })
      
      const fileName = `backup_${new Date().toISOString().split('T')[0]}.${options.encryption ? 'enc' : 'json'}`
      const url = URL.createObjectURL(blob)

      return {
        success: true,
        fileName,
        fileSize: blob.size,
        recordCount: 0, // 需要實際計算
        categories: backupData.categories,
        created: new Date(),
        url
      }
    } catch (error) {
      return {
        success: false,
        fileName: '',
        fileSize: 0,
        recordCount: 0,
        categories: [],
        created: new Date(),
        error: error.message
      }
    }
  }

  /**
   * 還原備份
   */
  async restoreBackup(file: File, password?: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      totalRecords: 0,
      importedRecords: 0,
      skippedRecords: 0,
      errorRecords: 0,
      errors: [],
      warnings: [],
      duration: 0
    }

    try {
      let content = await file.text()

      // 解密
      if (password) {
        content = await this.decryptData(content, password)
      }

      // 解壓縮
      if (this.isCompressed(content)) {
        content = await this.decompressData(content)
      }

      const backupData = JSON.parse(content)
      
      if (!backupData.metadata || !backupData.categories) {
        throw new Error('Invalid backup file format')
      }

      // 還原各類資料
      for (const category of backupData.categories) {
        if (backupData[category]) {
          // await this.restoreCategory(category, backupData[category])
          result.importedRecords += backupData[category].length || 0
        }
      }

      // 還原設定
      if (backupData.settings) {
        // await this.restoreSettings(backupData.settings)
      }

      return result
    } catch (error) {
      result.success = false
      result.errors.push({
        row: 0,
        field: 'file',
        message: error.message,
        data: null
      })
      return result
    }
  }

  /**
   * 取得範本列表
   */
  getTemplates(): DataTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * 取得特定範本
   */
  getTemplate(id: string): DataTemplate | undefined {
    return this.templates.get(id)
  }

  /**
   * 儲存範本
   */
  saveTemplate(template: DataTemplate): void {
    template.updated = new Date()
    this.templates.set(template.id, template)
    this.saveTemplates()
  }

  /**
   * 刪除範本
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id)
  }

  /**
   * 過濾資料
   */
  private filterData<T>(data: T[], options: ExportOptions): T[] {
    let filtered = [...data]

    // 日期範圍過濾
    if (options.dateRange) {
      filtered = filtered.filter((item: any) => {
        const date = new Date(item.created || item.date || item.timestamp)
        return date >= options.dateRange!.start && date <= options.dateRange!.end
      })
    }

    // 類別過濾
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter((item: any) => 
        options.categories!.includes(item.category)
      )
    }

    // 欄位過濾
    if (options.fields && options.fields.length > 0) {
      filtered = filtered.map(item => {
        const filteredItem: any = {}
        for (const field of options.fields!) {
          if (field in (item as object)) {
            filteredItem[field] = (item as any)[field]
          }
        }
        return filteredItem as T
      })
    }

    return filtered
  }

  /**
   * 解析 CSV
   */
  private parseCSV(text: string): string[][] {
    const lines: string[][] = []
    const rows = text.split('\n')
    
    for (const row of rows) {
      if (row.trim()) {
        lines.push(this.parseCSVLine(row))
      }
    }
    
    return lines
  }

  /**
   * 解析 CSV 行
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let inQuotes = false
    let current = ''
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++ // 跳過下一個引號
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  /**
   * 解析值
   */
  private parseValue(value: string): any {
    if (!value) return ''
    
    // 布林值
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
    
    // 數字
    if (/^\d+$/.test(value)) return parseInt(value, 10)
    if (/^\d*\.\d+$/.test(value)) return parseFloat(value)
    
    // 日期
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value)
      if (!isNaN(date.getTime())) return date
    }
    
    return value
  }

  /**
   * 驗證記錄
   */
  private validateRecord(record: any, row: number, result: ImportResult): void {
    // 基本驗證邏輯
    if (!record || typeof record !== 'object') {
      throw new Error('Invalid record format')
    }
    
    // 可以根據範本進行更詳細的驗證
  }

  /**
   * 應用欄位映射
   */
  private applyMapping(record: any, mapping: Record<string, string>): void {
    const newRecord: any = {}
    
    for (const [oldField, newField] of Object.entries(mapping)) {
      if (oldField in record) {
        newRecord[newField] = record[oldField]
      }
    }
    
    // 複製未映射的欄位
    for (const [key, value] of Object.entries(record)) {
      if (!(key in mapping)) {
        newRecord[key] = value
      }
    }
    
    Object.assign(record, newRecord)
  }

  /**
   * 轉義 XML
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * 加密資料 (簡化版)
   */
  private async encryptData(data: string, password: string): Promise<string> {
    // 這裡應該使用真正的加密算法
    // 為了示例，我們使用簡單的 Base64 編碼
    const encoder = new TextEncoder()
    const encoded = encoder.encode(data + '::' + password)
    return btoa(String.fromCharCode(...encoded))
  }

  /**
   * 解密資料 (簡化版)
   */
  private async decryptData(data: string, password: string): Promise<string> {
    try {
      const decoded = atob(data)
      const bytes = new Uint8Array(decoded.length)
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i)
      }
      const decrypted = new TextDecoder().decode(bytes)
      const [content, pwd] = decrypted.split('::')
      
      if (pwd !== password) {
        throw new Error('Invalid password')
      }
      
      return content
    } catch (error) {
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * 壓縮資料 (簡化版)
   */
  private async compressData(data: string): Promise<string> {
    // 這裡應該使用真正的壓縮算法
    // 為了示例，我們只是標記為已壓縮
    return 'COMPRESSED::' + data
  }

  /**
   * 解壓縮資料 (簡化版)
   */
  private async decompressData(data: string): Promise<string> {
    if (data.startsWith('COMPRESSED::')) {
      return data.substring(12)
    }
    return data
  }

  /**
   * 檢查是否為壓縮資料
   */
  private isCompressed(data: string): boolean {
    return data.startsWith('COMPRESSED::')
  }
}

// 全域服務實例
export const dataExportService = new DataExportService()

// 便利函數
export function useDataExport() {
  return dataExportService
}