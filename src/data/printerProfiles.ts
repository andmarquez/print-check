import type { CustomPrinterSettings } from '../types/analysis'

export interface PrinterProfile {
  id: string
  name: string
  printSpeedMmS: number
  buildVolume: { x: number; y: number; z: number }
  nozzleSizeMm: number
  powerWatts: number
  supportedMaterials: string[]
  defaultLayerHeightMm: number
  speedQualityFactor: number
}

export const PRINTER_PROFILES: PrinterProfile[] = [
  {
    id: 'bambu-x1c',
    name: 'Bambu Lab X1 Carbon',
    printSpeedMmS: 100,
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleSizeMm: 0.4,
    powerWatts: 220,
    supportedMaterials: ['PLA', 'PETG', 'ABS', 'TPU'],
    defaultLayerHeightMm: 0.16,
    speedQualityFactor: 1.15,
  },
  {
    id: 'bambu-p1s',
    name: 'Bambu Lab P1S',
    printSpeedMmS: 80,
    buildVolume: { x: 256, y: 256, z: 256 },
    nozzleSizeMm: 0.4,
    powerWatts: 200,
    supportedMaterials: ['PLA', 'PLA+', 'PETG', 'ABS'],
    defaultLayerHeightMm: 0.16,
    speedQualityFactor: 1.1,
  },
  {
    id: 'bambu-a1mini',
    name: 'Bambu Lab A1 Mini',
    printSpeedMmS: 70,
    buildVolume: { x: 180, y: 180, z: 180 },
    nozzleSizeMm: 0.4,
    powerWatts: 150,
    supportedMaterials: ['PLA', 'PETG', 'TPU'],
    defaultLayerHeightMm: 0.16,
    speedQualityFactor: 1.0,
  },
  {
    id: 'prusa-mk4',
    name: 'Prusa MK4',
    printSpeedMmS: 60,
    buildVolume: { x: 250, y: 210, z: 220 },
    nozzleSizeMm: 0.4,
    powerWatts: 180,
    supportedMaterials: ['PLA', 'PETG', 'ABS', 'TPU'],
    defaultLayerHeightMm: 0.2,
    speedQualityFactor: 0.95,
  },
  {
    id: 'creality-k1',
    name: 'Creality K1',
    printSpeedMmS: 90,
    buildVolume: { x: 220, y: 220, z: 250 },
    nozzleSizeMm: 0.4,
    powerWatts: 210,
    supportedMaterials: ['PLA', 'PETG', 'ABS'],
    defaultLayerHeightMm: 0.2,
    speedQualityFactor: 1.05,
  },
  {
    id: 'creality-e3v3',
    name: 'Creality Ender 3 V3',
    printSpeedMmS: 50,
    buildVolume: { x: 220, y: 220, z: 250 },
    nozzleSizeMm: 0.4,
    powerWatts: 140,
    supportedMaterials: ['PLA', 'PETG', 'TPU'],
    defaultLayerHeightMm: 0.2,
    speedQualityFactor: 0.85,
  },
  {
    id: 'flashforge-c5',
    name: 'Flashforge Creator 5',
    printSpeedMmS: 55,
    buildVolume: { x: 280, y: 250, z: 300 },
    nozzleSizeMm: 0.4,
    powerWatts: 190,
    supportedMaterials: ['PLA', 'ABS', 'PETG'],
    defaultLayerHeightMm: 0.2,
    speedQualityFactor: 0.9,
  },
  {
    id: 'custom',
    name: 'Custom Printer',
    printSpeedMmS: 50,
    buildVolume: { x: 220, y: 220, z: 250 },
    nozzleSizeMm: 0.4,
    powerWatts: 160,
    supportedMaterials: ['PLA', 'PETG', 'ABS', 'TPU', 'Resin-like PLA'],
    defaultLayerHeightMm: 0.2,
    speedQualityFactor: 1.0,
  },
]

export const DEFAULT_CUSTOM_PRINTER: CustomPrinterSettings = {
  printSpeedMmS: 50,
  powerWatts: 160,
  buildVolumeX: 220,
  buildVolumeY: 220,
  buildVolumeZ: 250,
  nozzleSizeMm: 0.4,
}

export function getPrinterProfile(
  profileId: string,
  custom?: CustomPrinterSettings | null
): PrinterProfile {
  const base = PRINTER_PROFILES.find((p) => p.id === profileId) ?? PRINTER_PROFILES[4]
  if (profileId !== 'custom' || !custom) return base

  return {
    ...base,
    id: 'custom',
    name: 'Custom Printer',
    printSpeedMmS: custom.printSpeedMmS,
    powerWatts: custom.powerWatts,
    buildVolume: { x: custom.buildVolumeX, y: custom.buildVolumeY, z: custom.buildVolumeZ },
    nozzleSizeMm: custom.nozzleSizeMm,
  }
}
