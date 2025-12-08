'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  AlertCircle
} from 'lucide-react';
import { appointmentsAPI, authUtils } from '../../../../lib/api';
import AppointmentCard from '../doctor_components/AppointmentCard';
import CommentModal from '../doctor_components/CommentModal';
import PriceModal from '../doctor_components/PriceModal';

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

export default function DoctorAppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [comment, setComment] = useState('');
  const [price, setPrice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAppointmentHistory();
  }, []);

  const loadAppointmentHistory = async () => {
    try {
      setIsLoading(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      const result = await appointmentsAPI.getByDoctorId(doctorId);
      
      if (result.success && result.data) {
        // ✅ 排除 pending (status = '0')
        const historyOnly = result.data.filter((apt: Appointment) => apt.status !== '0');
        historyOnly.sort((a: Appointment, b: Appointment) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setAppointments(historyOnly);
      }
    } catch (error) {
      console.error('Error loading appointment history:', error);
      alert('Failed to load appointment history');
    } finally {
      setIsLoading(false);
    }
  };

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
        loadAppointmentHistory();
      } else {
        alert(result.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error marking as completed:', error);
      alert('Failed to update appointment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenPriceModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPrice(appointment.price.toString());
    setShowPriceModal(true);
  };

  const handleSavePrice = async () => {
    if (!selectedAppointment) return;

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }

    try {
      setIsProcessing(true);
      const updatedAppointment = {
        ...selectedAppointment,
        price: priceValue
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Price updated successfully!');
        setShowPriceModal(false);
        setSelectedAppointment(null);
        setPrice('');
        loadAppointmentHistory();
      } else {
        alert(result.message || 'Failed to update price');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Failed to save price');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddComment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setComment(appointment.comment || '');
    setShowCommentModal(true);
  };

  const handleSaveComment = async () => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      const updatedAppointment = {
        ...selectedAppointment,
        comment: comment.trim()
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Comment saved successfully!');
        setShowCommentModal(false);
        setSelectedAppointment(null);
        setComment('');
        loadAppointmentHistory();
      } else {
        alert(result.message || 'Failed to save comment');
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      alert('Failed to save comment');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filterStatus);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointment history...</p>
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
        <p className="text-gray-600 mt-2">View and manage past appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-medium">Accepted</p>
              <p className="text-3xl font-bold text-green-800 mt-2">
                {appointments.filter(a => a.status === '1').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-800 mt-2">
                {appointments.filter(a => a.status === '2').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-blue-800 mt-2">
                {appointments.filter(a => a.status === '3').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
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
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No History Found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? 'No past appointments to display.' 
              : 'No appointments found with the selected status.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onMarkCompleted={handleMarkCompleted}
              onSetPrice={handleOpenPriceModal}
              onAddComment={handleAddComment}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CommentModal
        show={showCommentModal}
        appointment={selectedAppointment}
        comment={comment}
        setComment={setComment}
        onSave={handleSaveComment}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedAppointment(null);
          setComment('');
        }}
        isProcessing={isProcessing}
      />

      <PriceModal
        show={showPriceModal}
        appointment={selectedAppointment}
        price={price}
        setPrice={setPrice}
        onSave={handleSavePrice}
        onClose={() => {
          setShowPriceModal(false);
          setSelectedAppointment(null);
          setPrice('');
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
}