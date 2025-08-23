'use client'

import { useEffect, useState } from 'react'
import { features, capabilities, isDesktop, isMobile } from '@/lib/config/features'

/**
 * Hook to check if a feature is enabled
 * 
 * @example
 * const weaveFeature = useFeature('oracle.weave')
 * if (weaveFeature.isEnabled) { ... }
 * 
 * @example with capability check
 * const voiceFeature = useFeature('oracle.voiceAutoSend', {
 *   requireCapabilities: ['hasSpeechRecognition', 'hasSpeechSynthesis']
 * })
 */

type FeaturePath = 
  | 'library.enabled'
  | 'library.timeline'
  | 'library.reprocess'
  | 'library.offlineCapture'
  | 'oracle.weaveEnabled'
  | 'oracle.voiceAutoSend'
  | 'oracle.multiModal'
  | 'theme.switchingEnabled'
  | 'theme.persistEnabled'
  | 'beta.constellationView'
  | 'beta.advancedMemory'
  | 'beta.soulAnalytics'
  | 'dev.enabled'
  | 'dev.performanceMonitor'
  | 'dev.memoryInspector'

interface UseFeatureOptions {
  requireCapabilities?: Array<keyof typeof capabilities>
  requireDesktop?: boolean
  requireMobile?: boolean
  fallback?: boolean
}

interface UseFeatureReturn {
  isEnabled: boolean
  isLoading: boolean
  capabilities: Record<string, boolean>
  reason?: string
}

export function useFeature(
  featurePath: FeaturePath,
  options: UseFeatureOptions = {}
): UseFeatureReturn {
  const [isClient, setIsClient] = useState(false)
  const [capabilityResults, setCapabilityResults] = useState<Record<string, boolean>>({})
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Parse feature path
  const pathParts = featurePath.split('.') as [string, string]
  const [category, feature] = pathParts
  
  // Get base feature flag value
  const baseEnabled = features[category as keyof typeof features]?.[feature as any] ?? options.fallback ?? false
  
  // Check capabilities on client
  useEffect(() => {
    if (!isClient || !options.requireCapabilities) return
    
    const results: Record<string, boolean> = {}
    for (const cap of options.requireCapabilities) {
      results[cap] = capabilities[cap]?.() ?? false
    }
    setCapabilityResults(results)
  }, [isClient, options.requireCapabilities])
  
  // Determine if feature is enabled
  let isEnabled = baseEnabled
  let reason: string | undefined
  
  // Check device requirements
  if (isClient && isEnabled) {
    if (options.requireDesktop && !isDesktop()) {
      isEnabled = false
      reason = 'Desktop required'
    } else if (options.requireMobile && !isMobile()) {
      isEnabled = false
      reason = 'Mobile required'
    }
  }
  
  // Check capability requirements
  if (isClient && isEnabled && options.requireCapabilities) {
    const missingCaps = options.requireCapabilities.filter(
      cap => !capabilityResults[cap]
    )
    if (missingCaps.length > 0) {
      isEnabled = false
      reason = `Missing capabilities: ${missingCaps.join(', ')}`
    }
  }
  
  return {
    isEnabled: isClient ? isEnabled : baseEnabled,
    isLoading: !isClient,
    capabilities: capabilityResults,
    reason
  }
}

/**
 * Hook to check multiple features at once
 * 
 * @example
 * const features = useFeatures({
 *   weave: 'oracle.weaveEnabled',
 *   voice: { path: 'oracle.voiceAutoSend', requireCapabilities: ['hasSpeechRecognition'] }
 * })
 * 
 * if (features.weave.isEnabled) { ... }
 */
export function useFeatures<T extends Record<string, FeaturePath | { path: FeaturePath; options?: UseFeatureOptions }>>(
  featureMap: T
): { [K in keyof T]: UseFeatureReturn } {
  const results: any = {}
  
  for (const [key, config] of Object.entries(featureMap)) {
    if (typeof config === 'string') {
      results[key] = useFeature(config)
    } else {
      results[key] = useFeature(config.path, config.options)
    }
  }
  
  return results
}

/**
 * Hook to check device type with SSR support
 */
export function useDevice() {
  const [device, setDevice] = useState({
    isDesktop: true,
    isTablet: false,
    isMobile: false,
    isTouch: false
  })
  
  useEffect(() => {
    const updateDevice = () => {
      setDevice({
        isDesktop: isDesktop(),
        isTablet: window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches,
        isMobile: isMobile(),
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      })
    }
    
    updateDevice()
    
    // Listen for resize
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    mediaQuery.addEventListener('change', updateDevice)
    
    return () => mediaQuery.removeEventListener('change', updateDevice)
  }, [])
  
  return device
}

/**
 * Hook for responsive feature flags
 * 
 * @example
 * const showAdvanced = useResponsiveFeature('beta.advancedMemory', {
 *   desktop: true,
 *   tablet: true,
 *   mobile: false
 * })
 */
export function useResponsiveFeature(
  featurePath: FeaturePath,
  deviceConfig: {
    desktop?: boolean
    tablet?: boolean
    mobile?: boolean
  }
): boolean {
  const feature = useFeature(featurePath)
  const device = useDevice()
  
  if (!feature.isEnabled) return false
  
  if (device.isDesktop && deviceConfig.desktop !== undefined) {
    return deviceConfig.desktop
  }
  if (device.isTablet && deviceConfig.tablet !== undefined) {
    return deviceConfig.tablet
  }
  if (device.isMobile && deviceConfig.mobile !== undefined) {
    return deviceConfig.mobile
  }
  
  return feature.isEnabled
}