import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  CreditCard,
  Ban,
  Stethoscope
} from 'lucide-react';

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

interface CustomerAppointmentCardProps {
  appointment: Appointment;
  doctorEmail: string;  // ✅ 新增 prop
  onPay: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  isProcessing: boolean;
}

export default function CustomerAppointmentCard({ 
  appointment, 
  doctorEmail,  // ✅ 接收 doctorEmail
  onPay, 
  onCancel,
  isProcessing 
}: CustomerAppointmentCardProps) {
  
  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  const getStatusBadge = (status: string) => {
    if (status === '0') return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending', borderColor: '#eab308' };
    if (status === '1') return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted', borderColor: '#10b981' };
    if (status === '2') return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected', borderColor: '#ef4444' };
    if (status === '3') return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed', borderColor: '#3b82f6' };
    if (status === '4') return { color: 'bg-gray-100 text-gray-800', icon: Ban, label: 'Cancelled', borderColor: '#6b7280' };
    if (status === '5') return { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Paid', borderColor: '#10b981' };
    return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown', borderColor: '#6b7280' };
  };

  const badge = getStatusBadge(appointment.status);
  const StatusIcon = badge.icon;
  const isRejected = appointment.status === '2';
  const isCancelled = appointment.status === '4';
  const isPaid = appointment.status === '5';
  const canCancel = appointment.status === '0' || appointment.status === '1'; // Pending or Accepted
  const canPay = appointment.status === '3' && appointment.price > 0; // Completed with price

  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition-shadow"
      style={{ borderLeftColor: badge.borderColor }}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Appointment Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${badge.color.replace('text-', 'bg-').split(' ')[0]}`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg text-gray-800">
                  Appointment #{appointment.id.substring(0, 8)}
                </h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {badge.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                <span>{formatAppointmentTime(appointment.startTime, appointment.endTime)}</span>
              </div>
            </div>
          </div>

          {/* ✅ Doctor Information */}
          <div className="bg-teal-50 rounded-lg p-4 mb-4 border border-teal-200">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-teal-700 mb-1">Doctor:</p>
                <p className="text-gray-800 font-semibold">
                  {doctorEmail || `Doctor ID: ${appointment.doctorId.substring(0, 12)}...`}
                </p>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Your Symptoms:</p>
                <p className="text-gray-800">{appointment.illnessTxt}</p>
              </div>
            </div>
          </div>

          {/* Medicine (if provided) */}
          {appointment.medicine && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 mb-1">Medicine Prescribed:</p>
                  <p className="text-gray-800">{appointment.medicine}</p>
                </div>
              </div>
            </div>
          )}

          {/* Doctor's Notes/Comment */}
          {appointment.comment && (
            <div className={`${
              isRejected 
                ? 'bg-red-50 border border-red-200' 
                : isCancelled
                ? 'bg-gray-50 border border-gray-200'
                : 'bg-green-50 border border-green-200'
            } rounded-lg p-4 mb-4`}>
              <div className="flex items-start gap-2">
                <MessageSquare className={`w-5 h-5 mt-0.5 ${
                  isRejected 
                    ? 'text-red-600' 
                    : isCancelled
                    ? 'text-gray-600'
                    : 'text-green-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-1 ${
                    isRejected 
                      ? 'text-red-700' 
                      : isCancelled
                      ? 'text-gray-700'
                      : 'text-green-700'
                  }`}>
                    {isRejected ? 'Rejection Reason:' : 'Doctor\'s Notes:'}
                  </p>
                  <p className="text-gray-800">{appointment.comment}</p>
                </div>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-600">Consultation Fee: </span>
              <span className={`font-semibold ${
                isPaid 
                  ? 'text-green-600' 
                  : appointment.price > 0 
                  ? 'text-blue-600' 
                  : 'text-gray-800'
              }`}>
                {appointment.price > 0 ? `RM ${appointment.price.toFixed(2)}` : 'Not set'}
              </span>
              {isPaid && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✓ Paid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Action Buttons */}
        <div className="ml-6 flex flex-col gap-2">
          {/* Pay Button - Only for Completed with price */}
          {canPay && (
            <button
              onClick={() => onPay(appointment)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          )}

          {/* Cancel Button - Only for Pending or Accepted */}
          {canCancel && (
            <button
              onClick={() => onCancel(appointment)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}