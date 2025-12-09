import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import { appointmentsAPI, authUtils } from '../../lib/api';

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

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      const result = await appointmentsAPI.getByDoctorId(doctorId);
      if (result.success && result.data) {
        setAppointments(result.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === '0').length,
    accepted: appointments.filter(a => a.status === '1').length,
    rejected: appointments.filter(a => a.status === '2').length,
    completed: appointments.filter(a => a.status === '3').length,
  };


  const today = new Date().toDateString();
  const todayAppointments = appointments.filter(a => 
    new Date(a.createTime).toDateString() === today
  );


  const pendingAppointments = appointments.filter(a => a.status === '0');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          Doctor Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Manage your appointments and patients</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 总预约数 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 待处理 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* 已接受 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Accepted</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.accepted}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* 已完成 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completed}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 今天的预约 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Today's Appointments
        </h2>
        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">Patient ID: {appointment.userId}</p>
                  <p className="text-sm text-gray-600">{appointment.illnessTxt}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  appointment.status === '0' ? 'bg-yellow-100 text-yellow-700' :
                  appointment.status === '1' ? 'bg-green-100 text-green-700' :
                  appointment.status === '2' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {appointment.status === '0' ? 'Pending' :
                   appointment.status === '1' ? 'Accepted' :
                   appointment.status === '2' ? 'Rejected' :
                   'Completed'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments for today</p>
          </div>
        )}
      </div>
    
    </div>
  );
}