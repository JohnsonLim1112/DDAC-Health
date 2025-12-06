'use client';

import React, { useEffect, useState } from 'react';

// import DashboardLayout from './layout';
import { authUtils } from '../../lib/api';
import {
  Calendar,
  Users,
  Activity,
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

const userData = JSON.parse(localStorage.getItem('userData') || '{}');
console.log('userData:', userData);
console.log('LoginId:', userData.LoginId);
console.log('LoginRole:', userData.LoginRole);
console.log('LoginRole type:', typeof userData.LoginRole);
console.log('LoginRole === "customer":', userData.LoginRole === "customer");

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

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = authUtils.getUserRole();
    setUserRole(role || 'customer');
  }, []);

  // 根据角色显示不同的欢迎信息
  const getWelcomeMessage = () => {
    const messages: Record<string, { title: string; subtitle: string }> = {
      customer: {
        title: 'Welcome Back!',
        subtitle: 'Manage your health and appointments',
      },
      doctor: {
        title: 'Welcome, Doctor!',
        subtitle: 'Your patients are waiting',
      },
      admin: {
        title: 'Admin Dashboard',
        subtitle: 'System overview and management',
      },
    };
    return messages[userRole] || messages.customer;
  };

  // 根据角色显示不同的统计数据
  const getStatsForRole = () => {
    if (userRole === 'customer') {
      return [
        {
          title: 'Upcoming Appointments',
          value: '3',
          icon: <Calendar className="w-6 h-6 text-white" />,
          trend: '+2 this week',
          trendUp: true,
          color: 'bg-blue-500',
        },
        {
          title: 'Health Records',
          value: '12',
          icon: <Activity className="w-6 h-6 text-white" />,
          trend: '+1 new',
          trendUp: true,
          color: 'bg-green-500',
        },
        {
          title: 'Active Doctors',
          value: '2',
          icon: <Users className="w-6 h-6 text-white" />,
          color: 'bg-purple-500',
        },
      ];
    } else if (userRole === 'doctor') {
      return [
        {
          title: 'Today\'s Appointments',
          value: '8',
          icon: <Calendar className="w-6 h-6 text-white" />,
          trend: '+3 from yesterday',
          trendUp: true,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Patients',
          value: '45',
          icon: <Users className="w-6 h-6 text-white" />,
          trend: '+5 this month',
          trendUp: true,
          color: 'bg-green-500',
        },
        {
          title: 'Pending Reviews',
          value: '6',
          icon: <Clock className="w-6 h-6 text-white" />,
          color: 'bg-orange-500',
        },
      ];
    } else if (userRole === 'admin') {
      return [
        {
          title: 'Total Users',
          value: '1,234',
          icon: <Users className="w-6 h-6 text-white" />,
          trend: '+12% this month',
          trendUp: true,
          color: 'bg-blue-500',
        },
        {
          title: 'Total Appointments',
          value: '89',
          icon: <Calendar className="w-6 h-6 text-white" />,
          trend: '+8% this week',
          trendUp: true,
          color: 'bg-green-500',
        },
      
      ];
    }
    return [];
  };

  // 根据角色显示不同的快捷操作
  const getQuickActionsForRole = () => {
    if (userRole === 'customer') {
      return [
        {
          title: 'Book Appointment',
          description: 'Schedule a visit with your doctor',
          icon: <Calendar className="w-6 h-6 text-white" />,
          href: '/dashboard/appointments/new',
          color: 'bg-blue-500',
        },
        {
          title: 'View Records',
          description: 'Check your health history',
          icon: <Activity className="w-6 h-6 text-white" />,
          href: '/dashboard/health-records',
          color: 'bg-green-500',
        },
        {
          title: 'Personal health',
          description: 'Manage your health profile',
          icon: <Users className="w-6 h-6 text-white" />,
          href: '/dashboard/health',
          color: 'bg-purple-500',
        },
      ];
    } else if (userRole === 'doctor') {
      return [
        {
          title: 'Manage Appointments',
          description: 'Check today\'s appointments',
          icon: <Calendar className="w-6 h-6 text-white" />,
          href: '/dashboard/doctor-appointments',
          color: 'bg-blue-500',
        },
        {
          title: 'Pending Appointments',
          description: 'Manage your patients',
          icon: <Users className="w-6 h-6 text-white" />,
          href: '/dashboard/patients',
          color: 'bg-green-500',
        },
        {
          title: 'Appointments History',
          description: 'Write new prescriptions',
          icon: <AlertCircle className="w-6 h-6 text-white" />,
          href: '/dashboard/prescriptions',
          color: 'bg-orange-500',
        },
      ];
    } else if (userRole === 'admin') {
      return [
       {
      title: 'User Management',
      description: 'Manage system users',
      icon: <Users className="w-6 h-6 text-white" />,
      href: '/dashboard/user-management',  // ✅ 正确路径
      color: 'bg-blue-500',
    },
        {
          title: 'Appointment',
          description: 'Manage your appointments',
          icon: <TrendingUp className="w-6 h-6 text-white" />,
          href: '/dashboard/appointments',
          color: 'bg-green-500',
        },

        {
          title: 'Summary Reports',
          description: 'System performance metrics',
          icon: <TrendingUp className="w-6 h-6 text-white" />,
          href: '/dashboard/analytics',
          color: 'bg-green-500',
        },


        
      ];
    }
    return [];
  };

  const welcomeMessage = getWelcomeMessage();
  const stats = getStatsForRole();
  const quickActions = getQuickActionsForRole();

  return (
   
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{welcomeMessage.title}</h1>
        <p className="text-blue-100">{welcomeMessage.subtitle}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-gray-600">No recent activity to display.</p>
      </div>
    </div>
  );
}