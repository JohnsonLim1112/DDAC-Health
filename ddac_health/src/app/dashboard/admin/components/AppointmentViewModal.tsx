import React from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, MessageSquare, CreditCard, CheckCircle, XCircle, Ban } from 'lucide-react';

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

interface AppointmentViewModalProps {
  show: boolean;
  appointment: Appointment | null;
  users: User[];
  onClose: () => void;
}

export default function AppointmentViewModal({
  show,
  appointment,
  users,
  onClose
}: AppointmentViewModalProps) {
  if (!show || !appointment) return null;

  const getUserEmail = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.username || 'Unknown';
  };

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    if (status === '0') return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, label: 'Pending' };
    if (status === '1') return { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, label: 'Accepted' };
    if (status === '2') return { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, label: 'Rejected' };
    if (status === '3') return { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle, label: 'Completed' };
    if (status === '4') return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Ban, label: 'Cancelled' };
    if (status === '5') return { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle, label: 'Paid' };
    return { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: Clock, label: 'Unknown' };
  };

  const badge = getStatusBadge(appointment.status);
  const StatusIcon = badge.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Appointment Details</h2>
              <p className="text-blue-100 mt-1">View complete appointment information</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 ${badge.color}`}>
                <StatusIcon className="w-5 h-5" />
                {badge.label}
              </span>
            </div>
            {appointment.isAccept && (
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Doctor Response</p>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Accepted by Doctor
                </span>
              </div>
            )}
          </div>

          {/* Appointment ID */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Appointment ID</p>
            <p className="font-mono text-sm text-gray-800">{appointment.id}</p>
          </div>

          {/* People Involved */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-medium text-blue-800">Patient</p>
              </div>
              <p className="text-sm text-gray-800 font-semibold">{getUserEmail(appointment.userId)}</p>
              <p className="text-xs text-gray-600 mt-1">ID: {appointment.userId.substring(0, 12)}...</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-medium text-purple-800">Doctor</p>
              </div>
              <p className="text-sm text-gray-800 font-semibold">{getUserEmail(appointment.doctorId)}</p>
              <p className="text-xs text-gray-600 mt-1">ID: {appointment.doctorId.substring(0, 12)}...</p>
            </div>
          </div>

          {/* Time Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-1">Appointment Time</p>
                <p className="text-gray-800 font-semibold">{formatAppointmentTime(appointment.startTime, appointment.endTime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
              <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">Created On</p>
                <p className="text-gray-800">{formatCreatedDate(appointment.date)}</p>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-3">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800 mb-2">Symptoms / Illness</p>
                  <p className="text-gray-800">{appointment.illnessTxt}</p>
                </div>
              </div>
            </div>

            {appointment.medicine && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 mb-2">Medicine Prescribed</p>
                    <p className="text-gray-800">{appointment.medicine}</p>
                  </div>
                </div>
              </div>
            )}

            {appointment.comment && (
              <div className={`rounded-lg p-4 border-2 ${
                appointment.status === '2' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start gap-2">
                  <MessageSquare className={`w-5 h-5 mt-0.5 ${
                    appointment.status === '2' ? 'text-red-600' : 'text-green-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium mb-2 ${
                      appointment.status === '2' ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {appointment.status === '2' ? 'Rejection Reason' : 'Doctor\'s Notes / Comments'}
                    </p>
                    <p className="text-gray-800">{appointment.comment}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1">Consultation Fee</p>
                <p className="text-3xl font-bold text-purple-900">
                  RM {appointment.price.toFixed(2)}
                </p>
                {appointment.status === '5' && (
                  <p className="text-xs text-green-600 mt-2 font-semibold">✓ Payment Completed</p>
                )}
              </div>
              <div className="bg-purple-100 p-4 rounded-full">
                <CreditCard className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}