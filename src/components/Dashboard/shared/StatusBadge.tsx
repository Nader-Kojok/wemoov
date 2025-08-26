import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'available' | 'unavailable' | 'warning';
  label: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircle
        };
      case 'unavailable':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: XCircle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: AlertCircle
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: AlertCircle
        };
    }
  };

  const { bgColor, textColor, icon: Icon } = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3 w-3';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${bgColor} ${textColor}`}>
      <Icon className={`${iconSize} mr-1`} />
      {label}
    </span>
  );
};

export default StatusBadge;

// Helper function for backward compatibility
export const getStatusBadge = (isAvailable: boolean, label: string) => {
  return (
    <StatusBadge 
      status={isAvailable ? 'available' : 'unavailable'} 
      label={label} 
    />
  );
};