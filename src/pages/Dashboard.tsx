import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import UsersManagement from '../components/Dashboard/UsersManagement';
import BookingsManagement from '../components/Dashboard/BookingsManagement';
import DriversVehiclesManagement from '../components/Dashboard/DriversVehiclesManagement';
import DatabaseManagement from '../components/Dashboard/DatabaseManagement';

// Composant temporaire pour les pages non encore implémentées
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="bookings" element={<BookingsManagement />} />
        <Route path="drivers" element={<DriversVehiclesManagement />} />
        <Route path="payments" element={<ComingSoon title="Gestion des Paiements" />} />
        <Route path="analytics" element={<ComingSoon title="Statistiques Avancées" />} />
        <Route path="database" element={<DatabaseManagement />} />
        <Route path="settings" element={<ComingSoon title="Paramètres" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;