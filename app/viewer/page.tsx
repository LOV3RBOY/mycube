'use client'

import React from 'react'
import EnhancedCubeDisplay from '../../components/EnhancedCubeDisplay'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function ViewerPage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push('/')
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      <EnhancedCubeDisplay isDevMode={false} />
      <button
        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200 z-50"
        onClick={handleLogout}
      >
        <LogOut className="w-6 h-6" />
      </button>
    </div>
  )
}
