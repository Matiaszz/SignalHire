import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../context/useTheme'

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white dark:bg-neutral-100 dark:text-neutral-950 font-bold tracking-tighter text-base shadow-xs group-hover:scale-105 transition-transform">
            SH
          </div>
          <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-neutral-100">
            SignalHire
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-lg py-1 px-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-colors"
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-xs hidden sm:inline-block max-w-[120px] truncate">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sair"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
