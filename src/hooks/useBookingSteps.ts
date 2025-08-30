/**
 * Custom hook for managing booking steps and navigation
 * Reduces code duplication between different booking modal implementations
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import type { BookingStep, BookingMode } from '@/types/booking'
import { STEP_CONFIGURATIONS } from '@/constants/booking'

interface UseBookingStepsProps {
  serviceType: string
  mode?: BookingMode
  selectedService?: string | null
}

export const useBookingSteps = ({ 
  serviceType, 
  mode = 'standard', 
  selectedService 
}: UseBookingStepsProps) => {
  const [currentStep, setCurrentStep] = useState(0)

  // Réinitialiser l'étape courante quand le service change
  useEffect(() => {
    setCurrentStep(0)
  }, [serviceType, selectedService])

  // Generate steps based on service type and mode
  const steps = useMemo((): BookingStep[] => {
    if (mode === 'standard' && !selectedService) {
      return [{ id: 0, title: "Service", component: "service" }]
    }

    const activeService = selectedService || serviceType
    
    if (mode === 'standard' && selectedService) {
      // Standard modal with service selection
      const baseSteps = [{ id: 0, title: "Service", component: "service" }]
      const serviceSteps = [...(STEP_CONFIGURATIONS[activeService as keyof typeof STEP_CONFIGURATIONS] || [])]
      
      return [
        ...baseSteps,
        { id: 1, title: "Localisation", component: "location" },
        ...serviceSteps.slice(1) // Skip the first step as we have location
      ].map((step, index) => ({ ...step, id: index }))
    }

    // Hero modal or standard modal with known service
    const serviceSteps = STEP_CONFIGURATIONS[activeService as keyof typeof STEP_CONFIGURATIONS] || 
                        STEP_CONFIGURATIONS.course
    return [...serviceSteps] // Create mutable copy
  }, [serviceType, mode, selectedService])

  const maxSteps = steps.length

  const nextStep = useCallback(() => {
    if (currentStep < maxSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, maxSteps])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < maxSteps) {
      setCurrentStep(step)
    }
  }, [maxSteps])

  const resetSteps = useCallback(() => {
    setCurrentStep(0)
  }, [])

  const getCurrentStepInfo = useCallback(() => {
    return steps[currentStep] || null
  }, [steps, currentStep])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === maxSteps - 1
  const canGoNext = currentStep < maxSteps - 1
  const canGoPrev = currentStep > 0

  const getProgressPercentage = useCallback(() => {
    return ((currentStep + 1) / maxSteps) * 100
  }, [currentStep, maxSteps])

  return {
    steps,
    currentStep,
    maxSteps,
    nextStep,
    prevStep,
    goToStep,
    resetSteps,
    setCurrentStep,
    getCurrentStepInfo,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev,
    getProgressPercentage
  }
}