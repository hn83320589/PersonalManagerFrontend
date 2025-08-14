import httpService from './http'
import type { ApiResponse, Skill, SkillLevel } from '@/types/api'

class SkillService {
  async getSkills(): Promise<ApiResponse<Skill[]>> {
    return httpService.get<Skill[]>('/skills')
  }

  async getPublicSkills(): Promise<ApiResponse<Skill[]>> {
    return httpService.get<Skill[]>('/skills/public')
  }

  async getSkillById(id: number): Promise<ApiResponse<Skill>> {
    return httpService.get<Skill>(`/skills/${id}`)
  }

  async getSkillsByUserId(userId: number): Promise<ApiResponse<Skill[]>> {
    return httpService.get<Skill[]>(`/skills/user/${userId}`)
  }

  async getSkillsByCategory(category: string): Promise<ApiResponse<Skill[]>> {
    return httpService.get<Skill[]>(`/skills/category/${encodeURIComponent(category)}`)
  }

  async getSkillsByLevel(level: SkillLevel): Promise<ApiResponse<Skill[]>> {
    return httpService.get<Skill[]>(`/skills/level/${level}`)
  }

  async getSkillCategories(): Promise<ApiResponse<string[]>> {
    return httpService.get<string[]>('/skills/categories')
  }

  async createSkill(skill: Partial<Skill>): Promise<ApiResponse<Skill>> {
    return httpService.post<Skill>('/skills', skill)
  }

  async updateSkill(id: number, skill: Partial<Skill>): Promise<ApiResponse<Skill>> {
    return httpService.put<Skill>(`/skills/${id}`, skill)
  }

  async deleteSkill(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/skills/${id}`)
  }

  async updateSkillOrder(skillId: number, newOrder: number): Promise<ApiResponse<void>> {
    return httpService.put<void>(`/skills/${skillId}/order`, { sortOrder: newOrder })
  }

  async bulkUpdateSkills(skills: Partial<Skill>[]): Promise<ApiResponse<Skill[]>> {
    return httpService.put<Skill[]>('/skills/bulk', { skills })
  }

  // Search and filter methods
  async searchSkills(keyword: string): Promise<ApiResponse<Skill[]>> {
    return httpService.get<Skill[]>(`/skills/search`, { keyword })
  }

  async getSkillStatistics(): Promise<ApiResponse<{
    totalSkills: number
    skillsByLevel: Record<SkillLevel, number>
    skillsByCategory: Record<string, number>
  }>> {
    return httpService.get('/skills/statistics')
  }
}

export const skillService = new SkillService()
export default skillService