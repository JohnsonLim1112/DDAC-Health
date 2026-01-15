import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User, Stethoscope, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { appointmentsAPI, authUtils } from '../../lib/api';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  isAccept: boolean;
  illnessTxt: string;
  medicine: string;
  price: number;
  comment: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  isReminded?: boolean;
}

export default function CustomerDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyAppointments();
  }, []);

  const fetchMyAppointments = async () => {
    try {
      setIsLoading(true);
      const userId = authUtils.getUserId();
      
      if (!userId) {
        console.error('No userId found!');
        return;
      }

      const result = await appointmentsAPI.getByUserId(userId);
      
      if (result.success && result.data) {
        setAppointments(result.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, isAccept: boolean) => {
    if (status === '0') {
      return { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending' 
      };
    } else if (status === '1' && isAccept) {
      return { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Accepted' 
      };
    } else if (status === '1' && !isAccept) {
      return { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: <XCircle className="w-4 h-4" />,
        label: 'Rejected' 
      };
    } else if (status === '2') {
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Completed' 
      };
    } else if (status === '3') {
      return { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Completed' 
      };
    } else if (status === '4') {
      return { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: <XCircle className="w-4 h-4" />,
        label: 'Cancelled' 
      };
    } else if (status === '5') {
      return { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Paid' 
      };
    }
    return { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Unknown' 
    };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // ✅ 修复：显示所有非取消/拒绝的预约
  const upcomingAppointments = appointments
    .filter(apt => {
      // 排除被拒绝的(status=1 && !isAccept)和被取消的(status=4)
      if (apt.status === '1' && !apt.isAccept) return false; // 拒绝
      if (apt.status === '4') return false; // 取消
      return true; // 显示所有其他状态
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  // ✅ 修复统计
  const completedCount = appointments.filter(a => a.status === '2' || a.status === '3').length;
  const pendingCount = appointments.filter(a => a.status === '0').length;
  const acceptedCount = appointments.filter(a => a.status === '1' && a.isAccept).length;
  const paidCount = appointments.filter(a => a.status === '5').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-blue-100">Manage your health and appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-gray-800">{pendingCount + acceptedCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-800">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-800">{completedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Paid</p>
              <p className="text-3xl font-bold text-gray-800">{paidCount}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/book-appointments" 
             className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all hover:scale-105 block">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-600">Schedule a visit with a doctor</p>
          </Link>

          <Link href="/dashboard/health" 
             className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all hover:scale-105 block">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Health Records</h3>
            <p className="text-sm text-gray-600">Manage your health information</p>
          </Link>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No appointments yet</p>
            <Link href="/dashboard/book-appointments" 
               className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Book your first appointment →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingAppointments.map((apt) => {
              const badge = getStatusBadge(apt.status, apt.isAccept);
              return (
                <div key={apt.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${badge.color}`}>
                          {badge.icon}
                          <span className="text-xs font-semibold">{badge.label}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(apt.startTime)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Doctor ID</p>
                            <p className="font-medium text-gray-800">{apt.doctorId.substring(0, 12)}...</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Reason</p>
                            <p className="font-medium text-gray-800">{apt.illnessTxt}</p>
                          </div>
                        </div>

                        {apt.medicine && (
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Medicine</p>
                              <p className="font-medium text-gray-800">{apt.medicine}</p>
                            </div>
                          </div>
                        )}

                        {apt.price > 0 && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">Total Cost:</p>
                            <p className="text-lg font-bold text-emerald-600">RM {apt.price.toFixed(2)}</p>
                            {apt.status === '5' && (
                              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                ✓ Paid
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {upcomingAppointments.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Link href="/dashboard/appointment_history" 
               className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center">
              View all appointments →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}