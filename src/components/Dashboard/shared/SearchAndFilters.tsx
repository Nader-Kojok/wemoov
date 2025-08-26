import React from 'react';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchAndFiltersProps {
  searchTerm: string;
  availabilityFilter: string;
  typeFilter?: string;
  onSearchChange: (value: string) => void;
  onAvailabilityChange: (value: string) => void;
  onTypeChange?: (value: string) => void;
  showTypeFilter?: boolean;
  searchPlaceholder?: string;
  customFilters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  availabilityFilter,
  typeFilter = '',
  onSearchChange,
  onAvailabilityChange,
  onTypeChange,
  showTypeFilter = false,
  searchPlaceholder = 'Rechercher...',
  customFilters = []
}) => {
  const vehicleTypeOptions: FilterOption[] = [
    { value: '', label: 'Tous les types' },
    { value: 'SEDAN', label: 'Berline' },
    { value: 'SUV', label: 'SUV' },
    { value: 'VAN', label: 'Van' },
    { value: 'LUXURY', label: 'Luxe' }
  ];

  const availabilityOptions: FilterOption[] = [
    { value: '', label: 'Toutes les disponibilités' },
    { value: 'true', label: 'Disponible' },
    { value: 'false', label: 'Non disponible' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Availability Filter */}
        <select
          value={availabilityFilter}
          onChange={(e) => onAvailabilityChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {availabilityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Vehicle Type Filter */}
        {showTypeFilter && onTypeChange && (
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {vehicleTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Custom Filters */}
        {customFilters.map((filter, index) => (
          <select
            key={index}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
};

export default SearchAndFilters;