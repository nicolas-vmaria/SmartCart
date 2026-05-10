import { Suspense, useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

const MAT_WHEEL  = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.9, metalness: 0.1 })
const MAT_HANDLE = new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.3, metalness: 0.8 })
const MAT_BASKET = new THREE.MeshStandardMaterial({ color: '#18572C', roughness: 0.3, metalness: 0.5 })

function CartModel({ onLoaded }) {
  const group = useRef()
  const { scene } = useGLTF('/cartoon_shopping_cart.glb')

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return
      if (child.name.startsWith('Tekerlekler')) {
        child.material = MAT_WHEEL
      } else if (child.name.startsWith('Tutacak')) {
        child.material = MAT_HANDLE
      } else {
        child.material = MAT_BASKET
      }
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

function Spinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
      <div
        className="w-14 h-14 rounded-full border-4 animate-spin"
        style={{ borderColor: '#E9FF75', borderTopColor: 'transparent' }}
      />
      <span className="text-sm font-bold" style={{ color: '#E9FF75' }}>
        Carregando...
      </span>
    </div>
  )
}

export default function SmartCart3D() {
  const [loaded, setLoaded] = useState(false)
  const handleLoaded = useCallback(() => setLoaded(true), [])

  return (
    <div className="relative w-full h-full">
      {!loaded && <Spinner />}
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 1.2, 8], fov: 38 }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <directionalLight position={[-4, 3, -3]} intensity={0.5} />
        <Environment preset="warehouse" />
        <ContactShadows position={[0, -1.1, 0]} opacity={0.25} scale={6} blur={2} />
        <Suspense fallback={null}>
          <CartModel onLoaded={handleLoaded} />
        </Suspense>
      </Canvas>
    </div>
  )
}
