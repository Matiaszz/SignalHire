import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Globe,
  Building2,
  Compass,
  Sparkles,
  Check,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Users,
  Briefcase,
  Laptop,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { LogoUploader } from './LogoUploader'
import type {
  CompanyProfileDTO,
  CompanyResponseDTO,
  CompanySize,
  CreateCompanyRequestDTO,
  SiteDTO,
  SiteType,
  WorkEnvironment,
  CommunicationStyle,
  ManagementStyle,
  InnovationLevel,
} from '../../types/company'
import {
  SITE_TYPE_CONFIG,
  isValidUrl,
  formatCompanySize,
  formatWorkEnvironment,
  formatCommunicationStyle,
  formatManagementStyle,
  formatInnovationLevel,
} from '../../utils/companyFormatters'

interface CompanyFormModalProps {
  isOpen: boolean
  initialData?: CompanyResponseDTO | null
  isLoading?: boolean
  onClose: () => void
  onSubmit: (data: CreateCompanyRequestDTO) => Promise<void>
}

interface StepConfig {
  id: number
  title: string
  subtitle: string
}

const STEPS: StepConfig[] = [
  { id: 1, title: 'Identidade', subtitle: 'Nome e porte' },
  { id: 2, title: 'Cultura', subtitle: 'Valores e estilo' },
  { id: 3, title: 'Canais', subtitle: 'Links e redes' },
  { id: 4, title: 'Revisão', subtitle: 'Confirmar dados' },
]

const COMPANY_SIZES: { value: CompanySize; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    value: 'STARTUP',
    label: 'Startup',
    desc: '1 a 10 colaboradores',
    icon: <Rocket className="h-4 w-4" />,
  },
  {
    value: 'SMALL',
    label: 'Pequena',
    desc: '11 a 50 colaboradores',
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    desc: '51 a 200 colaboradores',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    value: 'LARGE',
    label: 'Grande',
    desc: '201 a 1000 colaboradores',
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    value: 'BIG_TECH',
    label: 'Big Tech',
    desc: 'Mais de 1000 colaboradores',
    icon: <Laptop className="h-4 w-4" />,
  },
]

const SUGGESTED_VALUES = [
  'Transparência',
  'Inovação Contínua',
  'Foco no Cliente',
  'Diversidade',
  'Autonomia',
  'Excelência Técnica',
  'Colaboração',
  'Agilidade',
]

const SUGGESTED_BENEFITS = [
  'Plano de Saúde',
  'Vale Refeição / Alimentação',
  'Auxílio Home Office',
  'Gympass / TotalPass',
  'Horário Flexível',
  'Bônus / PLR',
  'Auxílio Educação',
  'Seguro de Vida',
]



