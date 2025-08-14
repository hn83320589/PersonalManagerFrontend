import httpService from './http'
import type { ApiResponse, BlogPost } from '@/types/api'

class BlogService {
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts')
  }

  async getPublicBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/public')
  }

  async getPublishedBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/published')
  }

  async getDraftBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/drafts')
  }

  async getBlogPostById(id: number): Promise<ApiResponse<BlogPost>> {
    return httpService.get<BlogPost>(`/blogposts/${id}`)
  }

  async getBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    return httpService.get<BlogPost>(`/blogposts/slug/${encodeURIComponent(slug)}`)
  }

  async getBlogPostsByUserId(userId: number): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>(`/blogposts/user/${userId}`)
  }

  async getBlogPostsByCategory(category: string): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>(`/blogposts/category/${encodeURIComponent(category)}`)
  }

  async getBlogPostsByTag(tag: string): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>(`/blogposts/tag/${encodeURIComponent(tag)}`)
  }

  async getFeaturedBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/featured')
  }

  async getRecentBlogPosts(limit: number = 5): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/recent', { limit })
  }

  async getPopularBlogPosts(limit: number = 5): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/popular', { limit })
  }

  async createBlogPost(post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    return httpService.post<BlogPost>('/blogposts', post)
  }

  async updateBlogPost(id: number, post: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    return httpService.put<BlogPost>(`/blogposts/${id}`, post)
  }

  async deleteBlogPost(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/blogposts/${id}`)
  }

  async publishBlogPost(id: number): Promise<ApiResponse<BlogPost>> {
    return httpService.post<BlogPost>(`/blogposts/${id}/publish`)
  }

  async unpublishBlogPost(id: number): Promise<ApiResponse<BlogPost>> {
    return httpService.post<BlogPost>(`/blogposts/${id}/unpublish`)
  }

  async incrementViewCount(id: number): Promise<ApiResponse<void>> {
    return httpService.post<void>(`/blogposts/${id}/view`)
  }

  // Search methods
  async searchBlogPosts(keyword: string): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/search', { keyword })
  }

  async searchPublicBlogPosts(keyword: string): Promise<ApiResponse<BlogPost[]>> {
    return httpService.get<BlogPost[]>('/blogposts/search/public', { keyword })
  }

  // Category and Tag management
  async getBlogCategories(): Promise<ApiResponse<string[]>> {
    return httpService.get<string[]>('/blogposts/categories')
  }

  async getBlogTags(): Promise<ApiResponse<string[]>> {
    return httpService.get<string[]>('/blogposts/tags')
  }

  async getPopularTags(limit: number = 10): Promise<ApiResponse<{ tag: string; count: number }[]>> {
    return httpService.get('/blogposts/tags/popular', { limit })
  }

  // Bulk operations
  async bulkUpdateBlogPosts(posts: { id: number; data: Partial<BlogPost> }[]): Promise<ApiResponse<BlogPost[]>> {
    return httpService.put<BlogPost[]>('/blogposts/bulk', { posts })
  }

  async bulkDeleteBlogPosts(postIds: number[]): Promise<ApiResponse<void>> {
    return httpService.post<void>('/blogposts/bulk/delete', { postIds })
  }

  async bulkPublishBlogPosts(postIds: number[]): Promise<ApiResponse<BlogPost[]>> {
    return httpService.post<BlogPost[]>('/blogposts/bulk/publish', { postIds })
  }

  async bulkUnpublishBlogPosts(postIds: number[]): Promise<ApiResponse<BlogPost[]>> {
    return httpService.post<BlogPost[]>('/blogposts/bulk/unpublish', { postIds })
  }

  // Statistics
  async getBlogStatistics(): Promise<ApiResponse<{
    totalPosts: number
    publishedPosts: number
    draftPosts: number
    totalViews: number
    postsByCategory: Record<string, number>
    popularPosts: BlogPost[]
  }>> {
    return httpService.get('/blogposts/statistics')
  }

  // Content management
  async generateSlug(title: string): Promise<ApiResponse<{ slug: string }>> {
    return httpService.post('/blogposts/generate-slug', { title })
  }

  async validateSlug(slug: string, excludeId?: number): Promise<ApiResponse<{ isAvailable: boolean }>> {
    return httpService.get('/blogposts/validate-slug', { slug, excludeId })
  }

  // Export/Import
  async exportBlogPosts(format: 'json' | 'csv' | 'xml' = 'json'): Promise<ApiResponse<string>> {
    return httpService.get(`/blogposts/export/${format}`)
  }

  async importBlogPosts(file: File): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    return httpService.uploadFile('/blogposts/import', formData)
  }
}

export const blogService = new BlogService()
export default blogService