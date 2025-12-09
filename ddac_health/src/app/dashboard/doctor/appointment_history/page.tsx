'use client';

import React, { useState, useEffect } from 'react';
import { History, Activity } from 'lucide-react';
import { appointmentsAPI, authUtils, usersAPI } from '../../../../lib/api';
import AppointmentCard from '../doctor_components/AppointmentCard';
import CommentModal from '../doctor_components/CommentModal';
import PriceModal from '../doctor_components/PriceModal';
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

interface User {
  id: string;
  username: string;
  role: string;
}

export default function DoctorAppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      // 加载预约和用户列表
      const [appointmentsResult, usersResult] = await Promise.all([
        appointmentsAPI.getByDoctorId(doctorId),
        usersAPI.getAll(doctorId) // 假设医生也可以查看用户列表
      ]);

      if (appointmentsResult.success && appointmentsResult.data) {
        // 过滤出 Accepted, Completed 状态的预约
        const filteredData = appointmentsResult.data.filter(
          (apt: Appointment) => apt.status === '1' || apt.status === '2' || apt.status === '3' || apt.status === '5'
        );
        setAppointments(filteredData);
      }

      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load appointment history');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 获取用户邮箱
  const getUserEmail = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.username || '';
  };

  // ✅ 标记为完成
  const handleMarkCompleted = async (appointment: Appointment) => {
    if (!confirm('Mark this appointment as completed?')) return;

    try {
      setIsProcessing(true);
      const updatedAppointment = {
        ...appointment,
        status: '3'
      };

      const result = await appointmentsAPI.update(updatedAppointment);
      if (result.success) {
        alert('Appointment marked as completed!');
        loadData();
      } else {
        alert(result.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error marking completed:', error);
      alert('Failed to update appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ 设置价格
  const handleSetPrice = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPriceModal(true);
  };

  const handleSavePrice = async (price: number) => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      const updatedAppointment = {
        ...selectedAppointment,
        price: price
      };

      const result = await appointmentsAPI.update(updatedAppointment);
      if (result.success) {
        alert('Price set successfully!');
        setShowPriceModal(false);
        setSelectedAppointment(null);
        loadData();
      } else {
        alert(result.message || 'Failed to set price');
      }
    } catch (error) {
      console.error('Error setting price:', error);
      alert('Failed to set price');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ 添加/编辑备注
  const handleAddComment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCommentModal(true);
  };

  const handleSaveComment = async (comment: string) => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      const updatedAppointment = {
        ...selectedAppointment,
        comment: comment
      };

      const result = await appointmentsAPI.update(updatedAppointment);
      if (result.success) {
        alert('Notes saved successfully!');
        setShowCommentModal(false);
        setSelectedAppointment(null);
        loadData();
      } else {
        alert(result.message || 'Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ 查看健康数据
  const handleViewHealthData = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowHealthModal(true);
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <History className="w-8 h-8 text-blue-600" />
          Appointment History
        </h1>
        <p className="text-gray-600 mt-2">Manage your completed and ongoing appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-green-700 text-sm font-medium">Accepted</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            {appointments.filter(a => a.status === '1').length}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-red-700 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold text-red-900 mt-2">
            {appointments.filter(a => a.status === '2').length}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-blue-700 text-sm font-medium">Completed</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            {appointments.filter(a => a.status === '3').length}
          </p>
        </div>

        <div className="bg-emerald-50 rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
          <p className="text-emerald-700 text-sm font-medium">Paid</p>
          <p className="text-3xl font-bold text-emerald-900 mt-2">
            {appointments.filter(a => a.status === '5').length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="1">Accepted</option>
            <option value="2">Rejected</option>
            <option value="3">Completed</option>
            <option value="5">Paid</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? 'No appointment history found.' 
              : 'No appointments found with the selected status.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              patientEmail={getUserEmail(appointment.userId)}
              onMarkCompleted={handleMarkCompleted}
              onSetPrice={handleSetPrice}
              onAddComment={handleAddComment}
              onViewHealthData={handleViewHealthData}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CommentModal
        show={showCommentModal}
        appointment={selectedAppointment}
        onSave={handleSaveComment}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedAppointment(null);
        }}
        isProcessing={isProcessing}
      />

      <PriceModal
        show={showPriceModal}
        appointment={selectedAppointment}
        onSave={handleSavePrice}
        onClose={() => {
          setShowPriceModal(false);
          setSelectedAppointment(null);
        }}
        isProcessing={isProcessing}
      />

      {/* ✅ Patient Health Data Modal */}
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