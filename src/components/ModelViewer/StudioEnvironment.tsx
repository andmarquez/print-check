import { ContactShadows, Environment, Grid } from '@react-three/drei'

export function StudioEnvironment() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#fff5eb" />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#0066FF" />

      <Environment preset="studio" />

      <Grid
        position={[0, -0.01, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#d9d3c8"
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor="#b8b4ae"
        fadeDistance={16}
        fadeStrength={1.5}
        infiniteGrid
      />

      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.35}
        scale={12}
        blur={2.5}
        far={6}
        color="#2a2826"
      />
    </>
  )
}
