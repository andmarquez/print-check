export interface AppSettings {
  openaiApiKey: string
  aiModel: string
  filamentPricePerKg: number
  electricityCostPerKwh: number
  defaultPrinterProfile: string
  defaultMaterialType: string
}

const STORAGE_KEY = 'print-check-settings'

const DEFAULTS: AppSettings = {
  openaiApiKey: '',
  aiModel: 'gpt-4o-mini',
  filamentPricePerKg: 22,
  electricityCostPerKwh: 0.14,
  defaultPrinterProfile: 'Bambu Lab P1S',
  defaultMaterialType: 'PLA+',
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...settings }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