export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  initialData,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1: Identidade
  const [name, setName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [description, setDescription] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [size, setSize] = useState<CompanySize>('STARTUP')

  // Step 2: Cultura
  const [mission, setMission] = useState('')
  const [vision, setVision] = useState('')
  const [cultureDescription, setCultureDescription] = useState('')
  const [values, setValues] = useState<string[]>([])
  const [valInput, setValInput] = useState('')
  const [benefits, setBenefits] = useState<string[]>([])
  const [benefitInput, setBenefitInput] = useState('')
  const [workEnvironments, setWorkEnvironments] = useState<WorkEnvironment[]>(['REMOTE'])
  const [communicationStyle, setCommunicationStyle] = useState<CommunicationStyle | ''>('INFORMAL')
  const [managementStyle, setManagementStyle] = useState<ManagementStyle | ''>('COLLABORATIVE')
  const [innovationLevel, setInnovationLevel] = useState<InnovationLevel | ''>('INNOVATIVE')

  // Step 3: Canais
  const [sites, setSites] = useState<SiteDTO[]>([])

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setLegalName(initialData.legalName || '')
      setDescription(initialData.description || '')
      setLogoUrl(initialData.logoUrl || '')
      setSize(initialData.size || 'STARTUP')

      const prof = initialData.profile
      setMission(prof?.mission || '')
      setVision(prof?.vision || '')
      setCultureDescription(prof?.cultureDescription || '')
      setValues(prof?.values ? [...prof.values] : [])
      setBenefits(prof?.benefits ? [...prof.benefits] : [])
      setWorkEnvironments(prof?.workEnvironments?.length ? [...prof.workEnvironments] : ['REMOTE'])
      setCommunicationStyle(prof?.communicationStyle || 'INFORMAL')
      setManagementStyle(prof?.managementStyle || 'COLLABORATIVE')
      setInnovationLevel(prof?.innovationLevel || 'INNOVATIVE')

      setSites(initialData.sites ? initialData.sites.map((s) => ({ ...s })) : [])
    } else {
      setName('')
      setLegalName('')
      setDescription('')
      setLogoUrl('')
      setSize('STARTUP')
      setMission('')
      setVision('')
      setCultureDescription('')
      setValues(['Transparência', 'Inovação Contínua', 'Foco no Cliente'])
      setBenefits(['Plano de Saúde', 'Vale Refeição / Alimentação', 'Horário Flexível'])
      setWorkEnvironments(['REMOTE', 'HYBRID'])
      setCommunicationStyle('INFORMAL')
      setManagementStyle('COLLABORATIVE')
      setInnovationLevel('INNOVATIVE')
      setSites([])
    }
    setCurrentStep(1)
    setFormError(null)
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleNextStep = () => {
    setFormError(null)
    if (currentStep === 1) {
      if (!name.trim()) {
        setFormError('Por favor, informe o nome da empresa para avançar.')
        return
      }
    }
    if (currentStep === 3) {
      // Validação de links no Passo 3
      const emptySite = sites.find((s) => !s.url.trim())
      if (emptySite) {
        setFormError('Preencha a URL de todos os canais adicionados ou remova os canais não utilizados.')
        return
      }
      const invalidSite = sites.find((s) => !isValidUrl(s.url))
      if (invalidSite) {
        setFormError('Um ou mais links digitados não são válidos. Certifique-se de que comecem com https:// ou http://.')
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handlePrevStep = () => {
    setFormError(null)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  // Values and benefits helpers
  const handleAddValue = (val: string) => {
    const clean = val.trim()
    if (clean && !values.includes(clean)) {
      setValues([...values, clean])
      setValInput('')
    }
  }

  const handleRemoveValue = (idx: number) => {
    setValues(values.filter((_, i) => i !== idx))
  }

  const handleAddBenefit = (ben: string) => {
    const clean = ben.trim()
    if (clean && !benefits.includes(clean)) {
      setBenefits([...benefits, clean])
      setBenefitInput('')
    }
  }

  const handleRemoveBenefit = (idx: number) => {
    setBenefits(benefits.filter((_, i) => i !== idx))
  }

  const toggleWorkEnv = (env: WorkEnvironment) => {
    if (workEnvironments.includes(env)) {
      if (workEnvironments.length > 1) {
        setWorkEnvironments(workEnvironments.filter((e) => e !== env))
      }
    } else {
      setWorkEnvironments([...workEnvironments, env])
    }
  }

  // Sites helpers
  const handleAddSite = (type: SiteType = 'OWN') => {
    setSites([...sites, { type, url: '' }])
  }

  const handleUpdateSite = (idx: number, field: 'type' | 'url', val: string) => {
    const updated = [...sites]
    if (field === 'type') {
      updated[idx].type = val as SiteType
    } else {
      updated[idx].url = val
    }
    setSites(updated)
  }

  const handleRemoveSite = (idx: number) => {
    setSites(sites.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('O nome da empresa é obrigatório.')
      setCurrentStep(1)
      return
    }

    const invalidSite = sites.find((s) => s.url.trim() && !isValidUrl(s.url))
    if (invalidSite) {
      setFormError('Por favor, corrija os links inválidos antes de salvar.')
      setCurrentStep(3)
      return
    }

    const profile: CompanyProfileDTO = {
      mission: mission.trim() || undefined,
      vision: vision.trim() || undefined,
      cultureDescription: cultureDescription.trim() || undefined,
      values: values.length > 0 ? values : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      workEnvironments: workEnvironments.length > 0 ? workEnvironments : undefined,
      communicationStyle: (communicationStyle || undefined) as CommunicationStyle | undefined,
      managementStyle: (managementStyle || undefined) as ManagementStyle | undefined,
      innovationLevel: (innovationLevel || undefined) as InnovationLevel | undefined,
    }

    const validSites = sites.filter((s) => s.url.trim() !== '')

    const payload: CreateCompanyRequestDTO = {
      name: name.trim(),
      legalName: legalName.trim() || undefined,
      description: description.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      size,
      profile,
      sites: validSites,
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setFormError(
        axiosError.response?.data?.message ||
          'Falha ao registrar a empresa. Por favor, confira os dados informados.',
      )
    }
  }

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-6 rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 max-h-[92vh] flex flex-col overflow-hidden transition-all">
        {/* Progress bar top line */}
        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Top Header */}
        <div className="px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {initialData ? 'Edição da Empresa' : 'Novo Cadastro Corporativo'}
            </span>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {initialData ? initialData.name : 'Cadastrar Empresa'}
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Interactive Steps Header */}
        <div className="px-6 py-3.5 bg-neutral-50/70 dark:bg-neutral-950/40 border-b border-neutral-100 dark:border-neutral-800">
          <div className="grid grid-cols-4 gap-2">
            {STEPS.map((step) => {
              const isPassed = currentStep > step.id
              const isCurrent = currentStep === step.id
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    // Allow navigating back or forward only if step 1 is valid
                    if (step.id < currentStep || name.trim()) {
                      setFormError(null)
                      setCurrentStep(step.id)
                    }
                  }}
                  className={`text-left p-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 ${
                    isCurrent
                      ? 'bg-white dark:bg-neutral-800 shadow-xs border border-neutral-200/80 dark:border-neutral-700'
                      : isPassed
                      ? 'hover:bg-white/60 dark:hover:bg-neutral-800/60 opacity-90'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isPassed
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {isPassed ? <Check className="h-4 w-4" /> : step.id}
                  </div>

                  <div className="hidden sm:block">
                    <span
                      className={`block text-xs font-semibold leading-tight ${
                        isCurrent
                          ? 'text-neutral-900 dark:text-neutral-100'
                          : 'text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="block text-[10px] text-neutral-400 leading-tight">
                      {step.subtitle}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* STEP 1: Identidade */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-step">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                  Identificação da Organização
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Preencha as informações básicas e o porte da sua empresa no SignalHire.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Input
                    label="Nome da Empresa (Exibição)"
                    placeholder="Ex: SignalTech Inovações"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                    helperText="O nome fantasia que aparecerá para os candidatos e colaboradores."
                  />

                  <Input
                    label="Razão Social (Opcional)"
                    placeholder="Ex: SignalTech Soluções em Tecnologia Ltda"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    disabled={isLoading}
                    helperText="Para contratos e identificação jurídica."
                  />
                </div>

                {/* Logo with S3 direct upload from PC */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <LogoUploader
                    currentUrl={logoUrl}
                    companyId={initialData?.id}
                    onChange={(url) => setLogoUrl(url)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Company Size Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Qual o porte da empresa?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {COMPANY_SIZES.map((item) => {
                    const isSelected = size === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSize(item.value)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.01] active:scale-[0.99] ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`p-1.5 rounded-lg ${
                              isSelected
                                ? 'bg-white/20 text-white dark:bg-black/10 dark:text-neutral-900'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                            }`}
                          >
                            {item.icon}
                          </span>
                          {isSelected && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <div>
                          <strong className="block text-xs font-bold leading-tight">{item.label}</strong>
                          <span
                            className={`block text-[10px] mt-0.5 leading-tight ${
                              isSelected ? 'text-neutral-200 dark:text-neutral-700' : 'text-neutral-400'
                            }`}
                          >
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Apresentação Institucional
                  </label>
                  <span className="text-[10px] text-neutral-400">{description.length} caracteres</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as soluções, momento da empresa e proposta de valor no mercado..."
                  disabled={isLoading}
                  className="w-full rounded-xl border border-neutral-300 bg-white p-3.5 text-xs text-neutral-800 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 resize-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Cultura & Ambiente */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-step">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                  Cultura, Missão e Estilo de Trabalho
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Defina o DNA da empresa para atrair talentos altamente alinhados com sua dinâmica.
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Missão"
                  placeholder="Ex: Democratizar o acesso a soluções de software"
                  value={mission}
                  onChange={(e) => setMission(e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  label="Visão"
                  placeholder="Ex: Ser a principal referência no setor até 2030"
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Work Environments */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Modelos de Trabalho Aceitos
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { env: 'REMOTE' as WorkEnvironment, label: '100% Remoto', desc: 'Trabalho de qualquer lugar' },
                    { env: 'HYBRID' as WorkEnvironment, label: 'Híbrido', desc: 'Dias flexíveis no escritório' },
                    { env: 'ONSITE' as WorkEnvironment, label: 'Presencial', desc: 'Atuação na sede da empresa' },
                  ].map((item) => {
                    const isSelected = workEnvironments.includes(item.env)
                    return (
                      <button
                        key={item.env}
                        type="button"
                        onClick={() => toggleWorkEnv(item.env)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between hover:scale-[1.01] active:scale-[0.99] ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                            : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <div>
                          <strong className="block text-xs font-bold">{item.label}</strong>
                          <span
                            className={`block text-[10px] mt-0.5 ${
                              isSelected ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-400'
                            }`}
                          >
                            {item.desc}
                          </span>
                        </div>
                        {isSelected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dynamic Profiles / Styles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    Comunicação
                  </label>
                  <select
                    value={communicationStyle}
                    onChange={(e) => setCommunicationStyle(e.target.value as CommunicationStyle)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    <option value="INFORMAL">Informal & Direta</option>
                    <option value="FORMAL">Formal & Estruturada</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    Gestão
                  </label>
                  <select
                    value={managementStyle}
                    onChange={(e) => setManagementStyle(e.target.value as ManagementStyle)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    <option value="COLLABORATIVE">Colaborativa & Autônoma</option>
                    <option value="HIERARCHICAL">Hierárquica & Definida</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/40">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    Inovação
                  </label>
                  <select
                    value={innovationLevel}
                    onChange={(e) => setInnovationLevel(e.target.value as InnovationLevel)}
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                  >
                    <option value="INNOVATIVE">Inovadora & Disruptiva</option>
                    <option value="MODERATE">Moderada & Estratégica</option>
                    <option value="CONSERVATIVE">Conservadora & Consolidada</option>
                  </select>
                </div>
              </div>

              {/* Values & Quick Suggestions */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Valores Fundamentais ({values.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={valInput}
                    onChange={(e) => setValInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddValue(valInput)
                      }
                    }}
                    placeholder="Digite um valor e aperte Enter..."
                    className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddValue(valInput)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>

                {/* Suggestions pill list */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400">
                  <span>Sugestões rápidas:</span>
                  {SUGGESTED_VALUES.filter((s) => !values.includes(s)).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddValue(sug)}
                      className="px-2 py-0.5 rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {values.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {values.map((v, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-2.5 py-1 text-xs font-medium animate-in zoom-in-95 duration-150"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(i)}
                          className="hover:text-red-300 dark:hover:text-red-600 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Benefits & Quick Suggestions */}
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Benefícios Oferecidos ({benefits.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={benefitInput}
                    onChange={(e) => setBenefitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddBenefit(benefitInput)
                      }
                    }}
                    placeholder="Ex: Gympass, Vale Refeição, Seguro de Vida..."
                    className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddBenefit(benefitInput)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                  </Button>
                </div>

                {/* Suggestions pill list */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-neutral-400">
                  <span>Sugestões rápidas:</span>
                  {SUGGESTED_BENEFITS.filter((s) => !benefits.includes(s)).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddBenefit(sug)}
                      className="px-2 py-0.5 rounded-md border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {benefits.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {benefits.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-800 dark:text-neutral-200 animate-in zoom-in-95 duration-150"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        {b}
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(i)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Canais & Redes */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-step">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                    Canais e Presença Digital
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Adicione os links oficiais da organização para os candidatos conhecerem mais sobre vocês.
                  </p>
                </div>

                <Button type="button" variant="outline" size="sm" onClick={() => handleAddSite('OWN')}>
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Canal
                </Button>
              </div>

              {/* Quick suggestions to add channels with 1 click */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] text-neutral-400 font-medium">Adicionar rapidamente:</span>
                {(['OWN', 'LINKEDIN', 'GITHUB', 'INSTAGRAM', 'FACEBOOK'] as SiteType[]).map((type) => {
                  const cfg = SITE_TYPE_CONFIG[type]
                  const alreadyAdded = sites.some((s) => s.type === type)
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => handleAddSite(type)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                        alreadyAdded
                          ? 'border-neutral-200 bg-neutral-100 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600 cursor-not-allowed opacity-60'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-600 cursor-pointer shadow-2xs'
                      }`}
                    >
                      {cfg.icon('h-3.5 w-3.5')}
                      <span>{cfg.label}</span>
                      {!alreadyAdded && <Plus className="h-2.5 w-2.5 opacity-60" />}
                    </button>
                  )
                })}
              </div>

              {sites.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-neutral-200 rounded-3xl p-6 dark:border-neutral-800">
                  <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Nenhum canal adicionado ainda
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
                    Adicione links como seu Website Oficial, LinkedIn ou repositórios no GitHub para validar sua presença digital.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddSite('OWN')}>
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar Primeiro Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sites.map((site, idx) => {
                    const cfg = SITE_TYPE_CONFIG[site.type] || SITE_TYPE_CONFIG.OTHER
                    const hasUrl = site.url.trim().length > 0
                    const isUrlValid = hasUrl && isValidUrl(site.url)
                    const isUrlInvalid = hasUrl && !isUrlValid

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isUrlInvalid
                            ? 'border-red-300 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20'
                            : 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950/40 shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                          {/* Channel selector with icon */}
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl border flex items-center justify-center ${cfg.badgeBg} shrink-0`}>
                              {cfg.icon('h-4 w-4')}
                            </div>
                            <select
                              value={site.type}
                              onChange={(e) => handleUpdateSite(idx, 'type', e.target.value)}
                              className="w-40 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-800 focus:border-neutral-900 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 cursor-pointer"
                            >
                              {Object.values(SITE_TYPE_CONFIG).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* URL Input with real-time validation feedback */}
                          <div className="relative flex-1">
                            <input
                              type="url"
                              placeholder={cfg.placeholder}
                              value={site.url}
                              onChange={(e) => handleUpdateSite(idx, 'url', e.target.value)}
                              className={`w-full rounded-xl border px-3 py-2 text-xs pr-8 transition-colors focus:outline-hidden ${
                                isUrlInvalid
                                  ? 'border-red-400 bg-red-50/40 text-red-900 focus:border-red-500 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200'
                                  : isUrlValid
                                  ? 'border-emerald-500/60 bg-emerald-50/20 text-neutral-900 focus:border-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-neutral-100'
                                  : 'border-neutral-300 bg-white text-neutral-800 focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200'
                              }`}
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {isUrlValid && (
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              )}
                              {isUrlInvalid && (
                                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                              )}
                            </div>
                          </div>

                          {/* Action icons */}
                          <div className="flex items-center justify-end gap-1 shrink-0">
                            {isUrlValid && (
                              <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir link em nova aba para testar"
                                className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveSite(idx)}
                              title="Remover canal"
                              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Error helper text if URL is invalid */}
                        {isUrlInvalid && (
                          <p className="mt-1.5 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 pl-1">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            Link inválido. Exemplo correto: {cfg.placeholder}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Revisão & Confirmação */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-step">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Revisão dos Dados Cadastrais
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Revise como sua empresa ficará apresentada antes de salvar as alterações.
                </p>
              </div>

              {/* Realistic Preview Card */}
              <div className="p-5 rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950/60">
                <div className="flex items-start gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={name}
                      className="h-16 w-16 rounded-2xl object-cover border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center text-2xl font-bold shadow-2xs">
                      {name ? name.charAt(0).toUpperCase() : 'SH'}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                        {name || 'Nome da Empresa'}
                      </h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        {formatCompanySize(size)}
                      </span>
                    </div>

                    {legalName && (
                      <p className="text-xs text-neutral-400 mt-0.5">Razão Social: {legalName}</p>
                    )}

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-2 line-clamp-2">
                      {description || 'Sem descrição cadastrada.'}
                    </p>
                  </div>
                </div>

                {/* Subsections tags */}
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-1">
                      Modelos de Atuação
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {workEnvironments.map((env) => (
                        <span
                          key={env}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 font-medium"
                        >
                          {formatWorkEnvironment(env)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-1">
                      Dinâmica de Trabalho
                    </span>
                    <div className="space-y-0.5 text-[11px] text-neutral-600 dark:text-neutral-300">
                      <div><strong className="text-neutral-400">Comunicação:</strong> {formatCommunicationStyle(communicationStyle || undefined)}</div>
                      <div><strong className="text-neutral-400">Gestão:</strong> {formatManagementStyle(managementStyle || undefined)}</div>
                      <div><strong className="text-neutral-400">Inovação:</strong> {formatInnovationLevel(innovationLevel || undefined)}</div>
                    </div>
                  </div>
                </div>

                {/* Channels preview in step 4 */}
                {sites.filter((s) => s.url.trim()).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-2">
                      Canais e Presença Digital ({sites.filter((s) => s.url.trim()).length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {sites.filter((s) => s.url.trim()).map((site, i) => {
                        const cfg = SITE_TYPE_CONFIG[site.type] || SITE_TYPE_CONFIG.OTHER
                        return (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${cfg.badgeBg}`}
                          >
                            {cfg.icon('h-3.5 w-3.5')}
                            <span>{cfg.label}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {values.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase block mb-1">
                      Valores Principais
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {values.map((v, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick edit links */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-center cursor-pointer"
                >
                  Editar Identidade
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-center cursor-pointer"
                >
                  Editar Cultura
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-center cursor-pointer"
                >
                  Editar Canais
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
                disabled={isLoading}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-medium">
              Passo {currentStep} de 4
            </span>

            {currentStep < 4 ? (
              <Button type="button" size="sm" onClick={handleNextStep}>
                Próximo Passo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                isLoading={isLoading}
                onClick={() => handleSubmit()}
                className="!bg-neutral-900 !text-white hover:!bg-neutral-800 dark:!bg-neutral-100 dark:!text-neutral-900 shadow-md"
              >
                <Check className="h-4 w-4" />
                {initialData ? 'Salvar Modificações' : 'Concluir Cadastro'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
