import { Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const MAT_WHEEL  = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.9, metalness: 0.1 })
const MAT_HANDLE = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.3, metalness: 0.8 })
const MAT_BASKET = new THREE.MeshStandardMaterial({ color: '#5F9936', roughness: 0.3, metalness: 0.5 })

function CartModel({ onLoaded }) {
  const group = useRef()
  const { scene } = useGLTF('/cartoon_shopping_cart.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return
      if (child.name.startsWith('Tekerlekler')) child.material = MAT_WHEEL
      else if (child.name.startsWith('Tutacak')) child.material = MAT_HANDLE
      else child.material = MAT_BASKET
    })
    onLoaded()
  }, [scene, onLoaded])

  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.45
  })

  return (
    <group ref={group}>
      <primitive object={scene} scale={2.2} position={[-0.3, -1.0, 0]} />
    </group>
  )
}

export default function SmartCart3D() {
  const [loaded, setLoaded] = useState(false)
  const handleLoaded = useCallback(() => setLoaded(true), [])

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: '#E9FF75', borderTopColor: 'transparent' }}
          />
        </div>
      )}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 1.2, 8], fov: 38 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight position={[5, 8, 5]} intensity={2.2} />
        <directionalLight position={[-4, 3, -3]} intensity={0.9} />
        <pointLight position={[0, 5, 2]} intensity={1.2} color="#D4E84A" />
        <Suspense fallback={null}>
          <CartModel onLoaded={handleLoaded} />
        </Suspense>
      </Canvas>
    </div>
  )
}
