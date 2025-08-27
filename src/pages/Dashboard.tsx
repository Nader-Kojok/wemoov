import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import UsersManagement from '../components/Dashboard/UsersManagement';
import BookingsManagement from '../components/Dashboard/BookingsManagement';
import DriversVehiclesManagement from '../components/Dashboard/DriversVehiclesManagement';
import PaymentsManagement from '../components/Dashboard/PaymentsManagement';
import AnalyticsManagement from '../components/Dashboard/AnalyticsManagement';
import DatabaseManagement from '../components/Dashboard/DatabaseManagement';
import SettingsManagement from '../components/Dashboard/SettingsManagement';

const Dashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="bookings" element={<BookingsManagement />} />
        <Route path="drivers" element={<DriversVehiclesManagement />} />
        <Route path="payments" element={<PaymentsManagement />} />
        <Route path="analytics" element={<AnalyticsManagement />} />
        <Route path="database" element={<DatabaseManagement />} />
        <Route path="settings" element={<SettingsManagement />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;