import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Stethoscope, User, Lock, Edit } from 'lucide-react';
import { authUtils, userInfoAPI, usersAPI } from '../../../../lib/api';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  username: string;
  password: string;
  securityPassword: string;
  role: 'customer' | 'doctor' | 'admin';
}

interface UserInfo {
  userId: string;
  name: string;
  gender: string;
  age: number;
  address: string;
  specialization: string;
  experienceYears: number;
  bio: string;
}

export default function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const [userInfoExists, setUserInfoExists] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);  
  const [newPassword, setNewPassword] = useState('');  

  useEffect(() => {
    if (user) {
      
      setEditingUser({ 
        ...user, 
        password: '' 
      });
      loadUserInfo(user.id);
      setShowPasswordChange(false);
      setNewPassword('');
    }
  }, [user]);

  const loadUserInfo = async (userId: string) => {
    try {
      setIsLoadingUserInfo(true);
      const result = await userInfoAPI.get(userId);
      
      if (result.success && result.data) {
        setUserInfoExists(true);
        setUserInfo({
          userId: result.data.userId,
          name: result.data.name || '',
          gender: result.data.gender || 'Male',
          age: result.data.age || 25,
          address: result.data.address || '',
          specialization: result.data.specialization || '',
          experienceYears: result.data.experienceYears || 0,
          bio: result.data.bio || ''
        });
      } else {
        setUserInfoExists(false);
        setUserInfo({
          userId: userId,
          name: '',
          gender: 'Male',
          age: 25,
          address: '',
          specialization: '',
          experienceYears: 0,
          bio: ''
        });
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setUserInfoExists(false);
      setUserInfo({
        userId: userId,
        name: '',
        gender: 'Male',
        age: 25,
        address: '',
        specialization: '',
        experienceYears: 0,
        bio: ''
      });
    } finally {
      setIsLoadingUserInfo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editingUser || !userInfo) return;

  
  if (editingUser.role === 'doctor') {
    if (!userInfo.name?.trim()) {
      alert('Doctor name is required!');
      return;
    }
    if (!userInfo.address?.trim()) {
      alert('Doctor address is required!');
      return;
    }
    if (!userInfo.specialization?.trim()) {
      alert('Specialization is required for doctors!');
      return;
    }
  }

  const shouldSaveUserInfo = userInfo.name || userInfo.address || editingUser.role === 'doctor';

  try {
    const adminId = authUtils.getUserId();
    if (!adminId) {
      alert('Admin session expired');
      return;
    }

  
    const isChangingPassword = showPasswordChange && newPassword.trim() !== '';

    
    const userToUpdate: User = {
      id: editingUser.id,
      username: editingUser.username,
      password: isChangingPassword ? newPassword : user!.password, 
      securityPassword: editingUser.securityPassword,
      role: editingUser.role
    };

   
    const updateUserResult = await usersAPI.update(
      adminId,
      [userToUpdate],
      { changePassword: isChangingPassword }  
    );

    if (updateUserResult.message !== 'User updated') {
      alert(updateUserResult.message || 'Failed to update user account');
      return;
    }

  
    if (shouldSaveUserInfo) {
      const userData: UserInfo = {
        userId: editingUser.id,
        name: userInfo.name || '',
        gender: userInfo.gender || 'Male',
        age: userInfo.age || 25,
        address: userInfo.address || '',
        specialization: editingUser.role === 'doctor' ? userInfo.specialization : '',
        experienceYears: editingUser.role === 'doctor' ? userInfo.experienceYears : 0,
        bio: editingUser.role === 'doctor' ? userInfo.bio : ''
      };

      const userInfoResult = userInfoExists
        ? await userInfoAPI.update(userData)
        : await userInfoAPI.create(userData);

      if (!userInfoResult.success) {
        alert('Account updated but failed to save profile info');
      
      }
    }

    alert('User updated successfully!');
    onSuccess();
    onClose();
  } catch (error) {
    console.error('Error updating user:', error);
    alert('Update failed, please try again');
  }
};

  if (!isOpen || !editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Edit User</h2>
          <p className="text-gray-600 mt-1">Update user information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={editingUser.username}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* ✅ Password Change Button/Section */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            {!showPasswordChange ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Current password is hidden for security</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    New Password
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setNewPassword('');
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Cancel Change
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-yellow-700">
                  ⚠️ The user's password will be updated immediately after saving
                </p>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={editingUser.role}
              onChange={(e) => {
                const newRole = e.target.value as 'customer' | 'doctor' | 'admin';
                setEditingUser({ ...editingUser, role: newRole });
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="customer">Customer</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Basic User Info - For ALL roles */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Basic Information {editingUser.role === 'doctor' ? '(Required)' : '(Optional)'}
              {userInfoExists && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Existing</span>
              )}
              {!userInfoExists && userInfo && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">New</span>
              )}
            </h3>
            
            {isLoadingUserInfo ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading user info...</p>
              </div>
            ) : userInfo ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name {editingUser.role === 'doctor' && '*'}
                  </label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="John Doe"
                    required={editingUser.role === 'doctor'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={userInfo.gender}
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={userInfo.age}
                    onChange={(e) => setUserInfo({ ...userInfo, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="1"
                    max="150"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address {editingUser.role === 'doctor' && '*'}
                  </label>
                  <input
                    type="text"
                    value={userInfo.address}
                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="123 Main Street, City"
                    required={editingUser.role === 'doctor'}
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Doctor-specific Info - Only for doctors */}
          {editingUser.role === 'doctor' && userInfo && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                Doctor Specialization (Required)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years) *
                  </label>
                  <input
                    type="number"
                    value={userInfo.experienceYears}
                    onChange={(e) => setUserInfo({ ...userInfo, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    max="50"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    value={userInfo.specialization}
                    onChange={(e) => setUserInfo({ ...userInfo, specialization: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Cardiology, Pediatrics, General Practice"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={userInfo.bio}
                    onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Brief description about the doctor..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}