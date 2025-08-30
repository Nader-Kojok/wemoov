import { Car, Users, Truck, Zap } from 'lucide-react'

export interface Vehicle {
  id: number
  category: 'berline' | 'suv' | 'van' | 'luxe'
  name: string
  year?: number
  image: string
  capacity: number
  features: string[]
  priceRange: string
  rating: number
  description: string
}

export const vehicleCategories = [
  { id: 'berline', name: 'Berlines', count: 2, icon: Car },
  { id: 'suv', name: 'SUV', count: 3, icon: Truck },
  { id: 'van', name: 'Vans', count: 3, icon: Users },
  { id: 'luxe', name: 'Luxe', count: 2, icon: Zap }
]

export const vehicles: Vehicle[] = [
  {
    id: 1,
    category: 'berline',
    name: 'Citroen C-Elysee',
    year: 2023,
    image: '/citroen_c_elysee.png',
    capacity: 4,
    features: ['Climatisation', 'Bluetooth', 'Direction assistée', 'Sécurité'],
    priceRange: '12,000 - 18,000 FCFA',
    rating: 4.6,
    description: 'Économique et fiable pour vos trajets quotidiens'
  },
  {
    id: 2,
    category: 'berline',
    name: 'Peugeot 3008',
    year: 2023,
    image: '/peugeot_3008.png',
    capacity: 5,
    features: ['SUV Compact', 'Climatisation', 'GPS', 'Bluetooth'],
    priceRange: '18,000 - 25,000 FCFA',
    rating: 4.7,
    description: 'SUV compact français alliant style et praticité'
  },
  {
    id: 3,
    category: 'suv',
    name: 'Hyundai TUCSON',
    year: 2023,
    image: '/hyundai_tucson.png',
    capacity: 5,
    features: ['4x4', 'Climatisation', 'Sièges cuir', 'Système multimédia'],
    priceRange: '22,000 - 30,000 FCFA',
    rating: 4.8,
    description: 'SUV moderne avec technologie avancée'
  },
  {
    id: 4,
    category: 'suv',
    name: 'Pajero Sport',
    year: 2023,
    image: '/pajero_sport.png',
    capacity: 7,
    features: ['4x4', 'Robustesse', '7 places', 'Climatisation'],
    priceRange: '25,000 - 35,000 FCFA',
    rating: 4.7,
    description: 'SUV robuste pour tous terrains et familles'
  },
  {
    id: 5,
    category: 'luxe',
    name: 'BMW Série 5',
    year: 2022,
    image: '/bmw_serie_5.png',
    capacity: 4,
    features: ['Cuir premium', 'Système audio', 'GPS avancé', 'Confort luxe'],
    priceRange: '45,000 - 65,000 FCFA',
    rating: 4.9,
    description: 'Berline de luxe allemande pour un confort exceptionnel'
  },
  {
    id: 6,
    category: 'luxe',
    name: 'Mercedes Classe V',
    year: 2023,
    image: '/mercedes_class_v.png',
    capacity: 7,
    features: ['Luxe', 'Espace VIP', 'Climatisation zones', 'Cuir premium'],
    priceRange: '50,000 - 75,000 FCFA',
    rating: 5.0,
    description: 'Van de luxe pour voyages VIP et groupes premium'
  },
  {
    id: 7,
    category: 'van',
    name: 'Mercedes Sprinter',
    year: 2020,
    image: '/mercedes_class_v.png',
    capacity: 12,
    features: ['Grande capacité', 'Confort', 'Climatisation', 'Espace cargo'],
    priceRange: '25,000 - 40,000 FCFA',
    rating: 4.6,
    description: 'Van spacieux pour transport de groupes et marchandises'
  },
  {
    id: 8,
    category: 'van',
    name: 'Toyota HiAce',
    image: '/toyota_hiace.png',
    capacity: 14,
    features: ['Grande capacité', 'Fiabilité', 'Climatisation', 'Confort'],
    priceRange: '20,000 - 35,000 FCFA',
    rating: 4.5,
    description: 'Minibus fiable pour transport de groupes'
  },
  {
    id: 9,
    category: 'van',
    name: 'Toyota Coaster',
    image: '/toyota_coaster.png',
    capacity: 25,
    features: ['Bus', 'Climatisation', 'Confort groupe', 'Sécurité'],
    priceRange: '30,000 - 50,000 FCFA',
    rating: 4.4,
    description: 'Bus confortable pour grands groupes et excursions'
  },
  {
    id: 10,
    category: 'suv',
    name: 'Toyota RAV4',
    image: '/toyota_rav_4.png',
    capacity: 5,
    features: ['4x4', 'Fiabilité Toyota', 'Climatisation', 'Sécurité'],
    priceRange: '20,000 - 28,000 FCFA',
    rating: 4.7,
    description: 'SUV compact fiable et polyvalent'
  }
]

// Fonction utilitaire pour filtrer les véhicules par capacité
export const getVehiclesByCapacity = (minCapacity: number): Vehicle[] => {
  return vehicles.filter(vehicle => vehicle.capacity >= minCapacity)
}

// Fonction utilitaire pour obtenir les véhicules par catégorie
export const getVehiclesByCategory = (category: string): Vehicle[] => {
  return vehicles.filter(vehicle => vehicle.category === category)
}

// Fonction utilitaire pour obtenir un véhicule par ID
export const getVehicleById = (id: number): Vehicle | undefined => {
  return vehicles.find(vehicle => vehicle.id === id)
}