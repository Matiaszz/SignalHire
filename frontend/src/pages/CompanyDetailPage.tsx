import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Building2,
  ArrowLeft,
  Users,
  Compass,
  Globe,
  ExternalLink,
  Shield,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  UserPlus,
  HeartHandshake,
} from 'lucide-react'
import { companyService } from '../services/companyService'
import { useAuth } from '../context/useAuth'
import { Button } from '../components/ui/Button'
import { CompanyFormModal } from '../components/company/CompanyFormModal'
import { CompanyMembersModal } from '../components/company/CompanyMembersModal'
import { ConfirmModal } from '../components/company/ConfirmModal'
import type {
  CompanyResponseDTO,
  CompanyRole,
  CreateCompanyRequestDTO,
} from '../types/company'
import {
  SITE_TYPE_CONFIG,
  formatCompanySize,
  formatWorkEnvironment,
  formatCommunicationStyle,
  formatManagementStyle,
  formatInnovationLevel,
} from '../utils/companyFormatters'

const roleBadges: Record<CompanyRole, { label: string; className: string }> = {
  OWNER: {
    label: 'Proprietário',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  },
  ADMIN: {
    label: 'Administrador',
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
  },
  RECRUITER: {
    label: 'Recrutador',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  },
  MEMBER: {
    label: 'Membro',
    className:
      'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700',
  },
}

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [company, setCompany] = useState<CompanyResponseDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'culture' | 'sites' | 'members'>('overview')

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCompany = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await companyService.getCompanyById(id)
      setCompany(data)
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 404) {
        setErrorMessage(axiosError.response?.data?.message || 'Empresa não encontrada.')
      } else {
        setErrorMessage(
          axiosError.response?.data?.message || 'Falha ao buscar os detalhes da empresa.',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCompany()
  }, [loadCompany])

  if (isLoading) {
    return (
      <div className="flex-1 py-20 flex flex-col items-center justify-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
        <span className="text-xs text-neutral-500 uppercase tracking-wider">Carregando detalhes...</span>
      </div>
    )
  }

  if (errorMessage || !company) {
    return (
      <div className="flex-1 py-16 px-4 max-w-xl mx-auto text-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-7 w-7" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Status 404
          </span>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
            {errorMessage || 'Empresa não encontrada'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-6 max-w-md mx-auto">
            A organização solicitada não existe ou o seu usuário não possui vínculo de participação com ela.
          </p>
          <Button size="sm" onClick={() => navigate('/companies')}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para Minhas Empresas
          </Button>
        </div>
      </div>
    )
  }

  const currentMember = company.members.find((m) => m.userId === String(user?.id))
  const isOwner = currentMember?.role === 'OWNER'
  const canManage = isOwner || currentMember?.role === 'ADMIN'

  const handleUpdateSubmit = async (data: CreateCompanyRequestDTO) => {
    if (!company) return
    try {
      setIsSavingEdit(true)
      await companyService.updateCompany(company.id, data)
      setIsEditModalOpen(false)
      await loadCompany()
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!company) return
    try {
      setIsDeleting(true)
      await companyService.deleteCompany(company.id)
      navigate('/companies')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddMember = async (email: string, role: CompanyRole) => {
    if (!company) return
    await companyService.addMember(company.id, { email, role })
    await loadCompany()
  }

  const handleUpdateRole = async (memberUserId: string, role: CompanyRole) => {
    if (!company) return
    await companyService.updateMemberRole(company.id, memberUserId, { role })
    await loadCompany()
  }

  const handleRemoveMember = async (memberUserId: string) => {
    if (!company) return
    await companyService.removeMember(company.id, memberUserId)
    await loadCompany()
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Empresas
        </Link>
      </div>

      {/* Header Profile Hero */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-neutral-200 dark:border-neutral-700 shadow-xs"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-3xl font-bold text-neutral-800 dark:text-neutral-200 shadow-xs">
                {company.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {company.name}
                </h1>
                {currentMember && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                      roleBadges[currentMember.role].className
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    Seu papel: {roleBadges[currentMember.role].label}
                  </span>
                )}
              </div>

              {company.legalName && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Razão Social: {company.legalName}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                {company.size && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
                    <Building2 className="h-3 w-3" />
                    Porte: {formatCompanySize(company.size)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
                  <Users className="h-3 w-3" />
                  {company.members.length} {company.members.length === 1 ? 'membro' : 'membros'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
                  <Calendar className="h-3 w-3" />
                  Criada em {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMembersModalOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Membros ({company.members.length})
            </Button>

            {canManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Editar Dados
              </Button>
            )}

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mt-8 flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('culture')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'culture'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Perfil & Cultura
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sites'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Sites & Links ({company.sites.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Equipe ({company.members.length})
          </button>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Sobre a Empresa
                </h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {company.description || 'Nenhuma descrição detalhada informada.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase">Porte</span>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {formatCompanySize(company.size)}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase">Colaboradores</span>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {company.members.length} vinculados
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase">Canais Cadastrados</span>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                    {company.sites.length} links
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'culture' && (
            <div className="space-y-6">
              {company.profile ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                        <Compass className="h-3 w-3" />
                        Missão
                      </span>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                        {company.profile.mission || 'Não informada.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                        <Compass className="h-3 w-3" />
                        Visão
                      </span>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                        {company.profile.vision || 'Não informada.'}
                      </p>
                    </div>
                  </div>

                  {/* Work environments */}
                  {company.profile.workEnvironments && company.profile.workEnvironments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Ambientes de Trabalho
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {company.profile.workEnvironments.map((env) => (
                          <span
                            key={env}
                            className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200"
                          >
                            {formatWorkEnvironment(env)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Values */}
                  {company.profile.values && company.profile.values.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Valores Organizacionais
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {company.profile.values.map((val, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                          >
                            <HeartHandshake className="h-3 w-3 text-blue-500" />
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {company.profile.benefits && company.profile.benefits.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                        Benefícios Oferecidos
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {company.profile.benefits.map((ben, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            {ben}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Styles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40 text-xs">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Comunicação</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm mt-0.5 block">
                        {formatCommunicationStyle(company.profile.communicationStyle)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40 text-xs">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Gestão</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm mt-0.5 block">
                        {formatManagementStyle(company.profile.managementStyle)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950/40 text-xs">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold">Inovação</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm mt-0.5 block">
                        {formatInnovationLevel(company.profile.innovationLevel)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-neutral-500">Nenhum perfil de cultura preenchido.</p>
              )}
            </div>
          )}

          {activeTab === 'sites' && (
            <div>
              {company.sites.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                  <Globe className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">Nenhum canal ou site cadastrado para esta empresa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {company.sites.map((site, idx) => {
                    const cfg = SITE_TYPE_CONFIG[site.type] || SITE_TYPE_CONFIG.OTHER
                    return (
                      <a
                        key={idx}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xs transition-all dark:border-neutral-800 dark:bg-neutral-950/30 dark:hover:border-neutral-700 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border flex items-center justify-center ${cfg.badgeBg} shrink-0`}>
                            {cfg.icon('h-4 w-4')}
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {cfg.label}
                            </span>
                            <span className="text-[11px] text-neutral-500 line-clamp-1 max-w-[240px]">
                              {site.url}
                            </span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors" />
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Lista de colaboradores e administradores desta organização.
                </span>
                <Button size="sm" onClick={() => setIsMembersModalOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5" />
                  Gerenciar Membros
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {company.members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40"
                  >
                    <div className="flex items-center gap-3">
                      {member.profilePictureUrl ? (
                        <img
                          src={member.profilePictureUrl}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 flex items-center justify-center text-sm font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {member.name}
                        </h4>
                        <span className="text-[11px] text-neutral-500 block">{member.email}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                        roleBadges[member.role].className
                      }`}
                    >
                      {roleBadges[member.role].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Modal */}
      <CompanyFormModal
        isOpen={isEditModalOpen}
        initialData={company}
        isLoading={isSavingEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateSubmit}
      />

      {/* Members Modal */}
      <CompanyMembersModal
        isOpen={isMembersModalOpen}
        companyId={company.id}
        companyName={company.name}
        members={company.members}
        currentUserRole={currentMember?.role}
        currentUserId={String(user?.id)}
        onClose={() => setIsMembersModalOpen(false)}
        onAddMember={handleAddMember}
        onUpdateRole={handleUpdateRole}
        onRemoveMember={handleRemoveMember}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Excluir Empresa"
        description={`Tem certeza que deseja excluir a empresa "${company.name}"? Esta ação removerá a organização e todos os acessos associados permanentemente.`}
        confirmText="Excluir Definitivamente"
        isDestructive
        isLoading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSubmit}
      />
    </div>
  )
}
