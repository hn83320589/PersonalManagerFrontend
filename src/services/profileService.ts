import httpService from './http'
import type { ApiResponse, PersonalProfile } from '@/types/api'

class ProfileService {
  // Get all profiles (admin/authenticated users)
  async getProfiles(): Promise<ApiResponse<PersonalProfile[]>> {
    return httpService.get<PersonalProfile[]>('/personalprofiles')
  }

  // Get only public profiles
  async getPublicProfiles(): Promise<ApiResponse<PersonalProfile[]>> {
    return httpService.get<PersonalProfile[]>('/personalprofiles/public')
  }

  // Get the main public profile (for public homepage)
  async getPublicProfile(): Promise<ApiResponse<PersonalProfile>> {
    return httpService.get<PersonalProfile>('/personalprofiles/public/main')
  }

  async getProfileById(id: number): Promise<ApiResponse<PersonalProfile>> {
    return httpService.get<PersonalProfile>(`/personalprofiles/${id}`)
  }

  async getProfileByUserId(userId: number): Promise<ApiResponse<PersonalProfile[]>> {
    return httpService.get<PersonalProfile[]>(`/personalprofiles/user/${userId}`)
  }

  async createProfile(profile: Partial<PersonalProfile>): Promise<ApiResponse<PersonalProfile>> {
    return httpService.post<PersonalProfile>('/personalprofiles', profile)
  }

  async updateProfile(id: number, profile: Partial<PersonalProfile>): Promise<ApiResponse<PersonalProfile>> {
    return httpService.put<PersonalProfile>(`/personalprofiles/${id}`, profile)
  }

  async deleteProfile(id: number): Promise<ApiResponse<void>> {
    return httpService.delete<void>(`/personalprofiles/${id}`)
  }
}

export const profileService = new ProfileService()
export default profileService