'use client';

import React, { useEffect, useState } from 'react';
import { authUtils } from '../../lib/api';
import CustomerDashboard from '../../components/dashboard_component/CustomerDashboard';
import DoctorDashboard from '../../components/dashboard_component/DoctorDashboard';
import AdminDashboard from '../../components/dashboard_component/AdminDashboard';

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = authUtils.getUserRole();
    setUserRole(role || 'customer');
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }


  if (userRole === 'customer') {
    return <CustomerDashboard />;
  } else if (userRole === 'doctor') {
    return <DoctorDashboard />;
  } else if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return <CustomerDashboard />; 
}