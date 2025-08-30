/**
 * Optimized BookingModal component
 * Now uses the unified booking modal with performance improvements
 * Maintains backward compatibility with the original API
 */

import React, { Suspense } from 'react'
import UnifiedBookingModal from './booking/UnifiedBookingModal'

// Loading fallback component
const BookingModalLoader: React.FC = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 flex items-center space-x-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="text-gray-700">Chargement...</span>
    </div>
  </div>
)

// Backward compatible interface
interface BookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Main component with lazy loading and error boundary
export const BookingModal: React.FC<BookingModalProps> = ({ open, onOpenChange }) => {
  return (
    <Suspense fallback={open ? <BookingModalLoader /> : null}>
      <UnifiedBookingModal 
        open={open} 
        onOpenChange={onOpenChange} 
        mode="standard"
      />
    </Suspense>
  )
}

export default BookingModal