'use client';

import React, { useEffect, useState } from 'react';
import { authUtils } from '../../lib/api';
import CustomerDashboard from '../../components/dashboard_component/CustomerDashboard';
import {
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

function StatCard({ title, value, icon, trend, trendUp, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!trendUp && 'rotate-180'}`} />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// 快捷操作卡片
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function QuickAction({ title, description, icon, href, color }: QuickActionProps) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all hover:scale-105"
    >
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}

// Doctor Dashboard Component
function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, Doctor!</h1>
        <p className="text-green-100">Your patients are waiting</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Appointments"
          value="8"
          icon={<Calendar className="w-6 h-6 text-white" />}
          trend="+3 from yesterday"
          trendUp={true}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Patients"
          value="45"
          icon={<Users className="w-6 h-6 text-white" />}
          trend="+5 this month"
          trendUp={true}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Reviews"
          value="6"
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Manage Appointments"
            description="Check today's appointments"
            icon={<Calendar className="w-6 h-6 text-white" />}
            href="/dashboard/doctor-appointments"
            color="bg-blue-500"
          />
          <QuickAction
            title="Pending Appointments"
            description="Manage your patients"
            icon={<Users className="w-6 h-6 text-white" />}
            href="/dashboard/patients"
            color="bg-green-500"
          />
          <QuickAction
            title="Appointments History"
            description="View appointment history"
            icon={<AlertCircle className="w-6 h-6 text-white" />}
            href="/dashboard/prescriptions"
            color="bg-orange-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity to display.</p>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">System overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Users"
          value="1,234"
          icon={<Users className="w-6 h-6 text-white" />}
          trend="+12% this month"
          trendUp={true}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Appointments"
          value="89"
          icon={<Calendar className="w-6 h-6 text-white" />}
          trend="+8% this week"
          trendUp={true}
          color="bg-green-500"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="User Management"
            description="Manage system users"
            icon={<Users className="w-6 h-6 text-white" />}
            href="/dashboard/user-management"
            color="bg-blue-500"
          />
          <QuickAction
            title="Appointments"
            description="Manage all appointments"
            icon={<Calendar className="w-6 h-6 text-white" />}
            href="/dashboard/appointments"
            color="bg-green-500"
          />
          <QuickAction
            title="Summary Reports"
            description="System performance metrics"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            href="/dashboard/analytics"
            color="bg-purple-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
        <p className="text-gray-600">All systems operational.</p>
      </div>
    </div>
  );
}

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
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 根据角色渲染不同的 Dashboard
  if (userRole === 'customer') {
    return <CustomerDashboard />;
  } else if (userRole === 'doctor') {
    return <DoctorDashboard />;
  } else if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return <CustomerDashboard />; // 默认显示 customer
}