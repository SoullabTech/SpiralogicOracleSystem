'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

export type Archetype = 'fire' | 'water' | 'earth' | 'air'

interface AssessmentQuestion {
  id: number
  question: string
  options: {
    value: Archetype
    emoji: string
    text: string
  }[]
}

interface ArchetypeProfile {
  dominant: Archetype
  secondary: Archetype
  scores: Record<Archetype, number>
}

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    question: "When I face an obstacle, my first instinct is to…",
    options: [
      { value: 'fire', emoji: '🔥', text: 'Push harder and use the energy of resistance to break through' },
      { value: 'water', emoji: '🌊', text: 'Share how I feel and look for emotional support' },
      { value: 'earth', emoji: '🌍', text: 'Break it into steps and create a plan' },
      { value: 'air', emoji: '🌬', text: 'Analyze it logically until I see the pattern' }
    ]
  },
  {
    id: 2,
    question: "In group settings, I'm usually the one who…",
    options: [
      { value: 'fire', emoji: '🔥', text: 'Inspires with vision and sparks new ideas' },
      { value: 'water', emoji: '🌊', text: 'Listens deeply and holds space for emotions' },
      { value: 'earth', emoji: '🌍', text: 'Organizes the plan and makes sure things get done' },
      { value: 'air', emoji: '🌬', text: 'Connects the dots and clarifies concepts' }
    ]
  },
  {
    id: 3,
    question: "Under stress, I tend to…",
    options: [
      { value: 'fire', emoji: '🔥', text: 'Push even harder to force a breakthrough' },
      { value: 'water', emoji: '🌊', text: 'Get overwhelmed and withdraw into feelings' },
      { value: 'earth', emoji: '🌍', text: 'Seek stability through structure and order' },
      { value: 'air', emoji: '🌬', text: 'Overthink and spin in analysis' }
    ]
  },
  {
    id: 4,
    question: "What energizes you most?",
    options: [
      { value: 'fire', emoji: '🔥', text: 'A challenge that tests me' },
      { value: 'water', emoji: '🌊', text: 'Feeling understood and emotionally connected' },
      { value: 'earth', emoji: '🌍', text: 'Achieving tangible results' },
      { value: 'air', emoji: '🌬', text: 'Figuring out a complex problem' }
    ]
  },
  {
    id: 5,
    question: "When you feel 'stuck,' what usually helps most?",
    options: [
      { value: 'fire', emoji: '🔥', text: 'A burst of inspiration or resistance to push against' },
      { value: 'water', emoji: '🌊', text: 'A safe space to express and release emotions' },
      { value: 'earth', emoji: '🌍', text: 'A clear structure or step-by-step plan' },
      { value: 'air', emoji: '🌬', text: 'Talking it through until the ideas click' }
    ]
  },
  {
    id: 6,
    question: "Which statement feels most like you?",
    options: [
      { value: 'fire', emoji: '🔥', text: '"Struggle sharpens me"' },
      { value: 'water', emoji: '🌊', text: '"I need containment before I can grow"' },
      { value: 'earth', emoji: '🌍', text: '"I thrive on structure"' },
      { value: 'air', emoji: '🌬', text: '"Clarity frees me"' }
    ]
  }
]

const ARCHETYPE_DESCRIPTIONS = {
  fire: {
    name: 'Fire',
    emoji: '🔥',
    description: 'You thrive on challenge and use resistance as fuel for breakthrough',
    traits: ['Visionary', 'Passionate', 'Action-oriented', 'Transformative']
  },
  water: {
    name: 'Water',
    emoji: '🌊',
    description: 'You process through feeling and need emotional connection to flow',
    traits: ['Empathetic', 'Intuitive', 'Adaptive', 'Nurturing']
  },
  earth: {
    name: 'Earth',
    emoji: '🌍',
    description: 'You build through structure and manifest through practical steps',
    traits: ['Grounded', 'Reliable', 'Methodical', 'Results-focused']
  },
  air: {
    name: 'Air',
    emoji: '🌬',
    description: 'You navigate through clarity and understanding of patterns',
    traits: ['Analytical', 'Communicative', 'Innovative', 'Conceptual']
  }
}

interface ArchetypeAssessmentProps {
  onComplete: (profile: ArchetypeProfile) => void
  onSkip?: () => void
}

export function ArchetypeAssessment({ onComplete, onSkip }: ArchetypeAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Archetype>>({})
  const [showResults, setShowResults] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<Archetype | ''>('')

  const calculateProfile = (): ArchetypeProfile => {
    const scores: Record<Archetype, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0
    }

    Object.values(answers).forEach(archetype => {
      scores[archetype]++
    })

    const sortedArchetypes = (Object.entries(scores) as [Archetype, number][])
      .sort((a, b) => b[1] - a[1])

    return {
      dominant: sortedArchetypes[0][0],
      secondary: sortedArchetypes[1][0],
      scores
    }
  }

  const handleNext = () => {
    if (selectedAnswer) {
      const newAnswers = { ...answers, [currentQuestion]: selectedAnswer }
      setAnswers(newAnswers)

      if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer('')
      } else {
        setShowResults(true)
      }
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || '')
    }
  }

  const handleComplete = () => {
    const profile = calculateProfile()
    onComplete(profile)
  }

  if (showResults) {
    const profile = calculateProfile()
    const dominant = ARCHETYPE_DESCRIPTIONS[profile.dominant]
    const secondary = ARCHETYPE_DESCRIPTIONS[profile.secondary]

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Archetype Profile</CardTitle>
          <CardDescription>
            Based on your responses, here's your natural communication pattern
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{dominant.emoji}</span>
                <h3 className="text-lg font-semibold">Dominant: {dominant.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{dominant.description}</p>
              <div className="flex flex-wrap gap-2">
                {dominant.traits.map(trait => (
                  <span key={trait} className="px-2 py-1 bg-secondary rounded-md text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{secondary.emoji}</span>
                <h3 className="text-lg font-semibold">Secondary: {secondary.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{secondary.description}</p>
              <div className="flex flex-wrap gap-2">
                {secondary.traits.map(trait => (
                  <span key={trait} className="px-2 py-1 bg-secondary rounded-md text-xs">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>What this means:</strong> Your current archetypal mode leans toward {dominant.name} with {secondary.name} as secondary —
              meaning {dominant.description.toLowerCase()} but also {secondary.description.toLowerCase()}.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleComplete} className="flex-1">
              Continue to Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const question = ASSESSMENT_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>Archetype Assessment</CardTitle>
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
        <CardDescription>
          Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          <RadioGroup value={selectedAnswer} onValueChange={(value) => setSelectedAnswer(value as Archetype)}>
            <div className="space-y-3">
              {question.options.map(option => (
                <div key={option.value} className="flex items-start space-x-2">
                  <RadioGroupItem value={option.value} id={`q${question.id}-${option.value}`} />
                  <Label
                    htmlFor={`q${question.id}-${option.value}`}
                    className="flex items-start gap-2 cursor-pointer flex-1"
                  >
                    <span className="text-xl mt-0.5">{option.emoji}</span>
                    <span className="flex-1">{option.text}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="flex-1"
          >
            {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? 'See Results' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}