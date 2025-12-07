import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
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

interface DoctorInfo {
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
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [isLoadingDoctorInfo, setIsLoadingDoctorInfo] = useState(false);

  // 当用户改变时，加载医生资料
  useEffect(() => {
    if (user) {
      setEditingUser({ ...user });
      
      // 如果是医生，加载医生资料
      if (user.role === 'doctor') {
        loadDoctorInfo(user.id);
      } else {
        setDoctorInfo(null);
      }
    }
  }, [user]);

  const loadDoctorInfo = async (userId: string) => {
    try {
      setIsLoadingDoctorInfo(true);
      const result = await userInfoAPI.get(userId);
      
      if (result.success && result.data) {
        setDoctorInfo({
          userId: result.data.userId,
          name: result.data.name || '',
          gender: result.data.gender || 'Male',
          age: result.data.age || 30,
          address: result.data.address || '',
          specialization: result.data.specialization || '',
          experienceYears: result.data.experienceYears || 0,
          bio: result.data.bio || ''
        });
      } else {
        // 如果没有医生资料，创建一个空的
        setDoctorInfo({
          userId: userId,
          name: '',
          gender: 'Male',
          age: 30,
          address: '',
          specialization: '',
          experienceYears: 0,
          bio: ''
        });
      }
    } catch (error) {
      console.error('Error loading doctor info:', error);
      setDoctorInfo({
        userId: userId,
        name: '',
        gender: 'Male',
        age: 30,
        address: '',
        specialization: '',
        experienceYears: 0,
        bio: ''
      });
    } finally {
      setIsLoadingDoctorInfo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    // 验证：如果是医生，必须填写医生资料
    if (editingUser.role === 'doctor' && doctorInfo) {
      if (!doctorInfo.name || !doctorInfo.specialization || !doctorInfo.address) {
        alert('Please fill in all required doctor information!');
        return;
      }
    }

    try {
      const adminId = authUtils.getUserId();
      
      // 1. 更新用户账号
      const updateUserResult = await usersAPI.update(adminId!, [editingUser]);
      
      if (updateUserResult.message !== 'User updated') {
        alert(updateUserResult.message || 'Failed to update user');
        return;
      }

      // 2. 如果是医生，更新/创建医生资料
      if (editingUser.role === 'doctor' && doctorInfo) {
        const doctorData = {
          userId: editingUser.id,
          name: doctorInfo.name,
          gender: doctorInfo.gender,
          age: doctorInfo.age,
          address: doctorInfo.address,
          specialization: doctorInfo.specialization,
          experienceYears: doctorInfo.experienceYears,
          bio: doctorInfo.bio
        };

        // UserInfo 用 userId 作主键，直接 insert 或 update
        const doctorResult = await userInfoAPI.create(doctorData);

        if (!doctorResult.success) {
          alert('User updated but failed to save doctor info: ' + doctorResult.message);
          return;
        }
      }

      alert('User updated successfully!');
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
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

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (optional)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={editingUser.password}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
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

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={editingUser.role}
              onChange={(e) => {
                const newRole = e.target.value as 'customer' | 'doctor' | 'admin';
                setEditingUser({ ...editingUser, role: newRole });
                
                // 如果改成医生，加载医生资料
                if (newRole === 'doctor' && !doctorInfo) {
                  loadDoctorInfo(editingUser.id);
                }
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="customer">Customer</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Doctor Info - Only show when role is doctor */}
          {editingUser.role === 'doctor' && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Doctor Information (Required)
              </h3>
              
              {isLoadingDoctorInfo ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading doctor info...</p>
                </div>
              ) : doctorInfo ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={doctorInfo.name}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      value={doctorInfo.gender}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, gender: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                    <input
                      type="number"
                      value={doctorInfo.age}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, age: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      min="25"
                      max="80"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (years) *
                    </label>
                    <input
                      type="number"
                      value={doctorInfo.experienceYears}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, experienceYears: parseInt(e.target.value) })}
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
                      value={doctorInfo.specialization}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, specialization: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., Cardiology, Pediatrics, General Practice"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={doctorInfo.address}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Clinic/Hospital address"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio (Optional)
                    </label>
                    <textarea
                      value={doctorInfo.bio}
                      onChange={(e) => setDoctorInfo({ ...doctorInfo, bio: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      placeholder="Brief description about the doctor..."
                    />
                  </div>
                </div>
              ) : null}
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