'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'

interface HoloflowerHouse {
  id: number
  name: string
  element: string
  astrologicalMeaning: string
  currentEnergy: number
  planetaryRuler: string
  currentTransits: string[]
  color: string
}

interface SacredHoloflowerProps {
  userId?: string
  interactive?: boolean
  showTransits?: boolean
}

export function SacredHoloflower({ 
  userId, 
  interactive = true, 
  showTransits = true 
}: SacredHoloflowerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null)
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null)

  // Fetch user's holoflower data
  const { data: holoflowerData } = useQuery({
    queryKey: ['holoflower', userId],
    queryFn: async () => {
      if (!userId) return null
      const response = await api.get(`${endpoints.personalOracle}/holoflower/${userId}`)
      return response.data
    },
    enabled: !!userId,
  })

  // Default houses with astrological meanings
  const defaultHouses: HoloflowerHouse[] = [
    { id: 1, name: "Self & Identity", element: "Fire", astrologicalMeaning: "Personal identity, appearance, first impressions", currentEnergy: 0.8, planetaryRuler: "Mars", currentTransits: [], color: "#FF6B6B" },
    { id: 2, name: "Resources & Values", element: "Earth", astrologicalMeaning: "Material possessions, self-worth, values", currentEnergy: 0.6, planetaryRuler: "Venus", currentTransits: [], color: "#95D5B2" },
    { id: 3, name: "Communication", element: "Air", astrologicalMeaning: "Communication, siblings, short journeys", currentEnergy: 0.9, planetaryRuler: "Mercury", currentTransits: [], color: "#A8DADC" },
    { id: 4, name: "Home & Roots", element: "Water", astrologicalMeaning: "Home, family, emotional foundations", currentEnergy: 0.7, planetaryRuler: "Moon", currentTransits: [], color: "#4ECDC4" },
    { id: 5, name: "Creativity & Joy", element: "Fire", astrologicalMeaning: "Creativity, romance, children, pleasure", currentEnergy: 0.85, planetaryRuler: "Sun", currentTransits: [], color: "#FF6B6B" },
    { id: 6, name: "Service & Health", element: "Earth", astrologicalMeaning: "Health, daily routines, service to others", currentEnergy: 0.5, planetaryRuler: "Mercury", currentTransits: [], color: "#95D5B2" },
    { id: 7, name: "Partnership", element: "Air", astrologicalMeaning: "Partnerships, marriage, open enemies", currentEnergy: 0.75, planetaryRuler: "Venus", currentTransits: [], color: "#A8DADC" },
    { id: 8, name: "Transformation", element: "Water", astrologicalMeaning: "Transformation, shared resources, mysticism", currentEnergy: 0.9, planetaryRuler: "Pluto", currentTransits: [], color: "#4ECDC4" },
    { id: 9, name: "Philosophy", element: "Fire", astrologicalMeaning: "Higher learning, philosophy, long journeys", currentEnergy: 0.65, planetaryRuler: "Jupiter", currentTransits: [], color: "#FF6B6B" },
    { id: 10, name: "Career & Status", element: "Earth", astrologicalMeaning: "Career, reputation, public image", currentEnergy: 0.8, planetaryRuler: "Saturn", currentTransits: [], color: "#95D5B2" },
    { id: 11, name: "Community", element: "Air", astrologicalMeaning: "Friends, groups, hopes and dreams", currentEnergy: 0.7, planetaryRuler: "Uranus", currentTransits: [], color: "#A8DADC" },
    { id: 12, name: "Spirituality", element: "Water", astrologicalMeaning: "Spirituality, hidden things, subconscious", currentEnergy: 0.95, planetaryRuler: "Neptune", currentTransits: [], color: "#4ECDC4" },
  ]

  const houses = holoflowerData?.houses || defaultHouses

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Animation loop
    let animationId: number
    let rotation = 0

    const draw = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.4

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw cosmic background gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, 'rgba(139, 71, 137, 0.1)')
      gradient.addColorStop(1, 'rgba(10, 14, 39, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw houses
      houses.forEach((house: HoloflowerHouse, index: number) => {
        const angle = (index * 30 - 90) * Math.PI / 180 + rotation
        const nextAngle = ((index + 1) * 30 - 90) * Math.PI / 180 + rotation

        // Draw house segment
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius * house.currentEnergy, angle, nextAngle)
        ctx.closePath()

        // Set fill color based on hover state
        if (hoveredHouse === house.id || selectedHouse === house.id) {
          ctx.fillStyle = house.color + 'CC'
          ctx.strokeStyle = '#FFD700'
          ctx.lineWidth = 3
        } else {
          ctx.fillStyle = house.color + '66'
          ctx.strokeStyle = house.color + 'AA'
          ctx.lineWidth = 1
        }

        ctx.fill()
        ctx.stroke()

        // Draw house number
        const labelAngle = (angle + nextAngle) / 2
        const labelRadius = radius * 0.85
        const labelX = centerX + Math.cos(labelAngle) * labelRadius
        const labelY = centerY + Math.sin(labelAngle) * labelRadius

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(house.id.toString(), labelX, labelY)
      })

      // Draw center circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 0.2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 215, 0, 0.1)'
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 2
      ctx.fill()
      ctx.stroke()

      // Draw sacred geometry
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(rotation * 2)
      
      // Draw flower of life pattern in center
      for (let i = 0; i < 6; i++) {
        const petalAngle = (i * 60) * Math.PI / 180
        const petalX = Math.cos(petalAngle) * radius * 0.1
        const petalY = Math.sin(petalAngle) * radius * 0.1
        
        ctx.beginPath()
        ctx.arc(petalX, petalY, radius * 0.05, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      
      ctx.restore()

      rotation += 0.001
      animationId = requestAnimationFrame(draw)
    }

    draw()

    // Handle mouse interactions
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Calculate angle from center
      const angle = Math.atan2(y - centerY, x - centerX)
      const normalizedAngle = ((angle * 180 / Math.PI + 90 + 360) % 360)
      const houseIndex = Math.floor(normalizedAngle / 30)
      
      // Check if within radius
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
      const radius = Math.min(rect.width, rect.height) * 0.4

      if (distance < radius && distance > radius * 0.2) {
        setHoveredHouse(houses[houseIndex].id)
        canvas.style.cursor = 'pointer'
      } else {
        setHoveredHouse(null)
        canvas.style.cursor = 'default'
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (!interactive || hoveredHouse === null) return
      setSelectedHouse(hoveredHouse)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [houses, hoveredHouse, selectedHouse, interactive])

  const selectedHouseData = houses.find((h: HoloflowerHouse) => h.id === selectedHouse)

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />

      {/* House Information Panel */}
      {selectedHouseData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-cosmic-nebula/90 backdrop-blur-sm border-t border-sacred-violet/20"
        >
          <h3 className="text-xl font-sacred mb-2">
            House {selectedHouseData.id}: {selectedHouseData.name}
          </h3>
          <p className="text-sm text-gray-300 mb-2">
            {selectedHouseData.astrologicalMeaning}
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedHouseData.color }} />
              {selectedHouseData.element}
            </span>
            <span>Ruler: {selectedHouseData.planetaryRuler}</span>
            <span>Energy: {Math.round(selectedHouseData.currentEnergy * 100)}%</span>
          </div>
          {showTransits && selectedHouseData.currentTransits.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-sacred-gold">
                Active Transits: {selectedHouseData.currentTransits.join(', ')}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}