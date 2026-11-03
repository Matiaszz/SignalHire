import { api } from '../lib/api'
import type {
  AddMemberRequestDTO,
  CompanyResponseDTO,
  CompanySummaryResponseDTO,
  CreateCompanyRequestDTO,
  MemberResponseDTO,
  UpdateCompanyRequestDTO,
  UpdateMemberRoleRequestDTO,
} from '../types/company'

export const companyService = {
  async getMyCompanies(): Promise<CompanySummaryResponseDTO[]> {
    const response = await api.get<CompanySummaryResponseDTO[]>('/api/companies/my')
    return response.data
  },

  async getCompanyById(id: string): Promise<CompanyResponseDTO> {
    const response = await api.get<CompanyResponseDTO>(`/api/companies/${id}`)
    return response.data
  },

  async createCompany(data: CreateCompanyRequestDTO): Promise<CompanyResponseDTO> {
    const response = await api.post<CompanyResponseDTO>('/api/companies', data)
    return response.data
  },

  async updateCompany(id: string, data: UpdateCompanyRequestDTO): Promise<CompanyResponseDTO> {
    const response = await api.put<CompanyResponseDTO>(`/api/companies/${id}`, data)
    return response.data
  },

  async deleteCompany(id: string): Promise<void> {
    await api.delete(`/api/companies/${id}`)
  },

  async getCompanyMembers(companyId: string): Promise<MemberResponseDTO[]> {
    const response = await api.get<MemberResponseDTO[]>(`/api/companies/${companyId}/members`)
    return response.data
  },

  async addMember(companyId: string, data: AddMemberRequestDTO): Promise<MemberResponseDTO> {
    const response = await api.post<MemberResponseDTO>(`/api/companies/${companyId}/members`, data)
    return response.data
  },

  async updateMemberRole(
    companyId: string,
    memberUserId: string,
    data: UpdateMemberRoleRequestDTO,
  ): Promise<MemberResponseDTO> {
    const response = await api.put<MemberResponseDTO>(
      `/api/companies/${companyId}/members/${memberUserId}/role`,
      data,
    )
    return response.data
  },

  async removeMember(companyId: string, memberUserId: string): Promise<void> {
    await api.delete(`/api/companies/${companyId}/members/${memberUserId}`)
  },
}
