import React, { useState } from 'react';
import { CreditCard, Building2, Smartphone, Wallet, CheckCircle } from 'lucide-react';

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

interface PaymentModalProps {
  show: boolean;
  appointment: Appointment | null;
  onConfirm: () => void;
  onClose: () => void;
  isProcessing: boolean;
}

type PaymentMethod = 'credit-card' | 'online-banking' | 'e-wallet' | 'cash';

export default function PaymentModal({
  show,
  appointment,
  onConfirm,
  onClose,
  isProcessing
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  if (!show || !appointment) return null;

  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  const paymentMethods = [
    {
      id: 'credit-card' as PaymentMethod,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
      color: 'blue'
    },
    {
      id: 'online-banking' as PaymentMethod,
      name: 'Online Banking',
      icon: Building2,
      description: 'FPX, Maybank, CIMB, etc.',
      color: 'green'
    },
    {
      id: 'e-wallet' as PaymentMethod,
      name: 'E-Wallet',
      icon: Smartphone,
      description: 'Touch n Go, GrabPay, Boost',
      color: 'purple'
    },
    {
      id: 'cash' as PaymentMethod,
      name: 'Cash',
      icon: Wallet,
      description: 'Pay at clinic',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' 
        : 'bg-white border-gray-200 hover:border-blue-300',
      green: isSelected 
        ? 'bg-green-50 border-green-500 ring-2 ring-green-500' 
        : 'bg-white border-gray-200 hover:border-green-300',
      purple: isSelected 
        ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500' 
        : 'bg-white border-gray-200 hover:border-purple-300',
      orange: isSelected 
        ? 'bg-orange-50 border-orange-500 ring-2 ring-orange-500' 
        : 'bg-white border-gray-200 hover:border-orange-300'
    };
    return colors[color as keyof typeof colors];
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7" />
            Payment
          </h2>
          <p className="mt-1 text-green-50">Complete your appointment payment</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">Appointment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium text-gray-800">
                  {formatAppointmentTime(appointment.startTime, appointment.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Appointment ID:</span>
                <span className="font-mono text-gray-800">{appointment.id.substring(0, 8)}...</span>
              </div>
              {appointment.medicine && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicine:</span>
                  <span className="text-gray-800">{appointment.medicine}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount to Pay */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-green-700">RM {appointment.price.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative p-4 border-2 rounded-xl transition-all ${getColorClasses(method.color, isSelected)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-${method.color}-100`}>
                        <Icon className={`w-6 h-6 ${getIconColor(method.color)}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className={`w-6 h-6 ${getIconColor(method.color)}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Note:</strong> This is a demonstration payment interface. 
              In production, this would integrate with actual payment gateways.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing || !selectedMethod}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}