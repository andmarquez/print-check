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
  printerCost: number
  expectedLifespanHours: number
}

export const PRINTER_PROFILES: PrinterProfile[] = [
  {
    id: 'flashforge-c5',
    name: 'Creator 5 Flashforge',
    printSpeedMmS: 55,
    buildVolume: { x: 280, y: 250, z: 300 },
    nozzleSizeMm: 0.4,
    powerWatts: 190,
    supportedMaterials: ['PLA', 'ABS', 'PETG'],
    defaultLayerHeightMm: 0.2,
    speedQualityFactor: 0.9,
    printerCost: 599,
    expectedLifespanHours: 7000,
  },
  {
    id: 'snapmaker-u1',
    name: 'U1 Snapmaker',
    printSpeedMmS: 60,
    buildVolume: { x: 270, y: 270, z: 270 },
    nozzleSizeMm: 0.4,
    powerWatts: 200,
    supportedMaterials: ['PLA', 'PETG', 'ABS', 'TPU'],
    defaultLayerHeightMm: 0.16,
    speedQualityFactor: 1.0,
    printerCost: 899,
    expectedLifespanHours: 8000,
  },
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
    printerCost: 1199,
    expectedLifespanHours: 8000,
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
    printerCost: 699,
    expectedLifespanHours: 8000,
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
    printerCost: 399,
    expectedLifespanHours: 6000,
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
    printerCost: 899,
    expectedLifespanHours: 10000,
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
    printerCost: 499,
    expectedLifespanHours: 6000,
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
    printerCost: 299,
    expectedLifespanHours: 5000,
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
    printerCost: 500,
    expectedLifespanHours: 5000,
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
  const base = PRINTER_PROFILES.find((p) => p.id === profileId) ?? PRINTER_PROFILES[0]
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
