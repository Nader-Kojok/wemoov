import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="flex items-center justify-center min-h-screen p-4"
        onClick={handleBackdropClick}
      >
        {/* Arrière-plan avec effet de flou et dégradé */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/40 backdrop-blur-sm transition-all duration-300" />
        
        {/* Contenu de la modale avec animations et design amélioré */}
        <div className={`bg-white/95 backdrop-blur-md rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all duration-300 w-full relative z-10 border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 ${sizeClasses[size]}`}>
          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 px-6 pt-6 pb-4 border-b border-gray-100/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                {title}
              </h3>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full p-2 transition-all duration-200 hover:scale-105"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="px-6 py-6 bg-white/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;