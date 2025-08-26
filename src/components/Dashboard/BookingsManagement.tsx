import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Clock,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import Modal from './shared/Modal';
import BookingForm from './forms/BookingForm';
import AssignDriverModal from './modals/AssignDriverModal';
import BookingCard from './cards/BookingCard';
import { NotificationProvider, useNotifications } from './shared/NotificationSystem';

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

interface Driver {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  vehicle?: {
    id: string;
    type: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

const BookingsManagementContent: React.FC = () => {
  const { showError, showSuccess } = useNotifications();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
    fetchAvailableDrivers();
    fetchUsers();
  }, [currentPage, statusFilter, serviceFilter, debouncedSearchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (serviceFilter) params.append('serviceType', serviceFilter);
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      const response = await fetch(`/api/dashboard/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }

      const data = await response.json();
      setBookings(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Erreur lors du chargement des réservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/drivers/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des chauffeurs');
      }

      const data = await response.json();
      setAvailableDrivers(data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des chauffeurs:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  const assignDriver = async (driverId: string) => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      
      if (driverId === 'UNASSIGN') {
        const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/unassign`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || 'Erreur lors de la désassignation du chauffeur';
          throw new Error(errorMessage);
        }
      } else {
        const driver = availableDrivers.find(d => d.id === driverId);
        
        const response = await fetch(`/api/dashboard/bookings/${selectedBooking.id}/assign`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            driverId: driverId,
            vehicleId: driver?.vehicle?.id
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || 'Erreur lors de l\'assignation du chauffeur';
          throw new Error(errorMessage);
        }
      }

      setShowAssignModal(false);
      setSelectedBooking(null);

      fetchBookings();
    } catch (err) {
      showError(
        'Erreur d\'assignation',
        err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite'
      );
      throw err;
    }
  };

  const handleCreateBooking = () => {
    setEditingBooking(null);
    setShowCreateEditModal(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowCreateEditModal(true);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la réservation');
      }

      fetchBookings();
      showSuccess('Réservation supprimée', 'La réservation a été supprimée avec succès');
    } catch (err) {
      showError(
        'Erreur de suppression',
        err instanceof Error ? err.message : 'Une erreur est survenue'
      );
    }
  };

  const handleSubmitBooking = async (formData: any) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingBooking 
        ? `/api/dashboard/bookings/${editingBooking.id}`
        : '/api/dashboard/bookings';
      
      const method = editingBooking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Erreur lors de la sauvegarde de la réservation';
        throw new Error(errorMessage);
      }

      setShowCreateEditModal(false);
      setEditingBooking(null);
      fetchBookings();
      showSuccess(
        editingBooking ? 'Réservation modifiée' : 'Réservation créée',
        editingBooking ? 'La réservation a été mise à jour avec succès' : 'La nouvelle réservation a été créée avec succès'
      );
    } catch (err) {
      showError(
        'Erreur de sauvegarde',
        err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite'
      );
      throw err;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredBookings = (bookings || []).filter(booking => {
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.user.firstName.toLowerCase().includes(searchLower) ||
      booking.user.lastName.toLowerCase().includes(searchLower) ||
      booking.pickupLocation.toLowerCase().includes(searchLower) ||
      booking.destination.toLowerCase().includes(searchLower)
    ) &&
    (statusFilter === '' || booking.status === statusFilter) &&
    (serviceFilter === '' || booking.serviceType === serviceFilter);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-600">Gérez toutes les réservations de transport</p>
        </div>
        <button
          onClick={handleCreateBooking}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </button>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">À assigner</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredBookings.filter(b => !b.driver && b.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Assignées</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredBookings.filter(b => b.driver && b.status === 'ASSIGNED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">En cours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredBookings.filter(b => b.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Chauffeurs actifs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(filteredBookings.filter(b => b.driver && (b.status === 'ASSIGNED' || b.status === 'IN_PROGRESS')).map(b => b.driver?.id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, trajet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="ASSIGNED">Assignées</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminées</option>
            <option value="CANCELLED">Annulées</option>
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les services</option>
            <option value="AIRPORT">Aéroport</option>
            <option value="CITY">Ville</option>
            <option value="INTERCITY">Intercité</option>
            <option value="HOURLY">À l'heure</option>
            <option value="EVENT">Événement</option>
          </select>
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation trouvée</h3>
          <p className="text-gray-500 mb-4">Il n'y a pas de réservations correspondant à vos critères de recherche.</p>
          <button
            onClick={handleCreateBooking}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une réservation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onEdit={handleEditBooking}
              onAssign={(booking) => {
                setSelectedBooking(booking);
                setShowAssignModal(true);
              }}
              onView={(booking) => {
                console.log('View booking:', booking);
              }}
              onDelete={handleDeleteBooking}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> sur{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      <AssignDriverModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
        }}
        booking={selectedBooking}
        availableDrivers={availableDrivers}
        onAssign={assignDriver}
        isLoading={false}
      />

      {/* Create/Edit Booking Modal */}
      <Modal
        isOpen={showCreateEditModal}
        onClose={() => {
          setShowCreateEditModal(false);
          setEditingBooking(null);
        }}
        title={editingBooking ? 'Modifier la réservation' : 'Créer une nouvelle réservation'}
        size="lg"
      >
        <BookingForm
          booking={editingBooking}
          users={users}
          onSubmit={handleSubmitBooking}
          onCancel={() => {
            setShowCreateEditModal(false);
            setEditingBooking(null);
          }}
          isLoading={false}
        />
      </Modal>
    </div>
  );
};

const BookingsManagement: React.FC = () => {
  return (
    <NotificationProvider>
      <BookingsManagementContent />
    </NotificationProvider>
  );
};

export default BookingsManagement;