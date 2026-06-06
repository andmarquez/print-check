import type { PrintRecommendation } from '../types/printCheck'

/** Static general recommendations — not tied to fake geometry analysis. */
export const BETTER_PRINT_SETTINGS: PrintRecommendation[] = [
  {
    key: 'layer_height',
    label: 'Layer Height',
    value: '0.12–0.16 mm detailed · 0.20 mm standard · 0.28 mm large simple',
    note: 'Use 0.16 mm for detailed art toys and organic shapes. Use 0.28 mm for large simple objects.',
  },
  {
    key: 'nozzle',
    label: 'Nozzle Size',
    value: '0.4 mm default · 0.6 mm faster · 0.2 mm fine detail',
    note: 'Match nozzle to layer height and detail level from your slicer profile.',
  },
  {
    key: 'infill',
    label: 'Infill',
    value: '10–15% display · 20–30% functional · 40%+ structural',
    note: 'Higher infill increases strength, weight, time, and material cost.',
  },
  {
    key: 'walls',
    label: 'Wall Count',
    value: '2–3 walls typical · 4+ for thin or load-bearing parts',
    note: 'More walls improve durability without filling the entire interior.',
  },
  {
    key: 'supports',
    label: 'Support Type',
    value: 'Tree/organic for characters · Normal for flat mechanical parts',
    note: 'Use tree or organic supports for faces, curves, and sculptures.',
  },
  {
    key: 'adhesion',
    label: 'Build Plate Adhesion',
    value: 'Brim for small footprint · Raft for tall narrow parts',
    note: 'Improve first-layer stability before increasing print speed.',
  },
  {
    key: 'orientation',
    label: 'Print Orientation',
    value: 'Keep the STL as uploaded in the viewer',
    note: 'Only change orientation in your slicer if supports or layer lines benefit. Preview optional here.',
  },
  {
    key: 'material',
    label: 'Material',
    value: 'PLA easy · PETG durable · ABS heat-resistant · TPU flexible',
    note: 'Material choice affects bed temp, enclosure needs, and average power draw.',
  },
  {
    key: 'speed',
    label: 'Speed',
    value: 'Slower outer walls · faster infill · reduce speed on overhangs',
    note: 'Quality presets in your slicer often trade speed for surface finish.',
  },
  {
    key: 'cooling',
    label: 'Cooling',
    value: 'More fan for PLA · less for ABS/ASA · tune per material',
    note: 'Cooling changes overhang quality and can affect average power usage.',
  },
]
