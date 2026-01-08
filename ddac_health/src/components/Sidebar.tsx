'use client';

import React, { useState, useEffect } from 'react';
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
import { authAPI, authUtils, userInfoAPI } from '../lib/api';
import Image from 'next/image';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <Home className="w-5 h-5" />,
    roles: ['customer', 'doctor', 'admin'],
  },
  
  // Customer 
  {
    label: 'My Appointments',
    href: '/dashboard/book-appointments',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['customer'],
  },
  {
    label: 'Health Records',
    href: '/dashboard/health',
    icon: <Activity className="w-5 h-5" />,
    roles: ['customer'],
  },
  {
    label: 'Appoint History',
    href: '/dashboard/appointment_history',
    icon: <Users className="w-5 h-5" />,
    roles: ['customer'],
  },
  
  // Doctor 
  {
    label: 'Pending Appointments',
    href: '/dashboard/doctor/pending_appointment',
    icon: <Users className="w-5 h-5" />,
    roles: ['doctor'],
  },
  {
    label: 'Appointments HIstory',
    href: '/dashboard/doctor/appointment_history',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['doctor'],
  },
  {
    label: 'Summary Prescriptions',
    href: '/dashboard/doctor/summary',
    icon: <Pill className="w-5 h-5" />,
    roles: ['doctor'],
  },
  
  // Admin 
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
    href: '/dashboard/admin/summary',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin'],
  },

  {
    label: 'Profile',
    href: '/dashboard/profile',
    icon: <User className="w-5 h-5" />,
    roles: ['customer', 'doctor', 'admin'],
  },
];

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userPicture, setUserPicture] = useState<string | null>(null);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const currentRole = userRole || authUtils.getUserRole() || 'customer';

  // Load user picture
  useEffect(() => {
    const loadUserPicture = async () => {
      try {
        const userId = authUtils.getUserId();
        if (userId) {
          const result = await userInfoAPI.get(userId);
          if (result.success && result.data?.picture) {
            setUserPicture(result.data.picture);
          }
        }
      } catch (error) {
        console.error('Error loading user picture:', error);
      } finally {
        setIsLoadingPicture(false);
      }
    };

    loadUserPicture();
  }, []);

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(currentRole)
  );

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

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

          {/* User Info with Picture */}
          <div className="p-4 border-b border-blue-500">
            <Link 
              href="/dashboard/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 hover:bg-blue-700 p-2 rounded-lg transition-colors duration-200"
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                {isLoadingPicture ? (
                  // Loading skeleton
                  <div className="w-12 h-12 bg-blue-400 rounded-full animate-pulse" />
                ) : userPicture ? (
                  // User picture
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-300 bg-white">
                    <img
                      src={userPicture}
                      alt={userName || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-blue-400 flex items-center justify-center">
                              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  // Default icon
                  <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center border-2 border-blue-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-white">{userName || 'User'}</p>
                <p className="text-xs text-blue-200">{getRoleDisplayName(currentRole)}</p>
                <p className="text-xs text-blue-300 hover:text-blue-100 transition-colors">
                  View Profile →
                </p>
              </div>
            </Link>
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