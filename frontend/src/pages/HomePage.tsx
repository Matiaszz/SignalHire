import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, HardDrive, KeyRound, Palette } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Button } from '../components/ui/Button'

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Monochromatic Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-100 px-3.5 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />
          SignalHire • Recrutamento & Seleção Inteligente
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            SignalHire
            <br />
            Recrutamento & Seleção Inteligente
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated && user ? (
            <Link to="/dashboard">
              <Button size="lg" className="group">
                Ir para Meu Perfil ({user.name.split(' ')[0]})
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button size="lg" className="group">
                  Criar Conta
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Entrar na Conta
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Grid - Monochromatic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left pt-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 mb-3">
              <KeyRound className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              JWT &amp; Rotação
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Token de acesso em memória e refresh token rotativo em cookie HttpOnly seguro.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 mb-3">
              <HardDrive className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              S3 &amp; LocalStack
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Upload de foto de perfil em bucket S3 integrado ao Docker Compose.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 mb-3">
              <Palette className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Tema Monocromático
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Design preto, branco e tons de cinza com alternância Light e Dark persistente.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 shadow-xs">
            <div className="h-8 w-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-neutral-100 mb-3">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Dados Essenciais
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Apenas os dados necessários: nome, e-mail, senha criptografada e foto de perfil.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
