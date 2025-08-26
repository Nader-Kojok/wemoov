import React, { useState, useEffect } from 'react';
import { Plus, Car, User } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

// Import new modular components
import Modal from './shared/Modal';
import SearchAndFilters from './shared/SearchAndFilters';
import DriversTable from './tables/DriversTable';
import VehiclesTable from './tables/VehiclesTable';
import DriverForm from './forms/DriverForm';
import VehicleForm from './forms/VehicleForm';
import VehicleAssignmentModal from './modals/VehicleAssignmentModal';
import { NotificationProvider } from './shared/NotificationSystem';

// Import types
import type { 
  Driver, 
  Vehicle, 
  User as UserType, 
  DriverFormData, 
  VehicleFormData 
} from '../../types/dashboard';

const DriversVehiclesManagementContent: React.FC = () => {
  // Main state
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage] = useState(1);
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Modal state
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'drivers') {
      fetchDrivers();
    } else {
      fetchVehicles();
    }
    fetchUsers();
  }, [activeTab, currentPage, debouncedSearchTerm, availabilityFilter, typeFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/users?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(availabilityFilter && { available: availabilityFilter })
      });

      const response = await fetch(`/api/dashboard/drivers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des chauffeurs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(availabilityFilter && { available: availabilityFilter }),
        ...(typeFilter && { type: typeFilter })
      });

      const response = await fetch(`/api/dashboard/vehicles?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/vehicles?available=true&limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableVehicles(data.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des véhicules disponibles:', err);
    }
  };

  // Driver CRUD operations
  const handleCreateDriver = () => {
    setEditingDriver(null);
    setShowDriverModal(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setShowDriverModal(true);
  };

  const handleDeleteDriver = async (driverId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/drivers/${driverId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du chauffeur');
      }

      fetchDrivers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleSubmitDriver = async (formData: DriverFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingDriver 
        ? `/api/dashboard/drivers/${editingDriver.id}`
        : '/api/dashboard/drivers';
      
      const method = editingDriver ? 'PUT' : 'POST';

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
        const errorMessage = errorData.error?.message || 'Erreur lors de la sauvegarde du chauffeur';
        throw new Error(errorMessage);
      }

      setShowDriverModal(false);
      setEditingDriver(null);
      fetchDrivers();
    } catch (err) {
      throw err; // Re-throw to let the form handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Vehicle CRUD operations
  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du véhicule');
      }

      fetchVehicles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleSubmitVehicle = async (formData: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingVehicle 
        ? `/api/dashboard/vehicles/${editingVehicle.id}`
        : '/api/dashboard/vehicles';
      
      const method = editingVehicle ? 'PUT' : 'POST';

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
        const errorMessage = errorData.error?.message || 'Erreur lors de la sauvegarde du véhicule';
        throw new Error(errorMessage);
      }

      setShowVehicleModal(false);
      setEditingVehicle(null);
      fetchVehicles();
    } catch (err) {
      throw err; // Re-throw to let the form handle the error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    // TODO: Implement vehicle details view
    console.log('View vehicle:', vehicle);
  };

  // Vehicle assignment
  const handleAssignVehicle = (driver: Driver) => {
    setSelectedDriver(driver);
    fetchAvailableVehicles();
    setShowAssignModal(true);
  };

  const handleVehicleAssignment = async (vehicleId: string | null) => {
    if (!selectedDriver) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/drivers/${selectedDriver.id}/assign-vehicle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vehicleId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'assignation');
      }

      fetchDrivers();
      setShowAssignModal(false);
      setSelectedDriver(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  if (loading && (drivers.length === 0 && vehicles.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Chauffeurs & Véhicules</h1>
          <p className="text-gray-600 mt-1">Gérez les chauffeurs, véhicules et leurs assignations</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={activeTab === 'drivers' ? handleCreateDriver : handleCreateVehicle}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'drivers' ? 'Créer un chauffeur' : 'Créer un véhicule'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('drivers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'drivers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Chauffeurs
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'vehicles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Car className="h-4 w-4 inline mr-2" />
            Véhicules
          </button>
        </nav>
      </div>

      {/* Filters */}
      <SearchAndFilters
        searchTerm={searchTerm}
        availabilityFilter={availabilityFilter}
        typeFilter={typeFilter}
        onSearchChange={setSearchTerm}
        onAvailabilityChange={setAvailabilityFilter}
        onTypeChange={setTypeFilter}
        showTypeFilter={activeTab === 'vehicles'}
        searchPlaceholder={activeTab === 'drivers' ? 'Rechercher un chauffeur...' : 'Rechercher un véhicule...'}
      />

      {/* Content */}
      {activeTab === 'drivers' ? (
        <DriversTable
          drivers={drivers}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
          onAssignVehicle={handleAssignVehicle}
          isLoading={loading}
        />
      ) : (
        <VehiclesTable
          vehicles={vehicles}
          onEdit={handleEditVehicle}
          onDelete={handleDeleteVehicle}
          onView={handleViewVehicle}
          isLoading={loading}
        />
      )}

      {/* Driver Modal */}
      <Modal
        isOpen={showDriverModal}
        onClose={() => {
          setShowDriverModal(false);
          setEditingDriver(null);
        }}
        title={editingDriver ? 'Modifier le chauffeur' : 'Créer un nouveau chauffeur'}
        size="md"
      >
        <DriverForm
          driver={editingDriver}
          users={users}
          vehicles={vehicles}
          onSubmit={handleSubmitDriver}
          onCancel={() => {
            setShowDriverModal(false);
            setEditingDriver(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Vehicle Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => {
          setShowVehicleModal(false);
          setEditingVehicle(null);
        }}
        title={editingVehicle ? 'Modifier le véhicule' : 'Créer un nouveau véhicule'}
        size="lg"
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={handleSubmitVehicle}
          onCancel={() => {
            setShowVehicleModal(false);
            setEditingVehicle(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Vehicle Assignment Modal */}
      <VehicleAssignmentModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedDriver(null);
        }}
        driver={selectedDriver}
        availableVehicles={availableVehicles}
        onAssign={handleVehicleAssignment}
        isLoading={isSubmitting}
      />
    </div>
  );
};

const DriversVehiclesManagement: React.FC = () => {
  return (
    <NotificationProvider>
      <DriversVehiclesManagementContent />
    </NotificationProvider>
  );
};

export default DriversVehiclesManagement;