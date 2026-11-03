import React, { useRef, useState } from 'react'
import { UploadCloud, CheckCircle2, AlertCircle, X, RefreshCw, Link as LinkIcon, FileImage } from 'lucide-react'
import { fileUploadService } from '../../services/fileUploadService'

interface LogoUploaderProps {
  currentUrl?: string | null
  companyId?: string
  onChange: (fileUrl: string) => void
  disabled?: boolean
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentUrl,
  companyId,
  onChange,
  disabled = false,
}) => {
  const [logoUrl, setLogoUrl] = useState<string>(currentUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [useManualUrl, setUseManualUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File | null) => {
    setErrorMessage(null)
    if (!file) return

    // Validations
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Formato de arquivo inválido. Formatos suportados: PNG, JPG, WEBP, GIF ou SVG.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('O arquivo selecionado deve ter no máximo 10MB.')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const uploadedUrl = await fileUploadService.uploadFile(
        file,
        'company',
        companyId,
        (progress) => setUploadProgress(progress),
      )

      setLogoUrl(uploadedUrl)
      onChange(uploadedUrl)
    } catch {
      setErrorMessage('Não foi possível carregar o arquivo. Verifique a imagem e tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLogoUrl('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <FileImage className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
          Logotipo da Empresa
        </label>
        <button
          type="button"
          onClick={() => setUseManualUrl(!useManualUrl)}
          className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="h-3 w-3" />
          {useManualUrl ? 'Enviar arquivo do computador' : 'Inserir link externo'}
        </button>
      </div>

      {useManualUrl ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://exemplo.com/logo.png"
            value={logoUrl}
            onChange={(e) => {
              setLogoUrl(e.target.value)
              onChange(e.target.value)
            }}
            disabled={disabled}
            className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
          />
        </div>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            disabled={disabled || isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              handleFileSelect(file)
            }}
          />

          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              if (!disabled && !isUploading) setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setIsDragging(false)
            }}
            className={`group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              isDragging
                ? 'border-neutral-900 bg-neutral-100 dark:border-neutral-100 dark:bg-neutral-800 scale-[1.01]'
                : 'border-neutral-300 hover:border-neutral-900 bg-neutral-50/70 hover:bg-neutral-100/60 dark:border-neutral-700 dark:hover:border-neutral-400 dark:bg-neutral-950/40 dark:hover:bg-neutral-900/60'
            } ${disabled || isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <div className="w-full py-2 flex flex-col items-center gap-2">
                <RefreshCw className="h-6 w-6 text-neutral-800 dark:text-neutral-200 animate-spin" />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Enviando imagem... {uploadProgress}%
                </span>
                <div className="w-48 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : logoUrl ? (
              <div className="flex items-center gap-4 w-full">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-16 w-16 rounded-2xl object-cover border border-neutral-300 dark:border-neutral-700 shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Logotipo carregado com sucesso</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Imagem pronta para ser vinculada à empresa.
                  </p>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Remover logotipo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-center py-2">
                <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  Clique ou arraste uma imagem do seu computador
                </p>
                <p className="text-[10px] text-neutral-400">
                  Formatos suportados: PNG, JPG, WEBP, GIF ou SVG (até 10MB)
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
