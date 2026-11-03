export type CompanyRole = 'OWNER' | 'ADMIN' | 'RECRUITER' | 'MEMBER'

export type CompanySize = 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'BIG_TECH'

export type WorkEnvironment = 'REMOTE' | 'HYBRID' | 'ONSITE'

export type CommunicationStyle = 'FORMAL' | 'INFORMAL'

export type ManagementStyle = 'HIERARCHICAL' | 'COLLABORATIVE'

export type InnovationLevel = 'CONSERVATIVE' | 'MODERATE' | 'INNOVATIVE'

export type SiteType = 'GITHUB' | 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'OWN' | 'OTHER'

export interface SiteDTO {
  type: SiteType
  url: string
}

export interface CompanyProfileDTO {
  mission?: string
  vision?: string
  values?: string[]
  cultureDescription?: string
  workEnvironments?: WorkEnvironment[]
  communicationStyle?: CommunicationStyle
  managementStyle?: ManagementStyle
  innovationLevel?: InnovationLevel
  benefits?: string[]
}

export interface MemberResponseDTO {
  userId: string
  name: string
  email: string
  profilePictureUrl?: string | null
  role: CompanyRole
  joinedAt: string
}

export interface CompanyResponseDTO {
  id: string
  name: string
  legalName?: string | null
  description?: string | null
  logoUrl?: string | null
  size?: CompanySize | null
  profile?: CompanyProfileDTO | null
  sites: SiteDTO[]
  members: MemberResponseDTO[]
  createdAt: string
  updatedAt?: string | null
}

export interface CompanySummaryResponseDTO {
  id: string
  name: string
  description?: string | null
  logoUrl?: string | null
  size?: CompanySize | null
  currentUserRole?: CompanyRole | null
  membersCount: number
  createdAt: string
}

export interface CreateCompanyRequestDTO {
  name: string
  legalName?: string
  description?: string
  logoUrl?: string
  size?: CompanySize
  profile?: CompanyProfileDTO
  sites?: SiteDTO[]
}

export interface UpdateCompanyRequestDTO {
  name: string
  legalName?: string
  description?: string
  logoUrl?: string
  size?: CompanySize
  profile?: CompanyProfileDTO
  sites?: SiteDTO[]
}

export interface AddMemberRequestDTO {
  email: string
  role: CompanyRole
}

export interface UpdateMemberRoleRequestDTO {
  role: CompanyRole
}
