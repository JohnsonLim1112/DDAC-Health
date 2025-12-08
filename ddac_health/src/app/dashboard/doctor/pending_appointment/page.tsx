'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { appointmentsAPI, authUtils } from '../../../../lib/api';

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  isAccept: boolean;
  illnessTxt: string;
  medicine?: string;
  price: number;
  status: string;
  createTime: string;
  updateTime: string;
}

export default function DoctorPendingAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadPendingAppointments();
  }, []);

  const loadPendingAppointments = async () => {
    try {
      setIsLoading(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      const result = await appointmentsAPI.getByDoctorId(doctorId);
      
      if (result.success && result.data) {
        // ✅ 只显示 pending 的预约 (status = '0')
        const pendingOnly = result.data.filter((apt: Appointment) => apt.status === '0');
        setAppointments(pendingOnly);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (appointment: Appointment) => {
    if (!confirm('Are you sure you want to accept this appointment?')) return;

    try {
      setIsProcessing(true);
      
      // ✅ 使用 update API，只修改 status 和 isAccept
      const updatedAppointment = {
        ...appointment,
        medicine: appointment.medicine || '',
        status: '1',      // 1 = Accepted
        isAccept: true,
        updateTime: new Date().toISOString()
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Appointment accepted successfully!');
        loadPendingAppointments(); // 刷新列表
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
      // ✅ 使用 update API，只修改 status
      // 注意：rejection reason 暂时无法保存（数据库没有这个字段）
      const updatedAppointment = {
        ...selectedAppointment,
        medicine: selectedAppointment.medicine || '',
        status: '2',      // 2 = Rejected
        isAccept: false,
        updateTime: new Date().toISOString()
        // TODO: 需要在数据库添加 rejection_reason 字段才能保存原因
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Appointment rejected successfully!');
        console.log('Rejection reason (not saved to DB):', rejectReason);
        setShowRejectModal(false);
        setSelectedAppointment(null);
        setRejectReason('');
        loadPendingAppointments(); // 刷新列表
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
          {appointments.map((appointment) => (
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
                      <h3 className="font-semibold text-lg text-gray-800">Patient ID: {appointment.userId.substring(0, 8)}...</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.createTime).toLocaleString()}</span>
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
          ))}
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
                  Patient ID
                </label>
                <p className="text-gray-800 font-mono bg-gray-50 p-2 rounded">
                  {selectedAppointment.userId}
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
                  This will be sent to the patient
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
    </div>
  );
}