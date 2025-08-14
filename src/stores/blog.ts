import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BlogPost } from '@/types/api'

export const useBlogStore = defineStore('blog', () => {
  // State
  const posts = ref<BlogPost[]>([])
  const currentPost = ref<BlogPost | null>(null)
  const featuredPosts = ref<BlogPost[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const publishedPosts = computed(() => 
    posts.value.filter(post => post.isPublished).sort((a, b) => 
      new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    )
  )

  const publicPosts = computed(() => 
    publishedPosts.value.filter(post => post.isPublic)
  )

  const draftPosts = computed(() => 
    posts.value.filter(post => !post.isPublished)
  )

  const postsByCategory = computed(() => {
    const categories: Record<string, BlogPost[]> = {}
    publishedPosts.value.forEach(post => {
      const category = post.category || 'Uncategorized'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(post)
    })
    return categories
  })

  const recentPosts = computed(() => 
    publishedPosts.value.slice(0, 5)
  )

  const popularPosts = computed(() => 
    publishedPosts.value.sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
  )

  // Actions
  async function fetchPosts() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      posts.value = []
    } catch (err) {
      error.value = 'Failed to fetch posts'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPublicPosts() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch public posts'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPostById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentPost.value = null
    } catch (err) {
      error.value = 'Failed to fetch post'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPostBySlug(slug: string) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentPost.value = null
    } catch (err) {
      error.value = 'Failed to fetch post'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPostsByCategory(category: string) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch posts by category'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function searchPosts(keyword: string) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to search posts'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createPost(postData: Partial<BlogPost>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create post'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updatePost(id: number, postData: Partial<BlogPost>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update post'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function publishPost(id: number) {
    return await updatePost(id, { 
      isPublished: true, 
      publishedAt: new Date().toISOString() 
    })
  }

  async function unpublishPost(id: number) {
    return await updatePost(id, { 
      isPublished: false, 
      publishedAt: undefined 
    })
  }

  async function deletePost(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete post'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function incrementViewCount(id: number) {
    const post = posts.value.find(p => p.id === id)
    if (post) {
      post.viewCount += 1
      // Update on server
      await updatePost(id, { viewCount: post.viewCount })
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentPost() {
    currentPost.value = null
  }

  return {
    // State
    posts,
    currentPost,
    featuredPosts,
    isLoading,
    error,
    // Getters
    publishedPosts,
    publicPosts,
    draftPosts,
    postsByCategory,
    recentPosts,
    popularPosts,
    // Actions
    fetchPosts,
    fetchPublicPosts,
    fetchPostById,
    fetchPostBySlug,
    fetchPostsByCategory,
    searchPosts,
    createPost,
    updatePost,
    publishPost,
    unpublishPost,
    deletePost,
    incrementViewCount,
    clearError,
    clearCurrentPost,
  }
})