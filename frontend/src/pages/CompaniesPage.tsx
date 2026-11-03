import React, { useEffect, useState } from 'react'
import { Plus, Search, Building2, RefreshCw, AlertCircle } from 'lucide-react'
import { companyService } from '../services/companyService'
import { CompanyCard } from '../components/company/CompanyCard'
import { CompanyFormModal } from '../components/company/CompanyFormModal'
import { ConfirmModal } from '../components/company/ConfirmModal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import type {
  CompanyResponseDTO,
  CompanySummaryResponseDTO,
  CreateCompanyRequestDTO,
} from '../types/company'

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanySummaryResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<CompanyResponseDTO | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [deletingCompany, setDeletingCompany] = useState<CompanySummaryResponseDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCompanies = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)
      const data = await companyService.getMyCompanies()
      setCompanies(data)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message ||
          'Falha ao carregar suas empresas. Tente recarregar a página.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const handleOpenCreate = () => {
    setEditingCompany(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = async (companySummary: CompanySummaryResponseDTO) => {
    try {
      setIsSaving(true)
      const fullCompany = await companyService.getCompanyById(companySummary.id)
      setEditingCompany(fullCompany)
      setIsFormModalOpen(true)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message || 'Não foi possível carregar os dados para edição.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleFormSubmit = async (data: CreateCompanyRequestDTO) => {
    try {
      setIsSaving(true)
      if (editingCompany) {
        await companyService.updateCompany(editingCompany.id, data)
      } else {
        await companyService.createCompany(data)
      }
      setIsFormModalOpen(false)
      setEditingCompany(null)
      await loadCompanies()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCompany) return
    try {
      setIsDeleting(true)
      await companyService.deleteCompany(deletingCompany.id)
      setDeletingCompany(null)
      await loadCompanies()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message || 'Falha ao excluir a empresa.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-neutral-800 dark:text-neutral-200" />
            Minhas Empresas
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Gerencie suas organizações, cultura corporativa e colaboradores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCompanies} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-3.5 w-3.5" />
            Nova Empresa
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter and stats bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="h-3.5 w-3.5" />}
          />
        </div>

        <span className="text-xs text-neutral-500 dark:text-neutral-400 self-start sm:self-auto">
          Total: <strong className="text-neutral-900 dark:text-neutral-100">{companies.length}</strong> {companies.length === 1 ? 'empresa vinculada' : 'empresas vinculadas'}
        </span>
      </div>

      {/* Content Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
            <span className="text-xs text-neutral-500 tracking-wider uppercase">Carregando empresas...</span>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-8">
            <Building2 className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {search ? 'Nenhuma empresa encontrada para o filtro' : 'Você ainda não possui empresas cadastradas'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-5">
              {search
                ? 'Tente pesquisar por outros termos ou limpe o campo de busca.'
                : 'Cadastre sua primeira empresa para publicar vagas, gerenciar membros e configurar o perfil cultural.'}
            </p>
            {!search && (
              <Button size="sm" onClick={handleOpenCreate}>
                <Plus className="h-3.5 w-3.5" />
                Criar Empresa Agora
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onEdit={() => handleOpenEdit(company)}
                onDelete={() => setDeletingCompany(company)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <CompanyFormModal
        isOpen={isFormModalOpen}
        initialData={editingCompany}
        isLoading={isSaving}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingCompany(null)
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCompany)}
        title="Excluir Empresa"
        description={`Tem certeza que deseja excluir a empresa "${deletingCompany?.name}"? Esta ação removerá a organização e todos os acessos associados.`}
        confirmText="Excluir Empresa"
        isDestructive
        isLoading={isDeleting}
        onClose={() => setDeletingCompany(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
