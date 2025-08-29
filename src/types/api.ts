// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  errors: string[]
}

// User Types
export interface User {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  phone?: string
  role?: string
  isActive: boolean
  lastLoginDate?: string
  createdAt: string
  updatedAt: string
}

// Personal Profile Types
export interface PersonalProfile {
  id: number
  userId: number
  fullName: string
  title?: string
  bio?: string
  avatarUrl?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  user?: User
}

// Education Types
export interface Education {
  id: number
  userId: number
  schoolName: string
  degree: string
  major?: string
  startYear: number | string  // Allow both number and string
  endYear?: number | string   // Allow both number and string
  isPublic: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  user?: User
}

// Work Experience Types
export enum EmploymentType {
  FullTime = 0,
  PartTime = 1,
  Contract = 2,
  Freelance = 3,
  Internship = 4
}

export interface WorkExperience {
  id: number
  userId: number
  companyName: string
  position: string
  employmentType: EmploymentType
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
  location?: string
  isPublic: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  user?: User
}

// Skill Types
export enum SkillLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
  Expert = 3
}

export interface Skill {
  id: number
  userId: number
  name: string
  level: SkillLevel
  category?: string
  yearsOfExperience?: number
  description?: string
  isPublic: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  user?: User
}

// Portfolio Types
export interface Portfolio {
  id: number
  userId: number
  title: string
  description?: string
  technologyUsed?: string
  technologies?: string
  repositoryUrl?: string
  projectUrl?: string
  githubUrl?: string
  imageUrl?: string
  startDate?: string
  endDate?: string
  isPublic: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  user?: User
}

// Calendar Event Types
export enum EventType {
  Personal = 0,
  Work = 1,
  Meeting = 2,
  Reminder = 3,
  Other = 4
}

export interface CalendarEvent {
  id: number
  userId: number
  title: string
  description?: string
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  color?: string
  isAllDay: boolean
  location?: string
  isPublic: boolean
  eventType: EventType
  googleEventId?: string
  createdAt: string
  updatedAt: string
  user?: User
}

// Todo Item Types
export enum TaskStatus {
  Pending = 0,
  Planning = 1,
  InProgress = 2,
  Testing = 3,
  Completed = 4,
  OnHold = 5,
  Cancelled = 6
}

// Add string type for compatibility  
export type TaskStatusString = 'pending' | 'planning' | 'inProgress' | 'testing' | 'completed' | 'onHold' | 'cancelled'

export enum TodoPriority {
  Low = 0,
  Medium = 1,
  High = 2
}

// Add string type for compatibility
export type TodoPriorityString = 'low' | 'medium' | 'high'

export interface TodoItem {
  id: number
  userId: number
  title: string
  description?: string
  status: TaskStatus | TaskStatusString
  isCompleted: boolean
  priority: TodoPriority | TodoPriorityString
  dueDate?: string
  completedAt?: string
  completedDate?: string
  category?: string
  tags?: string
  startDate?: string  // Add startDate property
  estimatedHours?: number  // Add estimated hours
  actualHours?: number     // Add actual hours
  isRecurring?: boolean    // Add recurring properties
  recurringPattern?: string
  hasReminder?: boolean    // Add reminder properties
  reminderType?: string
  reminderTime?: string
  reminderUnit?: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  user?: User
}

// Work Task Types
export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export interface WorkTask {
  id: number
  userId: number
  title: string
  description?: string
  status: TaskStatus | TaskStatusString
  priority: TaskPriority
  startDate?: string
  dueDate?: string
  completedAt?: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  projectId?: string
  project?: string
  tags?: string
  createdAt: string
  updatedAt: string
  user?: User
}

// Blog Post Types
export interface BlogPost {
  id: number
  userId: number
  title: string
  content: string
  summary?: string
  excerpt?: string  // Add excerpt property for editor
  isPublished: boolean
  isPublic: boolean
  publishedAt?: string
  publishedDate?: string
  slug?: string
  featuredImageUrl?: string
  featuredImage?: string  // Add featuredImage property for compatibility
  tags?: string
  category?: string
  viewCount: number
  views?: number  // Add views property for compatibility
  status: 'draft' | 'published' | 'archived'  // Add status property
  author?: string  // Add author property
  metaDescription?: string  // Add SEO meta description
  metaKeywords?: string  // Add SEO meta keywords
  createdAt: string
  updatedAt: string
  user?: User
}

// Guest Book Entry Types
export interface GuestBookEntry {
  id: number
  name: string
  email?: string
  website?: string
  message: string
  parentId?: number
  isApproved: boolean
  isPublic: boolean
  ipAddress?: string
  userAgent?: string
  status: 'pending' | 'approved' | 'rejected' | 'spam'  // Add status property
  adminReply?: string  // Add admin reply property
  reports?: number     // Add reports count property
  createdAt: string
  updatedAt: string
  // Additional properties for UI functionality
  likes?: number
  isLiked?: boolean
  isOwner?: boolean
  reply?: {
    message: string
    createdAt: string
  }
}

// Contact Method Types
export enum ContactType {
  Email = 0,
  Phone = 1,
  LinkedIn = 2,
  GitHub = 3,
  Facebook = 4,
  Twitter = 5,
  Instagram = 6,
  Other = 7
}

export interface ContactMethod {
  id: number
  userId: number
  type: ContactType
  icon?: string
  value: string
  label?: string
  isPublic: boolean
  isPreferred: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  user?: User
}

// File Upload Types
export interface FileUpload {
  id: number
  fileName: string
  originalFileName: string
  filePath: string
  contentType: string
  fileSize: number
  category: string
  description?: string
  isPublic: boolean
  uploadedBy?: number
  createdAt: string
  updatedAt: string
}