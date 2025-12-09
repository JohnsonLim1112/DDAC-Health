import React from 'react';
import { MessageSquare } from 'lucide-react';

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

interface CommentModalProps {
  show: boolean;
  appointment: Appointment | null;
  onSave: (comment: string) => void;  
  onClose: () => void;
  isProcessing: boolean;
}

export default function CommentModal({
  show,
  appointment,
  onSave,
  onClose,
  isProcessing
}: CommentModalProps) {
  const [comment, setComment] = React.useState(''); 

  React.useEffect(() => {
    if (appointment) {
      setComment(appointment.comment || '');
    }
  }, [appointment]);

  const handleSave = () => {
    onSave(comment);
  };

  if (!show || !appointment) return null;

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {appointment.comment ? 'Edit Doctor\'s Notes' : 'Add Doctor\'s Notes'}
          </h2>
          <p className="text-blue-600 mt-1">Add notes or instructions for the patient</p>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID
            </label>
            <p className="text-gray-800 font-mono bg-gray-50 p-2 rounded">
              {appointment.userId}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Time
            </label>
            <p className="text-gray-800 bg-gray-50 p-2 rounded">
              {formatAppointmentTime(appointment.startTime, appointment.endTime)}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms
            </label>
            <p className="text-gray-800 bg-gray-50 p-3 rounded">
              {appointment.illnessTxt}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor's Notes / Instructions
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={6}
              placeholder="Add any notes, instructions, or follow-up recommendations for the patient..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be visible to the patient
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}