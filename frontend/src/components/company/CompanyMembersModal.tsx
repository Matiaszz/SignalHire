import React, { useState } from 'react'
import { X, UserPlus, Shield, Trash2, Mail, Calendar } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { CompanyRole, MemberResponseDTO } from '../../types/company'
import { COMPANY_ROLE_LABELS } from '../../utils/companyFormatters'

interface CompanyMembersModalProps {
  isOpen: boolean
  companyId: string
  companyName: string
  members: MemberResponseDTO[]
  currentUserRole?: CompanyRole | null
  currentUserId?: string | null
  isLoading?: boolean
  onClose: () => void
  onAddMember: (email: string, role: CompanyRole) => Promise<void>
  onUpdateRole: (memberUserId: string, newRole: CompanyRole) => Promise<void>
  onRemoveMember: (memberUserId: string) => Promise<void>
}

export const CompanyMembersModal: React.FC<CompanyMembersModalProps> = ({
  isOpen,
  companyName,
  members,
  currentUserRole,
  currentUserId,
  onClose,
  onAddMember,
  onUpdateRole,
  onRemoveMember,
}) => {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<CompanyRole>('MEMBER')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const isOwner = currentUserRole === 'OWNER'
  const canManageMembers = isOwner || currentUserRole === 'ADMIN'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!inviteEmail.trim()) {
      setErrorMessage('Informe o e-mail do usuário.')
      return
    }

    try {
      setIsSubmitting(true)
      await onAddMember(inviteEmail.trim(), inviteRole)
      setSuccessMessage(`Membro ${inviteEmail} adicionado com sucesso!`)
      setInviteEmail('')
      setInviteRole('MEMBER')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message || 'Falha ao adicionar membro. Verifique o e-mail.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = async (memberUserId: string, newRole: CompanyRole) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await onUpdateRole(memberUserId, newRole)
      setSuccessMessage('Cargo do membro alterado com sucesso!')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message || 'Não foi possível alterar a função do membro.',
      )
    }
  }

  const handleRemove = async (memberUserId: string) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await onRemoveMember(memberUserId)
      setSuccessMessage('Membro removido da empresa.')
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message || 'Não foi possível remover este membro.',
      )
    }
  }

  const ownerCount = members.filter((m) => m.role === 'OWNER').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
              Equipe & Membros — {companyName}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Gerencie colaboradores, convites e níveis de acesso desta organização.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* Add Member Form (if authorized) */}
        {canManageMembers && (
          <form
            onSubmit={handleInvite}
            className="mt-4 p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-950/40"
          >
            <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-2 flex items-center gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              Adicionar Novo Membro
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isSubmitting}
                  icon={<Mail className="h-3.5 w-3.5" />}
                  required
                />
              </div>

              <div className="w-full sm:w-44">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as CompanyRole)}
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
                >
                  {isOwner && <option value="OWNER">{COMPANY_ROLE_LABELS.OWNER}</option>}
                  <option value="ADMIN">{COMPANY_ROLE_LABELS.ADMIN}</option>
                  <option value="RECRUITER">{COMPANY_ROLE_LABELS.RECRUITER}</option>
                  <option value="MEMBER">{COMPANY_ROLE_LABELS.MEMBER}</option>
                </select>
              </div>

              <Button type="submit" size="sm" isLoading={isSubmitting} className="whitespace-nowrap">
                Adicionar
              </Button>
            </div>
          </form>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-1">
          {members.map((member) => {
            const isSelf = member.userId === currentUserId
            const isMemberOwner = member.role === 'OWNER'
            const isLastOwner = isMemberOwner && ownerCount <= 1
            const canChangeThisMember =
              canManageMembers && (!isMemberOwner || isOwner) && !isLastOwner

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950/30"
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
                      {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                        {member.name}
                      </span>
                      {isSelf && (
                        <span className="rounded-sm bg-neutral-100 px-1.5 py-0.2 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          Você
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                      {member.email}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      Desde {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Right controls: Role changer / status & remove */}
                <div className="flex items-center gap-2">
                  {canChangeThisMember ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.userId, e.target.value as CompanyRole)
                      }
                      className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                    >
                      {isOwner && <option value="OWNER">{COMPANY_ROLE_LABELS.OWNER}</option>}
                      <option value="ADMIN">{COMPANY_ROLE_LABELS.ADMIN}</option>
                      <option value="RECRUITER">{COMPANY_ROLE_LABELS.RECRUITER}</option>
                      <option value="MEMBER">{COMPANY_ROLE_LABELS.MEMBER}</option>
                    </select>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {COMPANY_ROLE_LABELS[member.role] || member.role}
                    </span>
                  )}

                  {canManageMembers && !isLastOwner && (!isMemberOwner || isOwner) && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member.userId)}
                      title="Remover membro da empresa"
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  )
}
