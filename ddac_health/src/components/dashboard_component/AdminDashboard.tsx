import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  Stethoscope,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { usersAPI, appointmentsAPI, authUtils } from '../../lib/api';

interface User {
  id: string;
  username: string;
  role: string;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  status: string;
  createTime: string;
}


interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}


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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const adminId = authUtils.getUserId();
      
      
      const usersResult = await usersAPI.getAll(adminId!);
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }

     
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/book/GetAll`);
        const appointmentsResult = await response.json();
        if (appointmentsResult.success && appointmentsResult.data) {
          setAppointments(appointmentsResult.data);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
      
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.createTime);
    return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
  });

  const stats = {
    totalUsers: users.length,
    totalCustomers: users.filter(u => u.role === 'customer').length,
    totalDoctors: users.filter(u => u.role === 'doctor').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    thisMonthAppointments: thisMonthAppointments.length,
    totalAppointments: appointments.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">System overview and management</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-blue-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="w-6 h-6 text-white" />}
          color="bg-green-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<Stethoscope className="w-6 h-6 text-white" />}
          color="bg-purple-500"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon={<Shield className="w-6 h-6 text-white" />}
          color="bg-red-500"
          isLoading={isLoading}
        />
      </div>

      {/* 用户角色分布 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">User Distribution</h2>
        {isLoading ? (
          <div className="h-32 bg-gray-200 animate-pulse rounded"></div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.totalCustomers}</p>
              <p className="text-sm text-gray-600 mt-1">Customers</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.totalCustomers / stats.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.totalDoctors}</p>
              <p className="text-sm text-gray-600 mt-1">Doctors</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.totalDoctors / stats.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.totalAdmins}</p>
              <p className="text-sm text-gray-600 mt-1">Admins</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.totalAdmins / stats.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="User Management"
            description="Manage system users"
            icon={<Users className="w-6 h-6 text-white" />}
            href="/dashboard/admin/user-management"
            color="bg-blue-500"
          />
          <QuickAction
            title="View All Appointments"
            description="Manage all appointments"
            icon={<Calendar className="w-6 h-6 text-white" />}
            href="/dashboard/admin/appointments"
            color="bg-green-500"
          />
          <QuickAction
            title="System Reports"
            description="View system analytics"
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            href="/dashboard/admin/reports"
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Users</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.id.substring(0, 8)}...</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}