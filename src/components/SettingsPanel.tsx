import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { AppSettings } from '../services/settingsStorage'
import { getSettings, saveSettings } from '../services/settingsStorage'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
  onSaved?: (settings: AppSettings) => void
}

export function SettingsPanel({ open, onClose, onSaved }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>(getSettings())
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (open) setSettings(getSettings())
  }, [open])

  const handleSave = () => {
    const saved = saveSettings(settings)
    onSaved?.(saved)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-charcoal/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col rounded-none border-r-0"
          >
            <div className="flex items-center justify-between border-b border-sand/50 px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-medium text-charcoal">Settings</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-soft-gray">
                  Preferences & AI
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-charcoal-soft hover:bg-cream"
              >
                Close
              </button>
            </div>

            <div className="scrollbar-thin flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-electric-blue">
                  AI Print Advisor
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-charcoal-soft">
                  Add an OpenAI API key to enable LLM-powered recommendations. Stored locally in
                  your browser only.
                </p>
                <label className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-soft-gray">
                  OpenAI API Key
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="flex-1 rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm outline-none focus:border-electric-blue/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="cursor-pointer rounded-lg border border-sand/60 px-3 text-xs text-charcoal-soft"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <label className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-soft-gray">
                  Model
                </label>
                <select
                  value={settings.aiModel}
                  onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm outline-none"
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (recommended)</option>
                  <option value="gpt-4o">gpt-4o</option>
                  <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                </select>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-electric-blue">
                  Default Cost Inputs
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Field
                    label="Spool price ($)"
                    type="number"
                    value={settings.spoolPrice}
                    onChange={(v) => setSettings({ ...settings, spoolPrice: v })}
                  />
                  <Field
                    label="Spool weight (kg)"
                    type="number"
                    value={settings.spoolWeightKg}
                    step={0.1}
                    onChange={(v) => setSettings({ ...settings, spoolWeightKg: v })}
                  />
                  <Field
                    label="Electricity ($/kWh)"
                    type="number"
                    value={settings.electricityCostPerKwh}
                    step={0.01}
                    onChange={(v) => setSettings({ ...settings, electricityCostPerKwh: v })}
                  />
                </div>
              </section>
            </div>

            <div className="border-t border-sand/50 px-6 py-4">
              <button
                type="button"
                onClick={handleSave}
                className="w-full cursor-pointer rounded-xl bg-charcoal py-3 text-sm font-medium text-warm-white shadow-md hover:bg-charcoal-soft"
              >
                Save Settings
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  step,
}: {
  label: string
  value: string | number
  onChange: (v: number) => void
  type?: string
  step?: number
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-1 w-full rounded-lg border border-sand/60 bg-warm-white/80 px-3 py-2 text-sm outline-none"
      />
    </div>
  )
}
