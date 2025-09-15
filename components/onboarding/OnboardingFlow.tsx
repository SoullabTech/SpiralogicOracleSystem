'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArchetypeAssessment, Archetype } from './ArchetypeAssessment'
import { useRouter } from 'next/navigation'

interface UserPreferences {
  conversationStyles: string[]
  interactionGoals: string[]
  boundaries: string[]
  communicationStyle: string
  archetypeProfile?: {
    dominant: Archetype
    secondary: Archetype
    scores: Record<Archetype, number>
  }
}

export function OnboardingFlow() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'welcome' | 'archetype' | 'preferences' | 'complete'>('welcome')
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    conversationStyles: [],
    interactionGoals: [],
    boundaries: [],
    communicationStyle: ''
  })

  const handleArchetypeComplete = (profile: any) => {
    setUserPreferences(prev => ({
      ...prev,
      archetypeProfile: profile
    }))

    // Store profile in user context/database
    localStorage.setItem('archetypeProfile', JSON.stringify(profile))

    setCurrentStep('preferences')
  }

  const handleSkipArchetype = () => {
    setCurrentStep('preferences')
  }

  const handlePreferencesComplete = () => {
    // Save all preferences
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences))
    setCurrentStep('complete')
  }

  const handleOnboardingComplete = () => {
    router.push('/chat')
  }

  if (currentStep === 'welcome') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Welcome to Spiralogic Oracle System</CardTitle>
          <CardDescription>
            Let's personalize your experience with a brief setup process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert">
            <p>
              Our conversation system uses advanced AI technology to provide thoughtful,
              contextually appropriate responses across different conversation themes and emotional contexts.
            </p>
            <p>
              We'll start with an optional archetype assessment to understand your natural
              communication patterns, then set up your preferences.
            </p>
          </div>
          <Button onClick={() => setCurrentStep('archetype')} className="w-full">
            Begin Setup
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (currentStep === 'archetype') {
    return (
      <ArchetypeAssessment
        onComplete={handleArchetypeComplete}
        onSkip={handleSkipArchetype}
      />
    )
  }

  if (currentStep === 'preferences') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Your Preferences</CardTitle>
          <CardDescription>
            Customize how you'd like to interact with the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userPreferences.archetypeProfile && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Your Archetype Profile:</strong> {userPreferences.archetypeProfile.dominant} (dominant)
                with {userPreferences.archetypeProfile.secondary} (secondary)
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Conversation Styles</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Select your preferred conversation approaches:
              </p>
              {['Analytical', 'Supportive', 'Reflective', 'Practical', 'Creative'].map(style => (
                <label key={style} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setUserPreferences(prev => ({
                          ...prev,
                          conversationStyles: [...prev.conversationStyles, style]
                        }))
                      } else {
                        setUserPreferences(prev => ({
                          ...prev,
                          conversationStyles: prev.conversationStyles.filter(s => s !== style)
                        }))
                      }
                    }}
                  />
                  <span className="text-sm">{style}</span>
                </label>
              ))}
            </div>

            <div>
              <h3 className="font-medium mb-2">Communication Style</h3>
              <select
                className="w-full p-2 border rounded"
                onChange={(e) => setUserPreferences(prev => ({
                  ...prev,
                  communicationStyle: e.target.value
                }))}
              >
                <option value="">Select preference...</option>
                <option value="direct">Direct and straightforward</option>
                <option value="gentle">Gentle and supportive</option>
                <option value="challenging">Challenging and growth-oriented</option>
                <option value="balanced">Balanced approach</option>
              </select>
            </div>
          </div>

          <Button onClick={handlePreferencesComplete} className="w-full">
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (currentStep === 'complete') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Setup Complete!</CardTitle>
          <CardDescription>
            Your personalized experience is ready
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg mb-2">
              Your profile has been created successfully
            </p>
            {userPreferences.archetypeProfile && (
              <p className="text-sm text-muted-foreground">
                Dominant: {userPreferences.archetypeProfile.dominant} |
                Secondary: {userPreferences.archetypeProfile.secondary}
              </p>
            )}
          </div>
          <Button onClick={handleOnboardingComplete} className="w-full">
            Start Conversing
          </Button>
        </CardContent>
      </Card>
    )
  }

  return null
}