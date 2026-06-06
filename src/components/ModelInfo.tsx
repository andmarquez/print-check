import type { ModelDimensions, STLFileInfo } from '../types/printCheck'
import { GlassPanel } from './layout/GlassPanel'

interface ModelInfoProps {
  file: STLFileInfo
  dimensions: ModelDimensions | null
}

export function ModelInfo({ file, dimensions }: ModelInfoProps) {
  return (
    <GlassPanel className="p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoItem label="File name" value={file.name} />
        <InfoItem label="File size" value={`${(file.size / 1024).toFixed(1)} KB`} />
        <InfoItem
          label="Bounding box"
          value={
            dimensions
              ? `${dimensions.x} × ${dimensions.y} × ${dimensions.z} mm`
              : 'Loading…'
          }
        />
        <InfoItem label="Orientation" value="Uploaded (preserved)" />
      </div>
    </GlassPanel>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-soft-gray">{label}</p>
      <p className="mt-1 truncate text-sm font-medium text-charcoal" title={value}>
        {value}
      </p>
    </div>
  )
}
