import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Skill, SkillLevel } from '@/types/api'

export const useSkillStore = defineStore('skill', () => {
  // State
  const skills = ref<Skill[]>([])
  const currentSkill = ref<Skill | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const publicSkills = computed(() => 
    skills.value.filter(skill => skill.isPublic).sort((a, b) => a.sortOrder - b.sortOrder)
  )

  const skillsByCategory = computed(() => {
    const categories: Record<string, Skill[]> = {}
    publicSkills.value.forEach(skill => {
      const category = skill.category || 'Other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(skill)
    })
    return categories
  })

  const skillsByLevel = computed(() => {
    const levels: Record<SkillLevel, Skill[]> = {
      'Beginner': [],
      'Intermediate': [],
      'Advanced': [],
      'Expert': []
    }
    publicSkills.value.forEach(skill => {
      if (levels[skill.level]) {
        levels[skill.level].push(skill)
      }
    })
    return levels
  })

  const expertSkills = computed(() =>
    publicSkills.value.filter(skill => skill.level === 'Expert')
  )

  // Actions
  async function fetchSkills() {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      skills.value = []
    } catch (err) {
      error.value = 'Failed to fetch skills'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSkillById(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      currentSkill.value = null
    } catch (err) {
      error.value = 'Failed to fetch skill'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSkillsByCategory(category: string) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch skills by category'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSkillsByLevel(level: SkillLevel) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return []
    } catch (err) {
      error.value = 'Failed to fetch skills by level'
      console.error(err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createSkill(skillData: Partial<Skill>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to create skill'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateSkill(id: number, skillData: Partial<Skill>) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return null
    } catch (err) {
      error.value = 'Failed to update skill'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSkill(id: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to delete skill'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateSkillOrder(skillId: number, newOrder: number) {
    isLoading.value = true
    error.value = null

    try {
      // API service will be implemented later
      return false
    } catch (err) {
      error.value = 'Failed to update skill order'
      console.error(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function clearCurrentSkill() {
    currentSkill.value = null
  }

  return {
    // State
    skills,
    currentSkill,
    isLoading,
    error,
    // Getters
    publicSkills,
    skillsByCategory,
    skillsByLevel,
    expertSkills,
    // Actions
    fetchSkills,
    fetchSkillById,
    fetchSkillsByCategory,
    fetchSkillsByLevel,
    createSkill,
    updateSkill,
    deleteSkill,
    updateSkillOrder,
    clearError,
    clearCurrentSkill,
  }
})