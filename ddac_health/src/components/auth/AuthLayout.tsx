// src/components/auth/AuthLayout.tsx
import React from 'react';
import { Heart, Activity, Calendar, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side - Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 to-green-500 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Heart className="w-8 h-8" />
              </div>
              <h1 className="text-4xl font-bold">HLife</h1>
            </div>
            
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-blue-100 text-lg mb-8">{subtitle}</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Health Monitoring</h3>
                <p className="text-sm text-blue-100">Track BP, heart rate, BMI and more</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Easy Scheduling</h3>
                <p className="text-sm text-blue-100">Book appointments with just a few clicks</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Connect with Doctors</h3>
                <p className="text-sm text-blue-100">Online consultations and remote care</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Content */}
        <div className="lg:w-1/2 p-12">
          {children}
        </div>
      </div>
    </div>
  );
}