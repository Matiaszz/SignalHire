import React, { useEffect, useState } from 'react'
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  HardDrive,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Edit2,
  X,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { AvatarUploader } from '../components/auth/AvatarUploader'

export const DashboardPage: React.FC = () => {
  const { user, logout, updateProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [newAvatar, setNewAvatar] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }
  }, [user?.name])

  if (!user) {
    return (
      <div className="flex-1 py-16 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
          <span className="text-xs text-neutral-500 tracking-wider uppercase">Carregando dados do usuário...</span>
        </div>
      </div>
    )
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('O nome não pode ficar em branco.')
      return
    }

    try {
      setIsLoading(true)
      await updateProfile(name.trim(), newAvatar)
      setSuccessMessage('Perfil atualizado com sucesso!')
      setIsEditing(false)
      setNewAvatar(null)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setErrorMessage(
        axiosError.response?.data?.message || 'Falha ao atualizar perfil. Tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Data não informada'

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full">
      {/* Header Notification Banner */}
      {successMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-neutral-300 bg-neutral-100 p-4 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-neutral-300 bg-neutral-100 p-4 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-neutral-900 dark:text-neutral-100" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          {/* Avatar container */}
          <div className="relative group">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.name}
                className="h-24 w-24 rounded-full object-cover border-2 border-neutral-300 dark:border-neutral-700 shadow-xs"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 flex items-center justify-center text-3xl font-bold border-2 border-neutral-300 dark:border-neutral-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 p-1.5 shadow-xs"
              title="S3 LocalStack Storage"
            >
              <HardDrive className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* User Details Header */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {user.name}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{user.email}</p>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {isEditing ? 'Cancelar' : 'Editar Perfil'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => logout()}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                <Shield className="h-3 w-3" />
                Função: {user.role}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                <HardDrive className="h-3 w-3" />
                LocalStack S3
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                <Calendar className="h-3 w-3" />
                Desde {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form (Collapsible) */}
        {isEditing && (
          <form
            onSubmit={handleUpdate}
            className="mt-6 pt-2 space-y-5 rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-950/40"
          >
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Atualizar Informações
            </h3>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div>
                <AvatarUploader
                  currentUrl={user.profilePictureUrl}
                  onChange={setNewAvatar}
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1 w-full space-y-4">
                <Input
                  label="Nome Completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<UserIcon className="h-4 w-4" />}
                  required
                  disabled={isLoading}
                />
                <Input
                  label="E-mail (fixo)"
                  value={user.email}
                  icon={<Mail className="h-4 w-4" />}
                  disabled
                  helperText="O e-mail cadastrado não pode ser alterado."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" isLoading={isLoading}>
                Salvar Alterações
              </Button>
            </div>
          </form>
        )}

        {/* Informational Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
            <span className="block text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold mb-1">
              Segurança
            </span>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              JWT + Refresh Token
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Rotação automática e cookie HttpOnly seguro.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
            <span className="block text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold mb-1">
              Armazenamento S3
            </span>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {user.profilePictureUrl ? 'Foto Sincronizada' : 'Sem foto enviada'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              LocalStack S3 Bucket: <code className="font-mono text-[11px]">signalhire-avatars</code>
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50">
            <span className="block text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold mb-1">
              Identificador (ObjectId)
            </span>
            <p className="font-mono text-xs text-neutral-700 dark:text-neutral-300 truncate">
              {typeof user.id === 'object' && user.id !== null
                ? (user.id as { date?: string }).date || JSON.stringify(user.id)
                : String(user.id || '')}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Chave primária do usuário.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
