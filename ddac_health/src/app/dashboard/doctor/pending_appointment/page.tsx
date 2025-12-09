'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  FileText,
  Activity
} from 'lucide-react';
import { appointmentsAPI, authUtils, authAPI } from '../../../../lib/api';
import PatientHealthView from '../../../../components/PatientHealthView';

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
}

export default function DoctorPendingAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userEmails, setUserEmails] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      // 1. 加载预约数据
      const appointmentsResult = await appointmentsAPI.getByDoctorId(doctorId);

      if (appointmentsResult.success && appointmentsResult.data) {
        const pendingOnly = appointmentsResult.data.filter((apt: Appointment) => apt.status === '0');
        setAppointments(pendingOnly);

        // 2. ✅ 获取所有患者的 email
        await loadUserEmails(pendingOnly);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 使用新 API 获取用户 email
  const loadUserEmails = async (appointments: Appointment[]) => {
    try {
      // 获取所有唯一的 userId
      const userIds = Array.from(new Set(appointments.map(apt => apt.userId)));
      
      // 并行获取所有用户的 email
      const emailPromises = userIds.map(async (userId) => {
        try {
          const result = await authAPI.checkUsername(userId);
          
          if (result.success && result.data) {
            return { userId, email: result.data };
          }
          return { userId, email: '' };
        } catch (error) {
          console.error(`Failed to fetch email for user ${userId}:`, error);
          return { userId, email: '' };
        }
      });

      const emailResults = await Promise.all(emailPromises);
      
      // 构建 userId -> email 映射
      const emailMap: { [key: string]: string } = {};
      emailResults.forEach(({ userId, email }) => {
        emailMap[userId] = email;
      });

      setUserEmails(emailMap);
    } catch (error) {
      console.error('Error loading user emails:', error);
    }
  };

  const getUserEmail = (userId: string): string => {
    return userEmails[userId] || '';
  };

  const handleAccept = async (appointment: Appointment) => {
    if (!confirm('Are you sure you want to accept this appointment?')) return;

    try {
      setIsProcessing(true);
      
      const updatedAppointment = {
        ...appointment,
        status: '1',
        isAccept: true,
        comment: ''
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Appointment accepted successfully!');
        loadData();
      } else {
        alert(result.message || 'Failed to accept appointment');
      }
    } catch (error) {
      console.error('Error accepting appointment:', error);
      alert('Failed to accept appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedAppointment) return;

    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setIsProcessing(true);
      
      const updatedAppointment = {
        ...selectedAppointment,
        status: '2',
        isAccept: false,
        comment: rejectReason
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Appointment rejected successfully!');
        setShowRejectModal(false);
        setSelectedAppointment(null);
        setRejectReason('');
        loadData();
      } else {
        alert(result.message || 'Failed to reject appointment');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Failed to reject appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewHealthData = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowHealthModal(true);
  };

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Clock className="w-8 h-8 text-yellow-600" />
          Pending Appointments
        </h1>
        <p className="text-gray-600 mt-2">Review and manage appointment requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-50 rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-sm font-medium">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-800 mt-2">{appointments.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Ready to Accept</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{appointments.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Awaiting Response</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">{appointments.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pending Appointments</h3>
          <p className="text-gray-600">You're all caught up! No appointments waiting for your response.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const patientEmail = getUserEmail(appointment.userId);
            
            return (
              <div 
                key={appointment.id} 
                className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Left side - Appointment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <User className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {patientEmail || `Patient ID: ${appointment.userId.substring(0, 8)}...`}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatAppointmentTime(appointment.startTime, appointment.endTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700 mb-1">Symptoms / Reason:</p>
                          <p className="text-gray-800">{appointment.illnessTxt}</p>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Appointment ID</p>
                        <p className="font-mono text-gray-800">{appointment.id.substring(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          Pending
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-semibold text-gray-800">RM {appointment.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action Buttons */}
                  <div className="flex flex-col gap-3 ml-6">
                    {/* View Health Data */}
                    <button
                      onClick={() => handleViewHealthData(appointment)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      <Activity className="w-5 h-5" />
                      View Health Data
                    </button>

                    <button
                      onClick={() => handleAccept(appointment)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectClick(appointment)}
                      disabled={isProcessing}
                      className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b bg-red-50">
              <h2 className="text-2xl font-bold text-red-800 flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Reject Appointment
              </h2>
              <p className="text-red-600 mt-1">Please provide a reason for rejection</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient
                </label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {getUserEmail(selectedAppointment.userId) || `Patient ID: ${selectedAppointment.userId.substring(0, 12)}...`}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time
                </label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">
                  {formatAppointmentTime(selectedAppointment.startTime, selectedAppointment.endTime)}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                <p className="text-gray-800 bg-gray-50 p-3 rounded">
                  {selectedAppointment.illnessTxt}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  rows={4}
                  placeholder="Please explain why you are rejecting this appointment..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be saved as a comment for the patient
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedAppointment(null);
                    setRejectReason('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Health Data Modal */}
      <PatientHealthView
        show={showHealthModal}
        patientId={selectedAppointment?.userId || ''}
        patientName={getUserEmail(selectedAppointment?.userId || '')}
        onClose={() => {
          setShowHealthModal(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}