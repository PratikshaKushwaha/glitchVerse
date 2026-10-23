import { useMemo } from 'react'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import envGlbUrl from '../assets/gaussian_splatting/environment_collider.glb?url'

export default function Environment() {
  const { scene } = useGLTF(envGlbUrl)

  // Clone scene, compute vertex normals, and configure materials for rich visibility
  const clonedScene = useMemo(() => {
    const clone = scene.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Ensure geometry has normals so lighting reflects properly
        if (child.geometry) {
          child.geometry.computeVertexNormals()
        }

        // Apply a dark atmospheric ruins material
        child.material = new THREE.MeshStandardMaterial({
          color: '#1a2730',
          roughness: 0.8,
          metalness: 0.15,
          side: THREE.DoubleSide,
        })
      }
    })
    return clone
  }, [scene])

  return (
    <group>
      {/* 3D World Environment Model */}
      <primitive object={clonedScene} />

      {/* Floating Ethereal / Digital Dust Motes */}
      <Sparkles
        count={160}
        scale={[20, 12, 20]}
        position={[0, 0, 0]}
        size={3}
        speed={0.35}
        color="#38bdf8"
        opacity={0.6}
      />
      <Sparkles
        count={70}
        scale={[14, 8, 14]}
        position={[0, 0, 0]}
        size={4}
        speed={0.2}
        color="#fbbf24"
        opacity={0.45}
      />

      {/* World Atmospheric Lighting */}
      <ambientLight intensity={0.55} color="#0f1f2c" />

      {/* Primary Key Moonlight */}
      <directionalLight
        position={[5, 12, 6]}
        intensity={1.4}
        color="#bae6fd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Atmospheric Rim Light */}
      <directionalLight
        position={[-6, 8, -8]}
        intensity={1.0}
        color="#0284c7"
      />

      {/* Under-mist glow */}
      <pointLight
        position={[0, -1.8, 1.0]}
        intensity={0.8}
        distance={12}
        color="#083344"
      />
    </group>
  )
}

useGLTF.preload(envGlbUrl)
