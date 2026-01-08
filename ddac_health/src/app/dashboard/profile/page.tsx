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
  FileText,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { authUtils, userInfoAPI, authAPI } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface UserInfo {
  userId: string;
  name: string;
  gender: string;
  age: number;
  address: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  picture: string;
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
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [isSecurityVerified, setIsSecurityVerified] = useState(false);
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

      setLoginInfo({
        id: userId,
        username: userEmail || '',
        password: '',
        securityPassword: '',
        role: (userRole as 'customer' | 'doctor' | 'admin') || 'customer'
      });

      const result = await userInfoAPI.get(userId);
      
      // 🔍 DEBUG: 打印完整的 API 响应
      console.log('🔍 API Response:', result);
      console.log('🔍 Picture from API:', result.data?.picture);
      
      if (result.success && result.data) {
        setUserInfoExists(true);
        const pictureUrl = result.data.picture || '';
        
        // 🔍 DEBUG: 打印图片 URL
        console.log('🔍 Setting picture URL:', pictureUrl);
        
        setUserInfo({
          userId: result.data.userId,
          name: result.data.name || '',
          gender: result.data.gender || 'Male',
          age: result.data.age || 25,
          address: result.data.address || '',
          specialization: result.data.specialization || '',
          experienceYears: result.data.experienceYears || 0,
          bio: result.data.bio || '',
          picture: pictureUrl
        });
        
        // Set image preview if picture exists
        if (pictureUrl) {
          console.log('✅ Setting image preview:', pictureUrl);
          setImagePreview(pictureUrl);
        } else {
          console.log('⚠️ No picture URL found');
        }
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
          bio: '',
          picture: ''
        });
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      alert('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (userInfo) {
      setUserInfo({ ...userInfo, picture: '' });
    }
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5255';
    console.log('📤 Uploading to:', `${apiUrl}/file/s3`);
    
    const response = await fetch(`${apiUrl}/file/s3`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    // 🔍 DEBUG: 打印上传响应
    console.log('📤 Upload Response:', result);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to upload image');
    }

    console.log('✅ Image uploaded, S3 URL:', result.data);
    return result.data; // This should be the S3 URL
  };

  const handleVerifySecurityPassword = async () => {
    if (!securityPassword.trim()) {
      alert('Please enter your security password');
      return;
    }

    try {
      const userId = authUtils.getUserId();
      const result = await authAPI.validateSecurityPassword(userId!, securityPassword);

      if (result.success) {
        setIsSecurityVerified(true);
        alert('Security password verified! You can now change your password.');
      } else {
        setIsSecurityVerified(false);
        alert(result.message || 'Invalid security password');
      }
    } catch (error) {
      console.error('Error verifying security password:', error);
      alert('Failed to verify security password');
    }
  };

  const handleSave = async () => {
    if (!userInfo || !loginInfo) return;

    if (newPassword.trim() && !isSecurityVerified) {
      alert('Please verify your security password before changing your password!');
      return;
    }

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

      // Upload image if selected
      let pictureUrl = userInfo.picture;
      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          pictureUrl = await uploadImageToS3(selectedImage);
          console.log('✅ New picture URL:', pictureUrl);
          setIsUploadingImage(false);
        } catch (error) {
          setIsUploadingImage(false);
          console.error('❌ Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
      }

      // Update password if needed
      if (newPassword.trim() && isSecurityVerified) {
        const userId = authUtils.getUserId();
        const loginResult = await authAPI.changePassword(userId!, newPassword);
        
        if (!loginResult.success) {
          alert('Failed to update password: ' + (loginResult.message || 'Unknown error'));
          return;
        }
      }

      // Save user info
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
          bio: loginInfo.role === 'doctor' ? userInfo.bio : '',
          picture: pictureUrl
        };

        // 🔍 DEBUG: 打印要保存的数据
        console.log('💾 Saving user data:', userData);

        let userResult;
        if (userInfoExists) {
          userResult = await userInfoAPI.update(userData);
        } else {
          userResult = await userInfoAPI.create(userData);
          setUserInfoExists(true);
        }

        // 🔍 DEBUG: 打印保存结果
        console.log('💾 Save result:', userResult);

        if (!userResult.success) {
          alert('Failed to save profile');
          return;
        }
      }

      alert('Profile updated successfully!');
      setNewPassword('');
      setSecurityPassword('');
      setIsSecurityVerified(false);
      setSelectedImage(null);
      
      // Reload profile to get fresh data
      await loadProfile();
    } catch (error) {
      console.error('❌ Error saving profile:', error);
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
        {/* 🔍 DEBUG INFO */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Info:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Picture URL:</strong> {userInfo.picture || '(empty)'}</p>
            <p><strong>Image Preview:</strong> {imagePreview || '(empty)'}</p>
            <p><strong>Selected File:</strong> {selectedImage?.name || '(none)'}</p>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            Profile Picture
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Image Preview */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('❌ Image failed to load:', imagePreview);
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', imagePreview);
                    }}
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              {imagePreview && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit">
                  <Upload className="w-5 h-5" />
                  <span>Choose Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Upload a profile picture (max 5MB)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPG, PNG, GIF, WebP
              </p>
              {selectedImage && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  ✓ New image selected: {selectedImage.name}
                </p>
              )}
              {isUploadingImage && (
                <div className="text-sm text-blue-600 mt-2 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Uploading image...
                </div>
              )}
            </div>
          </div>
        </div>

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
                  disabled={!isSecurityVerified}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 ${
                    !isSecurityVerified ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder={isSecurityVerified ? "Enter new password" : "Verify security password first"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={!isSecurityVerified}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isSecurityVerified && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ You must verify your security password before changing your password
                </p>
              )}
            </div>

            {/* Security Password Verification */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Security Password
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type={showSecurityPassword ? 'text' : 'password'}
                    value={securityPassword}
                    onChange={(e) => setSecurityPassword(e.target.value)}
                    disabled={isSecurityVerified}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10 ${
                      isSecurityVerified ? 'bg-green-50 border-green-500' : ''
                    }`}
                    placeholder="Enter security password to change password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showSecurityPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleVerifySecurityPassword}
                  disabled={isSecurityVerified || !securityPassword.trim()}
                  className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    isSecurityVerified 
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  }`}
                >
                  {isSecurityVerified ? '✓ Verified' : 'Verify'}
                </button>
              </div>
              {isSecurityVerified && (
                <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                  <span className="font-semibold">✓</span> Security password verified. You can now change your password.
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                ℹ️ <strong>Forgot your security password?</strong> Please contact the administrator for assistance.
              </p>
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
            disabled={isSaving || isUploadingImage}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : isUploadingImage ? 'Uploading...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}