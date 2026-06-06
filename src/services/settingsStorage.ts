export interface AppSettings {
  openaiApiKey: string
  aiModel: string
  spoolPrice: number
  spoolWeightKg: number
  electricityCostPerKwh: number
  defaultPrinterProfile: string
  defaultMaterialType: string
}

const STORAGE_KEY = 'print-check-settings'

const DEFAULTS: AppSettings = {
  openaiApiKey: '',
  aiModel: 'gpt-4o-mini',
  spoolPrice: 22,
  spoolWeightKg: 1,
  electricityCostPerKwh: 0.16,
  defaultPrinterProfile: 'Bambu Lab P1S',
  defaultMaterialType: 'PLA+',
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<AppSettings> & { filamentPricePerKg?: number }
    return {
      ...DEFAULTS,
      ...parsed,
      spoolPrice: parsed.spoolPrice ?? parsed.filamentPricePerKg ?? DEFAULTS.spoolPrice,
      spoolWeightKg: parsed.spoolWeightKg ?? DEFAULTS.spoolWeightKg,
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const next = { ...getSettings(), ...settings }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
