'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, HelpCircle, Box, Code } from 'lucide-react'
import { useRouter } from 'next/navigation'

const PasswordLetter = ({ letter, index, total }: { letter: string; index: number; total: number }) => {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  const radius = 120

  return (
    <motion.div
      className="absolute text-4xl font-bold text-white"
      initial={{ x: 0, y: 0, scale: 2, opacity: 0 }}
      animate={{
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        scale: 1,
        opacity: 1,
      }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {letter}
    </motion.div>
  )
}

export default function PasswordUnlock() {
  const [password, setPassword] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [accessGranted, setAccessGranted] = useState<'viewer' | 'developer' | null>(null)
  const [shakeError, setShakeError] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const router = useRouter()

  const viewerPassword = 'LVRBOY'
  const developerPassword = 'LVRDEV'

  useEffect(() => {
    const checkPassword = () => {
      if (password === viewerPassword) {
        setAccessGranted('viewer')
        setTimeout(() => router.push('/viewer'), 2000)
      } else if (password === developerPassword) {
        setAccessGranted('developer')
        setTimeout(() => router.push('/developer'), 2000)
      } else if (password.length === Math.max(viewerPassword.length, developerPassword.length)) {
        setShakeError(true)
        setTimeout(() => {
          setShakeError(false)
          setPassword('')
        }, 500)
      }
    }

    checkPassword()

    if (password.length > 0) {
      setShowInstructions(false)
    }
  }, [password, router])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 && password.length < Math.max(viewerPassword.length, developerPassword.length)) {
      setPassword(prev => prev + e.key.toUpperCase())
    } else if (e.key === 'Backspace') {
      setPassword(prev => prev.slice(0, -1))
    }
  }

  const renderAccessGrantedScreen = () => {
    if (accessGranted === 'viewer') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Box className="w-16 h-16 text-white" />
          <h2 className="text-4xl font-bold text-white">Viewer Access Granted</h2>
          <p className="text-xl text-gray-200">You can now view and interact with the cube.</p>
        </div>
      )
    } else if (accessGranted === 'developer') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Code className="w-16 h-16 text-blue-300" />
          <h2 className="text-4xl font-bold text-blue-300">Developer Access Granted</h2>
          <p className="text-xl text-white">You can now edit the cube. Changes will be reflected in the viewer.</p>
        </div>
      )
    }
    return null
  }

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-gray-700 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {!accessGranted && (
        <motion.div
          className="relative w-64 h-64 rounded-full border-4 border-gray-600 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
        >
          {password.split('').map((letter, index) => (
            <PasswordLetter key={index} letter={letter} index={index} total={password.length} />
          ))}
          {password.length < Math.max(viewerPassword.length, developerPassword.length) && (
            <motion.div
              className="text-6xl font-bold text-gray-400"
              key={password.length}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              ?
            </motion.div>
          )}
        </motion.div>
      )}
      <AnimatePresence>
        {accessGranted && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gray-800"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderAccessGrantedScreen()}
          </motion.div>
        )}
      </AnimatePresence>
      {!accessGranted && (
        <motion.button
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gray-700 text-white rounded-full text-lg font-semibold flex items-center"
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHint(!showHint)}
        >
          <HelpCircle className="mr-2" />
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </motion.button>
      )}
      <AnimatePresence>
        {showHint && !accessGranted && (
          <motion.div
            className="absolute top-10 left-1/2 transform -translate-x-1/2 text-2xl bg-gray-700 text-white px-6 py-3 rounded-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            Hint: LVRBOY or LVRDEV
          </motion.div>
        )}
      </AnimatePresence>
      {!accessGranted && (
        <motion.div
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-lg text-gray-200"
          animate={{ opacity: password.length > 0 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {password.length} / {Math.max(viewerPassword.length, developerPassword.length)}
        </motion.div>
      )}
      <motion.div
        className="absolute inset-0 border-8 border-gray-700 rounded-3xl pointer-events-none"
        animate={{ borderColor: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: shakeError ? [0, -2, 2, -2, 2, 0] : 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className="w-full max-w-lg aspect-square" />
      </motion.div>
      <AnimatePresence>
        {showInstructions && !accessGranted && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-center bg-gray-800 bg-opacity-70 p-6 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Keyboard className="mx-auto mb-4 w-12 h-12" />
            Type the password to access the LVR experience
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
