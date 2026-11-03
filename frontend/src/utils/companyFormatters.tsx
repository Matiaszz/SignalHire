import React from 'react'
import { Globe, Link as LinkIcon } from 'lucide-react'
import type {
  CompanyRole,
  CompanySize,
  WorkEnvironment,
  CommunicationStyle,
  ManagementStyle,
  InnovationLevel,
  SiteType,
} from '../types/company'

// ==========================================
// SVGs para Canais & Presença Digital
// ==========================================

export const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
)

export const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
)

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

// ==========================================
// Metadados dos Canais
// ==========================================

export interface SiteTypeOption {
  value: SiteType
  label: string
  placeholder: string
  icon: (className?: string) => React.ReactNode
  badgeBg: string
  textColor: string
}

export const SITE_TYPE_CONFIG: Record<SiteType, SiteTypeOption> = {
  OWN: {
    value: 'OWN',
    label: 'Website Oficial',
    placeholder: 'https://suaempresa.com.br',
    icon: (cls = 'h-4 w-4 text-emerald-600 dark:text-emerald-400') => <Globe className={cls} />,
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  LINKEDIN: {
    value: 'LINKEDIN',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/suaempresa',
    icon: (cls = 'h-4 w-4 text-[#0A66C2]') => <LinkedinIcon className={cls} />,
    badgeBg: 'bg-blue-50 text-[#0A66C2] dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    textColor: 'text-[#0A66C2]',
  },
  GITHUB: {
    value: 'GITHUB',
    label: 'GitHub',
    placeholder: 'https://github.com/sua-organizacao',
    icon: (cls = 'h-4 w-4 text-neutral-800 dark:text-neutral-200') => <GithubIcon className={cls} />,
    badgeBg: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700',
    textColor: 'text-neutral-800 dark:text-neutral-200',
  },
  INSTAGRAM: {
    value: 'INSTAGRAM',
    label: 'Instagram',
    placeholder: 'https://instagram.com/suaempresa',
    icon: (cls = 'h-4 w-4 text-[#E1306C]') => <InstagramIcon className={cls} />,
    badgeBg: 'bg-pink-50 text-[#E1306C] dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    textColor: 'text-[#E1306C]',
  },
  FACEBOOK: {
    value: 'FACEBOOK',
    label: 'Facebook',
    placeholder: 'https://facebook.com/suaempresa',
    icon: (cls = 'h-4 w-4 text-[#1877F2]') => <FacebookIcon className={cls} />,
    badgeBg: 'bg-indigo-50 text-[#1877F2] dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    textColor: 'text-[#1877F2]',
  },
  OTHER: {
    value: 'OTHER',
    label: 'Outro Canal',
    placeholder: 'https://linktr.ee/suaempresa',
    icon: (cls = 'h-4 w-4 text-purple-600 dark:text-purple-400') => <LinkIcon className={cls} />,
    badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
}

// ==========================================
// Validação de URL
// ==========================================

export const isValidUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

// ==========================================
// Labels Amigáveis para Enums
// ==========================================

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  STARTUP: 'Startup (1-10 colaboradores)',
  SMALL: 'Pequena Empresa (11-50 colaboradores)',
  MEDIUM: 'Média Empresa (51-200 colaboradores)',
  LARGE: 'Grande Empresa (201-1000 colaboradores)',
  BIG_TECH: 'Big Tech (+1000 colaboradores)',
}

export const COMPANY_ROLE_LABELS: Record<CompanyRole, string> = {
  OWNER: 'Proprietário',
  ADMIN: 'Administrador',
  RECRUITER: 'Recrutador',
  MEMBER: 'Membro',
}

export const WORK_ENVIRONMENT_LABELS: Record<WorkEnvironment, string> = {
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
  ONSITE: 'Presencial',
}

export const COMMUNICATION_STYLE_LABELS: Record<CommunicationStyle, string> = {
  INFORMAL: 'Informal & Direta',
  FORMAL: 'Formal & Estruturada',
}

export const MANAGEMENT_STYLE_LABELS: Record<ManagementStyle, string> = {
  COLLABORATIVE: 'Colaborativa & Autônoma',
  HIERARCHICAL: 'Hierárquica & Definida',
}

export const INNOVATION_LEVEL_LABELS: Record<InnovationLevel, string> = {
  INNOVATIVE: 'Inovadora & Disruptiva',
  MODERATE: 'Moderada & Estratégica',
  CONSERVATIVE: 'Conservadora & Consolidada',
}

// Formatadores seguros com fallback
export const formatCompanySize = (size?: CompanySize | null): string => {
  if (!size) return 'Não especificado'
  return COMPANY_SIZE_LABELS[size] || size
}

export const formatCompanyRole = (role?: CompanyRole | null): string => {
  if (!role) return 'Membro'
  return COMPANY_ROLE_LABELS[role] || role
}

export const formatWorkEnvironment = (env?: WorkEnvironment | null): string => {
  if (!env) return ''
  return WORK_ENVIRONMENT_LABELS[env] || env
}

export const formatCommunicationStyle = (style?: CommunicationStyle | null): string => {
  if (!style) return 'Não informada'
  return COMMUNICATION_STYLE_LABELS[style] || style
}

export const formatManagementStyle = (style?: ManagementStyle | null): string => {
  if (!style) return 'Não informada'
  return MANAGEMENT_STYLE_LABELS[style] || style
}

export const formatInnovationLevel = (level?: InnovationLevel | null): string => {
  if (!level) return 'Não informada'
  return INNOVATION_LEVEL_LABELS[level] || level
}
