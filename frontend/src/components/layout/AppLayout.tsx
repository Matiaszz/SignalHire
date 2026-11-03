import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

const CURRENT_YEAR = new Date().getFullYear()

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t  border-neutral-200 py-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500 transition-colors">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SignalHire &copy; {CURRENT_YEAR}</span>
        </div>
      </footer>
    </div>
  )
}
