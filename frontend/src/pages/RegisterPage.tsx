import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { AvatarUploader } from '../components/auth/AvatarUploader'

export const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Por favor, informe seu nome.')
      return
    }

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.')
      return
    }

    try {
      setIsLoading(true)
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        profilePicture,
      })
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      const msg =
        axiosError.response?.data?.message || 'Falha ao registrar conta. Tente novamente.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 transition-all">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-lg shadow-xs">
            SH
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Criar sua conta
          </h1>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Preencha seus dados para começar no SignalHire
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-neutral-300 bg-neutral-100 p-3 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-neutral-700 dark:text-neutral-300" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-2">
            <AvatarUploader
              onChange={setProfilePicture}
              disabled={isLoading}
            />
          </div>

          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<UserIcon className="h-4 w-4" />}
            autoComplete="name"
            required
            disabled={isLoading}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            required
            disabled={isLoading}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <Input
            label="Confirmar Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repita sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            required
            disabled={isLoading}
          />

          <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="md">
            Cadastrar
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Já possui cadastro?{' '}
          <Link
            to="/login"
            className="font-medium text-neutral-900 hover:underline dark:text-neutral-100"
          >
            Faça login
          </Link>
        </div>
      </div>
    </div>
  )
}
