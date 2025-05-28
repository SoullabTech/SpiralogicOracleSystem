'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, User, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface OnboardingData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  intention: string
}

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Your Sacred Journey',
    description: 'Let us guide you through a transformative experience',
  },
  {
    id: 'identity',
    title: 'Tell Us About Yourself',
    description: 'Your cosmic blueprint begins with your earthly identity',
  },
  {
    id: 'cosmic',
    title: 'Your Cosmic Coordinates',
    description: 'We need your birth details to calculate your astrological chart',
  },
  {
    id: 'intention',
    title: 'Set Your Sacred Intention',
    description: 'What transformation are you seeking?',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    intention: '',
  })

  const createProfile = useMutation({
    mutationFn: async (userData: OnboardingData) => {
      const response = await axios.post(`${API_URL}/api/profile/create`, userData)
      return response.data
    },
    onSuccess: (data) => {
      // Store user session
      localStorage.setItem('userId', data.userId)
      router.push('/dashboard')
    },
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit the form
      createProfile.mutate(data)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateData = (field: keyof OnboardingData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-cosmic-star/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sacred-violet to-sacred-gold"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="sacred-card"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-sacred mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-400">{steps[currentStep].description}</p>
            </div>

            {/* Step Forms */}
            {currentStep === 0 && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-sacred-violet to-sacred-gold flex items-center justify-center"
                >
                  <Sparkles className="w-16 h-16 text-white" />
                </motion.div>
                <p className="text-lg text-gray-300 mb-8">
                  Prepare to embark on a journey of self-discovery and transformation
                </p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => updateData('name', e.target.value)}
                      className="sacred-input pl-10"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Birth Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={data.birthDate}
                      onChange={(e) => updateData('birthDate', e.target.value)}
                      className="sacred-input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Birth Time (optional)</label>
                  <input
                    type="time"
                    value={data.birthTime}
                    onChange={(e) => updateData('birthTime', e.target.value)}
                    className="sacred-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Birth Place</label>
                  <input
                    type="text"
                    value={data.birthPlace}
                    onChange={(e) => updateData('birthPlace', e.target.value)}
                    className="sacred-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Sacred Intention</label>
                  <textarea
                    value={data.intention}
                    onChange={(e) => updateData('intention', e.target.value)}
                    className="sacred-input min-h-[120px] resize-none"
                    placeholder="What are you seeking to transform or discover?"
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  currentStep === 0
                    ? 'opacity-0 pointer-events-none'
                    : 'hover:bg-cosmic-star/30'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={createProfile.isPending}
                className="sacred-button flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  createProfile.isPending ? 'Creating...' : 'Complete Journey'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}