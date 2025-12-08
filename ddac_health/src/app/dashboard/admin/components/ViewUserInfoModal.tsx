import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Calendar, MapPin, Stethoscope, Award, FileText } from 'lucide-react';
import { userInfoAPI } from '../../../../lib/api';

interface ViewUserInfoModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
}

interface User {
  id: string;
  username: string;
  role: 'customer' | 'doctor' | 'admin';
}

interface UserInfo {
  userId: string;
  name: string;
  gender: string;
  age: number;
  address: string;
  specialization?: string;
  experienceYears?: number;
  bio?: string;
}

export default function ViewUserInfoModal({ isOpen, user, onClose }: ViewUserInfoModalProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserInfo(user.id);
    }
  }, [isOpen, user]);

  const loadUserInfo = async (userId: string) => {
    try {
      setIsLoading(true);
      const result = await userInfoAPI.get(userId);
      
      if (result.success && result.data) {
        setUserInfo(result.data);
      } else {
        setUserInfo(null);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">User Information</h2>
            <p className="text-blue-100 mt-1">Detailed user profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Account Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Account Information
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Role</p>
                  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">User ID</p>
                  <p className="font-mono text-sm text-gray-900 break-all">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user information...</p>
            </div>
          ) : userInfo ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Personal Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-900">{userInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{userInfo.gender}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">{userInfo.age} years old</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{userInfo.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Information - Only for doctors */}
              {user.role === 'doctor' && userInfo.specialization && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Doctor Information
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Stethoscope className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Specialization</p>
                        <p className="font-medium text-gray-900">{userInfo.specialization}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Experience</p>
                        <p className="font-medium text-gray-900">{userInfo.experienceYears} years</p>
                      </div>
                    </div>

                    {userInfo.bio && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Bio</p>
                          <p className="font-medium text-gray-900">{userInfo.bio}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No additional information available</p>
              <p className="text-gray-500 text-sm mt-2">This user hasn't completed their profile yet.</p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}