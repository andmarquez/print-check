import type { MaterialEstimate, OrientationData, PrintIssue, PrintTimeEstimate } from '../types/analysis'
import type { GeometryStats } from './geometryAnalyzer'

export function buildIssuesFromStats(stats: GeometryStats): PrintIssue[] {
  const thinWallStatus = issueStatus(stats.minEdgeLengthMm < 0.8, stats.minEdgeLengthMm < 0.5)
  const overhangStatus = issueStatus(stats.overhangRatio > 8, stats.overhangRatio > 20)
  const floatingStatus = issueStatus(stats.floatingIslandCount > 0, stats.floatingIslandCount > 1)
  const manifoldStatus = issueStatus(stats.nonManifoldEdgeCount > 0, stats.nonManifoldEdgeCount > 10)
  const smallDetailStatus = issueStatus(stats.smallFeatureCount > 5, stats.smallFeatureCount > 20)
  const unsupportedStatus = issueStatus(stats.overhangRatio > 15, stats.overhangRatio > 30)
  const warpingStatus = issueStatus(stats.bedFootprintMm2 > 4000 && stats.heightMm < 20, stats.bedFootprintMm2 > 8000)
  const adhesionStatus = issueStatus(stats.heightToFootprintRatio > 3, stats.heightToFootprintRatio > 5)
  const supportStatus = issueStatus(stats.overhangRatio > 5, stats.overhangRatio > 18)

  return [
    {
      id: 'thin_walls',
      title: 'Thin Walls',
      status: thinWallStatus.status,
      severity: thinWallStatus.severity,
      explanation: `Minimum detected edge: ${stats.minEdgeLengthMm}mm at scaled size.`,
      suggestedFix: 'Increase wall count or scale the model slightly before printing.',
    },
    {
      id: 'overhangs',
      title: 'Overhangs',
      status: overhangStatus.status,
      severity: overhangStatus.severity,
      explanation: `${stats.overhangFaceCount} faces (${stats.overhangRatio}%) exceed 45° overhang angle.`,
      suggestedFix: 'Enable supports or apply recommended orientation.',
    },
    {
      id: 'floating_geometry',
      title: 'Floating Geometry',
      status: floatingStatus.status,
      severity: floatingStatus.severity,
      explanation:
        stats.floatingIslandCount > 0
          ? `${stats.floatingIslandCount} disconnected mesh island(s) detected.`
          : 'All geometry is connected to a single body.',
      suggestedFix: 'Merge disconnected parts in CAD before export.',
    },
    {
      id: 'non_manifold',
      title: 'Non-Manifold Geometry',
      status: manifoldStatus.status,
      severity: manifoldStatus.severity,
      explanation:
        stats.nonManifoldEdgeCount > 0
          ? `${stats.nonManifoldEdgeCount} non-manifold edge(s), ${stats.degenerateTriangleCount} degenerate triangle(s).`
          : 'Mesh appears manifold.',
      suggestedFix: 'Repair mesh in Blender/Meshmixer and re-export.',
    },
    {
      id: 'small_details',
      title: 'Small Fragile Details',
      status: smallDetailStatus.status,
      severity: smallDetailStatus.severity,
      explanation: `${stats.smallFeatureCount} edges below 0.8mm at current scale.`,
      suggestedFix: 'Use 0.12–0.16mm layers and slower outer-wall speed.',
    },
    {
      id: 'unsupported_areas',
      title: 'Large Unsupported Areas',
      status: unsupportedStatus.status,
      severity: unsupportedStatus.severity,
      explanation: `${stats.overhangRatio}% overhang coverage on ${stats.surfaceAreaMm2}mm² surface.`,
      suggestedFix: 'Add tree supports or reorient the model.',
    },
    {
      id: 'warping_risk',
      title: 'Warping Risk',
      status: warpingStatus.status,
      severity: warpingStatus.severity,
      explanation: `Footprint ${stats.bedFootprintMm2}mm², height ${stats.heightMm}mm.`,
      suggestedFix: 'Use brim and stable enclosure temperature.',
    },
    {
      id: 'bed_adhesion',
      title: 'Bed Adhesion Risk',
      status: adhesionStatus.status,
      severity: adhesionStatus.severity,
      explanation: `Height-to-footprint ratio ${stats.heightToFootprintRatio}.`,
      suggestedFix: 'Increase brim width and slow first layers.',
    },
    {
      id: 'support_complexity',
      title: 'Support Complexity',
      status: supportStatus.status,
      severity: supportStatus.severity,
      explanation:
        stats.overhangRatio > 5
          ? `${stats.overhangFaceCount} overhang faces may require supports.`
          : 'Minimal support complexity expected.',
      suggestedFix: 'Use tree supports at 8–12% density.',
    },
  ]
}

function issueStatus(
  warn: boolean,
  fail: boolean
): { status: PrintIssue['status']; severity: PrintIssue['severity'] } {
  if (fail) return { status: 'fail', severity: 'high' }
  if (warn) return { status: 'warning', severity: 'medium' }
  return { status: 'pass', severity: 'low' }
}

export function buildOrientationFromStats(
  stats: GeometryStats,
  material: MaterialEstimate,
  _time: PrintTimeEstimate
): OrientationData {
  const tiltX = stats.overhangRatio > 15 ? 35 : stats.overhangRatio > 8 ? 20 : 0
  const tiltZ = stats.dimensions.x > stats.dimensions.z ? 12 : 0
  const supportReductionPct = Math.round(stats.overhangRatio * 0.35)
  const timeAddMin = Math.round(tiltX * 0.4)
  const supportGramsSaved = Math.round(material.supportGrams * (supportReductionPct / 100))

  return {
    current: { x: 0, y: 0, z: 0 },
    recommended: { x: tiltX, y: 0, z: tiltZ },
    supportReduction: supportReductionPct > 0 ? `−${supportReductionPct}%` : '0%',
    timeDifference: timeAddMin > 0 ? `+${timeAddMin} min (estimated)` : '0 min',
    materialSavings: supportGramsSaved > 0 ? `−${supportGramsSaved}g (estimated)` : '0g',
    riskReduction: supportReductionPct > 0 ? `−${Math.round(supportReductionPct * 0.6)}%` : '0%',
  }
}

export function buildRuleBasedRecommendations(stats: GeometryStats): string[] {
  const recs: string[] = [
    `Mesh analyzed at ${stats.dimensions.x}×${stats.dimensions.y}×${stats.dimensions.z}mm with ${stats.volumeCm3.toFixed(1)}cm³ solid volume (estimated from geometry).`,
  ]

  if (stats.overhangRatio > 10) {
    recs.push(`${stats.overhangRatio}% overhangs detected — enable supports or apply recommended orientation.`)
  }
  if (stats.minEdgeLengthMm < 0.8) {
    recs.push(`Features down to ${stats.minEdgeLengthMm}mm — use finer layer heights for detail.`)
  }
  if (stats.floatingIslandCount > 0) {
    recs.push(`${stats.floatingIslandCount} disconnected island(s) — merge before printing.`)
  }
  if (stats.nonManifoldEdgeCount > 0) {
    recs.push(`${stats.nonManifoldEdgeCount} non-manifold edges — repair mesh before slicing.`)
  }

  return recs
}
