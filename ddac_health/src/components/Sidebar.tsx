'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Calendar,
  User,
  Users,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Activity,
  ClipboardList,
  Pill,
  Heart,
  UserCog,
  BarChart3,
} from 'lucide-react';
import { authAPI, authUtils } from '../lib/api';

// 定义菜单项类型
interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[]; // 哪些角色可以看到这个菜单
}

// 所有菜单配置
const menuItems: MenuItem[] = [
  // 通用菜单
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    roles: ['customer', 'doctor', 'admin'],
  },
  
  // Customer 专属
  {
    label: 'My Appointments',
    href: '/dashboard/book-appointments',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['customer'],
  },
  {
    label: 'Health Records',
    href: '/dashboard/health-records',
    icon: <Activity className="w-5 h-5" />,
    roles: ['customer'],
  },
  {
    label: 'Appoint History',
    href: '/dashboard/history',
    icon: <Users className="w-5 h-5" />,
    roles: ['customer'],
  },
  
  // Doctor 专属
  {
    label: 'Pending Appointments',
    href: '/dashboard/pending-appointments',
    icon: <Users className="w-5 h-5" />,
    roles: ['doctor'],
  },
  {
    label: 'Appointments HIstory',
    href: '/dashboard/history-appointments',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['doctor'],
  },
  {
    label: 'Summary Prescriptions',
    href: '/dashboard/prescriptions',
    icon: <Pill className="w-5 h-5" />,
    roles: ['doctor'],
  },
  
  
  // Admin 专属
  {
    label: 'User Management',
    href: '/dashboard/admin/user-management',
    icon: <UserCog className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'All Appointments',
    href: '/dashboard/admin/appointments',
    icon: <ClipboardList className="w-5 h-5" />,
    roles: ['admin'],
  },
  {
    label: 'Summary Reports',
    href: '/dashboard/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin'],
  },
 
  
  // 通用设置
  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: <User className="w-5 h-5" />,
    roles: ['customer', 'doctor', 'admin'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['customer', 'doctor'],
  },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 获取当前用户角色（从 props 或 localStorage）
  const currentRole = userRole || authUtils.getUserRole() || 'customer';

  // 根据角色过滤菜单
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(currentRole)
  );

  // 处理登出
  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      customer: 'Patient',
      doctor: 'Doctor',
      admin: 'Administrator',
    };
    return roleNames[role] || role;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HLife</h1>
                <p className="text-xs text-blue-200">Health Management</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-blue-500">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{userName || 'User'}</p>
                <p className="text-xs text-blue-200">{getRoleDisplayName(currentRole)}</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-white text-blue-600 shadow-lg'
                            : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                        }
                      `}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-blue-500">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg
                       text-blue-100 hover:bg-red-500 hover:text-white
                       transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}