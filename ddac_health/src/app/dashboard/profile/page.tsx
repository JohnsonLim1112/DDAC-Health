'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  Stethoscope,
  MapPin,
  Calendar,
  Award,
  FileText
} from 'lucide-react';
import { authUtils, userInfoAPI, usersAPI } from '../../../lib/api';
import { useRouter } from 'next/navigation';

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

interface LoginInfo {
  id: string;
  username: string;
  password: string;
  securityPassword: string;
  role: 'customer' | 'doctor' | 'admin';
}

export default function ProfilePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null);
  const [userInfoExists, setUserInfoExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userId = authUtils.getUserId();
      const userRole = authUtils.getRole();
      const userEmail = authUtils.getUserEmail();

      if (!userId) {
        router.push('/login');
        return;
      }

      // 设置登录信息
      setLoginInfo({
        id: userId,
        username: userEmail || '',
        password: '',
        securityPassword: '',
        role: (userRole as 'customer' | 'doctor' | 'admin') || 'customer'
      });

      // 加载用户详细信息
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
      console.error('Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userInfo || !loginInfo) return;

    // 验证医生必填字段
    if (loginInfo.role === 'doctor') {
      if (!userInfo.name || !userInfo.address) {
        alert('Please fill in Name and Address!');
        return;
      }
      if (!userInfo.specialization) {
        alert('Please fill in Specialization!');
        return;
      }
    }

    try {
      setIsSaving(true);

      // 1. 如果修改了密码，更新登录信息
      if (newPassword.trim()) {
        const userId = authUtils.getUserId();
        const updatedLogin = {
          ...loginInfo,
          password: newPassword
        };
        
        const loginResult = await usersAPI.update(userId!, [updatedLogin]);
        if (!loginResult.success) {
          alert('Failed to update password: ' + loginResult.message);
          return;
        }
      }

      // 2. 保存用户信息（如果有填写内容或者是医生）
      const shouldSaveUserInfo = userInfo.name || userInfo.address || loginInfo.role === 'doctor';

      if (shouldSaveUserInfo) {
        const userData: UserInfo = {
          userId: loginInfo.id,
          name: userInfo.name || '',
          gender: userInfo.gender || 'Male',
          age: userInfo.age || 25,
          address: userInfo.address || '',
          specialization: loginInfo.role === 'doctor' ? userInfo.specialization : '',
          experienceYears: loginInfo.role === 'doctor' ? userInfo.experienceYears : 0,
          bio: loginInfo.role === 'doctor' ? userInfo.bio : ''
        };

        let userResult;
        if (userInfoExists) {
          userResult = await userInfoAPI.update(userData);
        } else {
          userResult = await userInfoAPI.create(userData);
          setUserInfoExists(true);
        }

        if (!userResult.success) {
          alert('Failed to save profile: ' + userResult.message);
          return;
        }
      }

      alert('Profile updated successfully!');
      setNewPassword('');
      loadProfile(); // 刷新数据
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userInfo || !loginInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          My Profile
        </h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Account Information
          </h2>

          <div className="space-y-4">
            {/* Email - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={loginInfo.username}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Role - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <div className="px-4 py-2 border rounded-lg bg-gray-100">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  loginInfo.role === 'admin' ? 'bg-red-100 text-red-800' :
                  loginInfo.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {loginInfo.role.charAt(0).toUpperCase() + loginInfo.role.slice(1)}
                </span>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  placeholder="Leave empty to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-green-600" />
            Basic Information {loginInfo.role === 'doctor' ? '(Required)' : '(Optional)'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name {loginInfo.role === 'doctor' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Age
              </label>
              <input
                type="number"
                value={userInfo.age}
                onChange={(e) => setUserInfo({ ...userInfo, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="1"
                max="150"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address {loginInfo.role === 'doctor' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={userInfo.address}
                onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="123 Main Street, City, State"
              />
            </div>
          </div>
        </div>

        {/* Doctor Information - Only for doctors */}
        {loginInfo.role === 'doctor' && (
          <div className="bg-blue-50 rounded-xl shadow-md p-6 border-2 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Doctor Information (Required)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="w-4 h-4 inline mr-2" />
                  Specialization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userInfo.specialization}
                  onChange={(e) => setUserInfo({ ...userInfo, specialization: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="e.g., Cardiology, Pediatrics, General Practice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={userInfo.experienceYears}
                  onChange={(e) => setUserInfo({ ...userInfo, experienceYears: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  min="0"
                  max="50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Bio (Optional)
                </label>
                <textarea
                  value={userInfo.bio}
                  onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  rows={4}
                  placeholder="Brief description about yourself..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}