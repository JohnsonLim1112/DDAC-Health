'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Edit, Search, Shield, Stethoscope, Eye } from 'lucide-react';
import { authUtils, usersAPI } from '../../../../lib/api';
import CreateUserModal from '../components/CreateUserModal';
import EditUserModal from '../components/EditUserModal';
import ViewUserInfoModal from '../components/ViewUserInfoModal';

interface User {
  id: string;
  username: string;
  password: string;
  securityPassword: string;
  role: 'customer' | 'doctor' | 'admin';
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const adminId = authUtils.getUserId();
      const result = await usersAPI.getAll(adminId!);
      
      if (result.success && result.data) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewClick = (user: User) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const result = await usersAPI.delete(userId);
      if (result.success) {
        alert('User deleted successfully!');
        fetchUsers();
      } else {
        alert(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  useEffect(() => {
    let filtered = users;
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'customer').length}</p>
            </div>
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doctors</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'doctor').length}</p>
            </div>
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <Shield className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-gray-600">{user.id}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewClick(user)} 
                        className="text-purple-600 hover:text-purple-900"
                        title="View Info"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(user)} 
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchUsers}
      />

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={showEditModal}
        user={editingUser}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSuccess={fetchUsers}
      />

      {/* View User Info Modal */}
      <ViewUserInfoModal 
        isOpen={showViewModal}
        user={viewingUser}
        onClose={() => {
          setShowViewModal(false);
          setViewingUser(null);
        }}
      />
    </div>
  );
}