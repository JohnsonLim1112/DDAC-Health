import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  FileText,
  MessageSquare,
  Edit,
  Clock,
  Ban,
  Activity  // ✅ 添加健康数据图标
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

interface AppointmentCardProps {
  appointment: Appointment;
  patientEmail?: string;  // ✅ 添加患者邮箱
  onMarkCompleted: (appointment: Appointment) => void;
  onSetPrice: (appointment: Appointment) => void;
  onAddComment: (appointment: Appointment) => void;
  onViewHealthData: (appointment: Appointment) => void;  // ✅ 添加查看健康数据回调
  isProcessing: boolean;
}

export default function AppointmentCard({ 
  appointment, 
  patientEmail,  // ✅ 接收患者邮箱
  onMarkCompleted, 
  onSetPrice, 
  onAddComment,
  onViewHealthData,  // ✅ 接收查看健康数据回调
  isProcessing 
}: AppointmentCardProps) {
  
  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  const getStatusBadge = (status: string) => {
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
  const canAddComment = appointment.status === '1' || appointment.status === '3';

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
              <User className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg text-gray-800">
                  {patientEmail || `Patient ID: ${appointment.userId.substring(0, 8)}...`}
                </h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                  <StatusIcon className="w-4 h-4" />
                  {badge.label}
                </span>
              </div>
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
                <p className="text-sm font-medium text-gray-700 mb-1">Symptoms:</p>
                <p className="text-gray-800">{appointment.illnessTxt}</p>
              </div>
            </div>
          </div>

          {/* Medicine (if accepted/completed) */}
          {(appointment.status === '1' || appointment.status === '3') && appointment.medicine && (
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700 mb-1">Medicine Prescribed:</p>
                  <p className="text-gray-800">{appointment.medicine}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comment Section */}
          {appointment.comment && (
            <div className={`${isRejected ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'} rounded-lg p-4 mb-4`}>
              <div className="flex items-start gap-2">
                <MessageSquare className={`w-5 h-5 mt-0.5 ${isRejected ? 'text-red-600' : 'text-green-600'}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium mb-1 ${isRejected ? 'text-red-700' : 'text-green-700'}`}>
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
              <span className="text-gray-600">Price: </span>
              <span className="font-semibold text-gray-800">RM {appointment.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right side - Action Buttons */}
        <div className="ml-6 flex flex-col gap-2">
          {/* ✅ View Health Data - 所有状态都可以查看 */}
          <button
            onClick={() => onViewHealthData(appointment)}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
          >
            <Activity className="w-4 h-4" />
            View Health Data
          </button>

          {/* Mark as Completed - 只有 Accepted 可以标记为完成 */}
          {appointment.status === '1' && (
            <button
              onClick={() => onMarkCompleted(appointment)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4" />
              Mark Completed
            </button>
          )}

          {/* Set Price - 只有 Completed 可以设置价格 */}
          {appointment.status === '3' && (
            <button
              onClick={() => onSetPrice(appointment)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
            >
              <Edit className="w-4 h-4" />
              Set Price
            </button>
          )}

          {/* Add/Edit Notes - Accepted 或 Completed */}
          {canAddComment && (
            <button
              onClick={() => onAddComment(appointment)}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              {appointment.comment ? 'Edit Notes' : 'Add Notes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}