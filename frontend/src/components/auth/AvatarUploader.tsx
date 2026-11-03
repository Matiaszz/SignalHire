import React, { useRef, useState } from 'react'
import { Camera, UploadCloud, X, User as UserIcon } from 'lucide-react'

interface AvatarUploaderProps {
  currentUrl?: string | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentUrl,
  onChange,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | null) => {
    setError(null)
    if (!file) {
      setPreviewUrl(currentUrl || null)
      onChange(null)
      return
    }

    // Validation
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use JPEG, PNG, WEBP ou GIF.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('A foto de perfil deve ter menos de 10MB.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeAvatar = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange(null)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] || null
          handleFile(file)
        }}
      />

      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`group relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border-2 transition-all overflow-hidden
          ${
            isDragging
              ? 'border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800 scale-105'
              : 'border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-100/50 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:border-neutral-400 dark:bg-neutral-900/50 dark:hover:bg-neutral-900'
          }
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Profile preview"
              className="h-full w-full object-cover rounded-full"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <UserIcon className="h-8 w-8 text-neutral-400 dark:text-neutral-500 mb-1" />
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <UploadCloud className="h-3 w-3" /> Enviar foto
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors cursor-pointer"
        >
          {previewUrl ? 'Alterar foto' : 'Enviar foto de perfil'}
        </button>

        {previewUrl && !disabled && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700 text-xs">•</span>
            <button
              type="button"
              onClick={removeAvatar}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" /> Remover
            </button>
          </>
        )}
      </div>

      {error && <p className="text-xs text-neutral-900 dark:text-neutral-200 font-medium">{error}</p>}
    </div>
  )
}
