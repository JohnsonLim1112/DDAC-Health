import React from 'react';
import { Edit } from 'lucide-react';

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

interface PriceModalProps {
  show: boolean;
  appointment: Appointment | null;
  onSave: (price: number) => void;  
  onClose: () => void;
  isProcessing: boolean;
}

export default function PriceModal({
  show,
  appointment,
  onSave,
  onClose,
  isProcessing
}: PriceModalProps) {
  const [price, setPrice] = React.useState('');  

  React.useEffect(() => {
    if (appointment) {
      setPrice(appointment.price.toString());
    }
  }, [appointment]);

  const handleSave = () => {
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Please enter a valid price');
      return;
    }
    onSave(priceValue);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b bg-purple-50">
          <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
            <Edit className="w-6 h-6" />
            Set Appointment Price
          </h2>
          <p className="text-purple-600 mt-1">Set the consultation fee for this appointment</p>
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
              Current Price
            </label>
            <p className="text-2xl font-bold text-gray-800">
              RM {appointment.price.toFixed(2)}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Price (RM) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                RM
              </span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-lg font-semibold"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter the consultation fee for this appointment
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
              disabled={isProcessing || !price}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Saving...' : 'Save Price'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}