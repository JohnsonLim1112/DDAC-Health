'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Validate Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  if (!email.trim()) {
    setError('Please enter your email');
    return;
  }

  try {
    setIsLoading(true);
    const result = await authAPI.validateEmail(email);
    
    if (result.success && result.data) {

      const userId = result.data.loginId; 
      
      if (userId) {
        setUserId(userId);
        setStep(2);
      } else {
        setError('Failed to get user ID');
      }
    } else {
      setError(result.message || 'Email not found');
    }
  } catch (error) {
    console.error('Email validation error:', error);
    setError('Failed to validate email');
  } finally {
    setIsLoading(false);
  }
};

  // Step 2: Validate Security Password
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!securityPassword.trim()) {
      setError('Please enter your security password');
      return;
    }

    if (!userId) {
      setError('User ID is missing. Please start over.');
      setStep(1);
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await authAPI.validateSecurityPassword(userId, securityPassword);
      console.log('🔐 Security validation result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ Security password valid');
        setStep(3);
      } else {
        console.log('❌ Security password invalid:', result.message);
        setError(result.message || 'Security password is incorrect');
      }
    } catch (error) {
      console.error('❌ Security password validation error:', error);
      console.error('   Error details:', error);
      setError('Failed to validate security password');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword === securityPassword) {
      setError('New password cannot be the same as security password');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Step 3: Changing password');
      
      const result = await authAPI.changePassword(userId, newPassword);
      console.log('🔑 Password change result:', result);
      
      if (result.success) {
        console.log('✅ Password changed successfully');
        setStep(4);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        console.log('❌ Password change failed:', result.message);
        setError(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Password change error:', error);
      setError('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError('');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{step === 1 ? 'Back to Login' : 'Back'}</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Forgot Password
            </h1>
            <p className="text-gray-600">
              {step === 1 && 'Enter your email to reset your password'}
              {step === 2 && 'Verify your security password'}
              {step === 3 && 'Create a new password'}
              {step === 4 && 'Password reset successful!'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs mt-2 text-gray-600">Email</span>
            </div>
            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs mt-2 text-gray-600">Security</span>
            </div>
            <div className={`h-1 flex-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-xs mt-2 text-gray-600">Password</span>
            </div>
          </div>

         
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Email Verification */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isLoading ? 'Verifying...' : 'Continue'}
              </button>
            </form>
          )}

          {/* Step 2: Security Password Verification */}
          {step === 2 && (
            <form onSubmit={handleSecuritySubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">Email: <strong>{email}</strong></p>
                {userId && <p className="text-xs text-gray-600 mt-1">User ID: {userId.substring(0, 12)}...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showSecurityPassword ? 'text' : 'password'}
                    value={securityPassword}
                    onChange={(e) => setSecurityPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your security password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecurityPassword(!showSecurityPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecurityPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
              <button
                onClick={() => router.push('/login')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Login Now
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

