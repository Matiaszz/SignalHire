import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, Shield, ArrowRight, Trash2, Edit3 } from 'lucide-react'
import type { CompanyRole, CompanySummaryResponseDTO } from '../../types/company'
import { COMPANY_ROLE_LABELS, formatCompanySize } from '../../utils/companyFormatters'

interface CompanyCardProps {
  company: CompanySummaryResponseDTO
  onEdit?: (company: CompanySummaryResponseDTO) => void
  onDelete?: (company: CompanySummaryResponseDTO) => void
}

const roleBadges: Record<CompanyRole, string> = {
  OWNER:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  ADMIN:
    'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  RECRUITER:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  MEMBER:
    'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, onEdit, onDelete }) => {
  const isOwner = company.currentUserRole === 'OWNER'
  const canManage = isOwner || company.currentUserRole === 'ADMIN'
  const roleLabel = company.currentUserRole ? COMPANY_ROLE_LABELS[company.currentUserRole] : null
  const roleBadgeClass = company.currentUserRole ? roleBadges[company.currentUserRole] : ''

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:shadow-md hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <div>
        {/* Top bar: Logo, Badges & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-12 w-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-lg font-bold text-neutral-800 dark:text-neutral-200">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Link to={`/companies/${company.id}`}>{company.name}</Link>
              </h3>
              {company.size && (
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {formatCompanySize(company.size)}
                </span>
              )}
            </div>
          </div>

          {/* Role badge */}
          {roleLabel && (
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${roleBadgeClass}`}
            >
              <Shield className="h-2.5 w-2.5" />
              {roleLabel}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 min-h-[32px]">
          {company.description || 'Nenhuma descrição informada para esta empresa.'}
        </p>
      </div>

      {/* Footer / Meta & CTA */}
      <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          <Users className="h-3.5 w-3.5" />
          <span>
            {company.membersCount} {company.membersCount === 1 ? 'membro' : 'membros'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {canManage && onEdit && (
            <button
              onClick={() => onEdit(company)}
              title="Editar empresa"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          )}

          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(company)}
              title="Excluir empresa"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <Link
            to={`/companies/${company.id}`}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            Acessar
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
