import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Car,
  Phone,
  Edit,
  UserCheck,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';

interface Booking {
  id: string;
  serviceType: string;
  pickupLocation: string;
  destination: string;
  scheduledDate: string;
  scheduledTime: string;
  passengers: number;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalPrice: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  driver?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  vehicle?: {
    id: string;
    type: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

interface BookingCardProps {
  booking: Booking;
  onEdit: (booking: Booking) => void;
  onAssign: (booking: Booking) => void;
  onView: (booking: Booking) => void;
  onDelete: (bookingId: string) => void;
  formatCurrency: (amount: number) => string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onEdit,
  onAssign,
  onView,
  onDelete,
  formatCurrency
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'En attente'
        };
      case 'CONFIRMED':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Confirmée'
        };
      case 'ASSIGNED':
        return {
          icon: <UserCheck className="h-4 w-4" />,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Assignée'
        };
      case 'IN_PROGRESS':
        return {
          icon: <PlayCircle className="h-4 w-4" />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          label: 'En cours'
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Terminée'
        };
      case 'CANCELLED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Annulée'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status
        };
    }
  };

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'AIRPORT': return 'Aéroport';
      case 'CITY': return 'Ville';
      case 'INTERCITY': return 'Intercité';
      case 'HOURLY': return 'À l\'heure';
      case 'EVENT': return 'Événement';
      default: return type;
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const canAssign = booking.status === 'PENDING' || booking.status === 'ASSIGNED';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header avec statut et actions */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getServiceTypeLabel(booking.serviceType)}
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(booking)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voir détails"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(booking)}
            className="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          {canAssign && (
            <button
              onClick={() => onAssign(booking)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title={booking.driver ? "Réassigner le chauffeur" : "Assigner un chauffeur"}
            >
              <UserCheck className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(booking.id)}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Informations client */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {booking.user.firstName.charAt(0)}{booking.user.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {booking.user.firstName} {booking.user.lastName}
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              {booking.user.phone}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(booking.totalPrice)}
            </div>
            <div className="text-xs text-gray-500 flex items-center justify-end">
              <Users className="h-3 w-3 mr-1" />
              {booking.passengers} passager{booking.passengers > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Trajet */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Départ</div>
              <div className="text-sm text-gray-600">{booking.pickupLocation}</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full h-px bg-gray-300 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-50 px-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Arrivée</div>
              <div className="text-sm text-gray-600">{booking.destination}</div>
            </div>
          </div>
        </div>

        {/* Date et heure */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(booking.scheduledDate).toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {booking.scheduledTime}
          </div>
        </div>

        {/* Chauffeur et véhicule */}
        {booking.driver ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {booking.driver.user.firstName.charAt(0)}{booking.driver.user.lastName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-green-900">
                    {booking.driver.user.firstName} {booking.driver.user.lastName}
                  </div>
                  {booking.vehicle && (
                    <div className="text-xs text-green-700 flex items-center">
                      <Car className="h-3 w-3 mr-1" />
                      {booking.vehicle.brand} {booking.vehicle.model}
                    </div>
                  )}
                </div>
              </div>
              {canAssign && (
                <button
                  onClick={() => onAssign(booking)}
                  className="text-xs text-green-700 hover:text-green-900 underline"
                >
                  Changer
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center space-x-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Aucun chauffeur assigné</span>
            </div>
            {canAssign && (
              <button
                onClick={() => onAssign(booking)}
                className="mt-2 text-xs text-red-700 hover:text-red-900 underline"
              >
                Assigner un chauffeur
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;