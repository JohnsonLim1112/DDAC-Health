'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Clock,
  Ban,
  CreditCard
} from 'lucide-react';
import { appointmentsAPI, authUtils } from '../../../lib/api';
import CustomerAppointmentCard from '../../../components/CustomerAppointmentCard';
import PaymentModal from '../../../components/PaymentModal';

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

export default function CustomerAppointmentHistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadAppointmentHistory();
  }, []);

  const loadAppointmentHistory = async () => {
    try {
      setIsLoading(true);
      const userId = authUtils.getUserId();
      if (!userId) return;

      const result = await appointmentsAPI.getByUserId(userId);
      
      if (result.success && result.data) {
   
        const sorted = result.data.sort((a: Appointment, b: Appointment) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setAppointments(sorted);
      }
    } catch (error) {
      console.error('Error loading appointment history:', error);
      alert('Failed to load appointment history');
    } finally {
      setIsLoading(false);
    }
  };

 
  const handlePayClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

 
  const handleConfirmPayment = async () => {
    if (!selectedAppointment) return;

    try {
      setIsProcessing(true);
      
      const updatedAppointment = {
        ...selectedAppointment,
        status: '5'  // 5 = Paid
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Payment successful! Thank you.');
        setShowPaymentModal(false);
        setSelectedAppointment(null);
        loadAppointmentHistory();
      } else {
        alert(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleCancelAppointment = async (appointment: Appointment) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setIsProcessing(true);
      
      const updatedAppointment = {
        ...appointment,
        status: '4'  // 4 = Cancelled
      };
      
      const result = await appointmentsAPI.update(updatedAppointment);
      
      if (result.success) {
        alert('Appointment cancelled successfully');
        loadAppointmentHistory();
      } else {
        alert(result.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment');
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
          My Appointments
        </h1>
        <p className="text-gray-600 mt-2">View and manage your appointment history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 text-xs font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-800 mt-1">
                {appointments.filter(a => a.status === '0').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-xs font-medium">Accepted</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {appointments.filter(a => a.status === '1').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-xs font-medium">Completed</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {appointments.filter(a => a.status === '3').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl shadow-md p-4 border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-700 text-xs font-medium">Paid</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">
                {appointments.filter(a => a.status === '5').length}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl shadow-md p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 text-xs font-medium">Cancelled</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {appointments.filter(a => a.status === '4').length}
              </p>
            </div>
            <Ban className="w-8 h-8 text-gray-600" />
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
            <option value="0">Pending</option>
            <option value="1">Accepted</option>
            <option value="2">Rejected</option>
            <option value="3">Completed</option>
            <option value="4">Cancelled</option>
            <option value="5">Paid</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments Found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? 'You haven\'t made any appointments yet.' 
              : 'No appointments found with the selected status.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <CustomerAppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPay={handlePayClick}
              onCancel={handleCancelAppointment}
              isProcessing={isProcessing}
            />
          ))}
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        appointment={selectedAppointment}
        onConfirm={handleConfirmPayment}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedAppointment(null);
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
}