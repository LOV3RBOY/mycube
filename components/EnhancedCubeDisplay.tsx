'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useTexture, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { Upload, RotateCcw, X, Undo, Menu, Play, ChevronDown, Info, Settings, Grid3X3, Save, FileUp, Eye, Keyboard } from 'lucide-react'

const Cube = ({ position, onClick, hasMedia, isHighlighted, mediaUrl, showNumber, index }) => {
  const mesh = useRef()
  const [hovered, setHovered] = useState(false)
  const texture = useTexture(mediaUrl || '/placeholder.svg')

  useFrame((state) => {
    if (isHighlighted) {
      mesh.current.rotation.x += 0.01
      mesh.current.rotation.y += 0.01
    }
  })

  return (
    <mesh
      position={position}
      ref={mesh}
      scale={isHighlighted ? 1.2 : 1}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={hasMedia ? '#ffffff' : (hovered ? '#888888' : '#444444')}
        map={hasMedia ? texture : null}
        transparent={!hasMedia}
        opacity={hasMedia ? 1 : 0.7}
      />
      {showNumber && (
        <Html center>
          <div className="text-white text-lg font-bold">{index + 1}</div>
        </Html>
      )}
    </mesh>
  )
}

const CubeGroup = ({ autoRotate, onCubeClick, cubesWithMedia, highlightedCube, mediaUrls, showNumbers }) => {
  const group = useRef()

  useFrame((state) => {
    if (autoRotate) {
      group.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={group}>
      {[...Array(27)].map((_, index) => {
        const x = (index % 3) - 1
        const y = Math.floor((index % 9) / 3) - 1
        const z = Math.floor(index / 9) - 1
        return (
          <Cube
            key={index}
            position={[x * 1.05, y * 1.05, z * 1.05]}
            onClick={() => onCubeClick(index)}
            hasMedia={cubesWithMedia[index]}
            isHighlighted={highlightedCube === index}
            mediaUrl={mediaUrls[index]}
            showNumber={showNumbers}
            index={index}
          />
        )
      })}
    </group>
  )
}

const ZoomEffect = ({ scrollY }) => {
  const { camera } = useThree()

  useEffect(() => {
    const targetZ = 10 - scrollY / 100
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1)
  }, [scrollY, camera])

  return null
}

const VideoPlayer = ({ url, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="relative w-full max-w-4xl">
        <video src={url} controls className="w-full rounded-lg shadow-lg" />
        <button
          className="absolute top-4 right-4 text-white bg-red-500 rounded-full p-2 hover:bg-red-600 transition-colors duration-200"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

interface EnhancedCubeDisplayProps {
  isDevMode: boolean
}

const EnhancedCubeDisplay: React.FC<EnhancedCubeDisplayProps> = ({ isDevMode }) => {
  const [autoRotate, setAutoRotate] = useState(true)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [showMediaPlayer, setShowMediaPlayer] = useState(false)
  const [currentMediaUrl, setCurrentMediaUrl] = useState('')
  const [cubesWithMedia, setCubesWithMedia] = useState<boolean[]>(Array(27).fill(false))
  const [mediaUrls, setMediaUrls] = useState<(string | null)[]>(Array(27).fill(null))
  const [highlightedCube, setHighlightedCube] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [history, setHistory] = useState<{ cubesWithMedia: boolean[], mediaUrls: (string | null)[] }[]>([])
  const [scrollY, setScrollY] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCubeNumbers, setShowCubeNumbers] = useState(true)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedMedia(file)
      setUploadingMedia(true)
      setUploadProgress(0)

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setUploadProgress(i)
      }

      const fileUrl = URL.createObjectURL(file)
      setSelectedMedia(file)
      setUploadingMedia(false)
      toast.success('Media uploaded successfully. Click on a cube to assign the media.')
      setHighlightedCube(Math.floor(Math.random() * 27))
    }
  }, [])

  const handleCubeClick = useCallback((index: number) => {
    if (selectedMedia) {
      const fileUrl = URL.createObjectURL(selectedMedia)
      setHistory(prev => [...prev, { cubesWithMedia, mediaUrls }])
      setCubesWithMedia(prev => {
        const newState = [...prev]
        newState[index] = true
        return newState
      })
      setMediaUrls(prev => {
        const newUrls = [...prev]
        newUrls[index] = fileUrl
        return newUrls
      })
      setSelectedMedia(null)
      setHighlightedCube(null)
      toast.success(`Media assigned to cube ${index + 1}`)
    } else if (cubesWithMedia[index]) {
      setCurrentMediaUrl(mediaUrls[index] || '')
      setShowMediaPlayer(true)
    }
  }, [selectedMedia, cubesWithMedia, mediaUrls])

  const handleUndo = useCallback(() => {
    if (history.length > 0) {
      const lastState = history[history.length - 1]
      setCubesWithMedia(lastState.cubesWithMedia)
      setMediaUrls(lastState.mediaUrls)
      setHistory(prev => prev.slice(0, -1))
      toast.success('Last action undone')
    }
  }, [history])

  return (
    <div className="relative w-full h-[200vh] bg-gradient-to-b from-gray-900 to-black">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }} dpr={[1, 2]}>
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 10, 20]} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <spotLight position={[-10, -10, -10]} angle={0.3} penumbra={1} intensity={0.5} castShadow />
          <CubeGroup
            autoRotate={autoRotate}
            onCubeClick={handleCubeClick}
            cubesWithMedia={cubesWithMedia}
            highlightedCube={highlightedCube}
            mediaUrls={mediaUrls}
            showNumbers={showCubeNumbers}
          />
          <Environment preset="night" />
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
            <ChromaticAberration offset={[0.0005, 0.0005]} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
          <OrbitControls enablePan={false} enableZoom={false} />
          <ZoomEffect scrollY={scrollY} />
        </Canvas>

        {/* UI elements */}
        <div className="absolute top-0 left-0 w-full">
          <nav className="flex justify-between items-center p-4 bg-black bg-opacity-30 backdrop-filter backdrop-blur-lg">
            <div className="text-white text-2xl font-bold tracking-wider">LVR Cube</div>
            <div className="flex space-x-4">
              {isDevMode && (
                <>
                  <motion.button
                    className="bg-white bg-opacity-10 text-white p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMenu(!showMenu)}
                    aria-label="Show menu"
                  >
                    <Menu className="w-5 h-5" />
                  </motion.button>
                  <motion.label
                    className="bg-white bg-opacity-10 text-white p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                    <Upload className="w-5 h-5" />
                  </motion.label>
                </>
              )}
              <motion.button
                className="bg-white bg-opacity-10 text-white p-2 rounded-full hover:bg-opacity-20 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInfo(!showInfo)}
                aria-label="Show information"
              >
                <Info className="w-5 h-5" />
              </motion.button>
            </div>
          </nav>
        </div>

        {/* Menu */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              className="absolute top-16 right-4 bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-lg p-4 z-50"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                className="block w-full text-left text-white py-2 px-4 hover:bg-white hover:bg-opacity-10 rounded transition-colors duration-200"
                onClick={() => setAutoRotate(!autoRotate)}
              >
                {autoRotate ? 'Stop' : 'Start'} Auto-rotate
              </button>
              <button
                className="block w-full text-left text-white py-2 px-4 hover:bg-white hover:bg-opacity-10 rounded transition-colors duration-200"
                onClick={handleUndo}
              >
                Undo Last Action
              </button>
              <button
                className="block w-full text-left text-white py-2 px-4 hover:bg-white hover:bg-opacity-10 rounded transition-colors duration-200"
                onClick={() => setShowSettings(true)}
              >
                Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-lg p-4 z-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h2 className="text-xl font-bold text-white mb-2">LVR Professional Cube Display</h2>
              <p className="text-gray-300 mb-4">
                This interactive 3D cube display allows you to showcase media on each face of the cube. 
                {isDevMode ? "As a developer, you can upload and assign media to specific cubes." : "Explore the cube by rotating and zooming."}
              </p>
              <button
                className="text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gray-800 rounded-lg p-6 w-96">
                <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white">Show Cube Numbers</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={showCubeNumbers}
                      onChange={() => setShowCubeNumbers(!showCubeNumbers)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
                <button
                  className="w-full text-white bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200 mt-4"
                  onClick={() => setShowSettings(false)}
                >
                  Close Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player */}
        {showMediaPlayer && (
          <VideoPlayer url={currentMediaUrl} onClose={() => setShowMediaPlayer(false)} />
        )}

        {/* Upload Progress */}
        {uploadingMedia && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-lg p-4">
            <div className="text-white mb-2">Uploading media...</div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 20px',
          },
        }}
      />
    </div>
  )
}

export default EnhancedCubeDisplay
