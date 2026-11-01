import React, { forwardRef, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, rightElement, className = '', id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || props.name || generatedId

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-neutral-700 dark:text-neutral-300 tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-colors
              focus:outline-none focus:ring-1 
              disabled:opacity-50 disabled:bg-neutral-50 disabled:cursor-not-allowed
              dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500
              ${icon ? 'pl-10' : ''}
              ${rightElement ? 'pr-10' : ''}
              ${
                error
                  ? 'border-neutral-900 focus:border-neutral-900 focus:ring-neutral-900 dark:border-neutral-100 dark:focus:border-neutral-100 dark:focus:ring-neutral-100'
                  : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900 dark:border-neutral-800 dark:focus:border-neutral-100 dark:focus:ring-neutral-100'
              }
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-neutral-400 dark:text-neutral-500">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-neutral-900 dark:text-neutral-200 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{helperText}</p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
