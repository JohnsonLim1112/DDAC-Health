'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Edit, Search, Clock, User, Stethoscope, CheckCircle, FileText } from 'lucide-react';
import { appointmentsAPI, usersAPI, authUtils } from '../../../../lib/api';
import AppointmentModals from '../components/AppointmentModals';
import AppointmentViewModal from '../components/AppointmentViewModal';

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
  date: string;        // 创建日期
  startTime: string;   // 预约开始时间（包含日期）
  endTime: string;     // 预约结束时间（包含日期）
}

interface CreateAppointmentData {
  UserId: string;
  DoctorId: string;
  IllnessTxt: string;
  AppointmentDate: string;  // YYYY-MM-DD
  StartTime: string;        // HH:mm
  EndTime: string;          // HH:mm
}

interface UserInfo {
  id: string;
  username: string;
  role: string;
}

export default function AppointmentsManagementPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // ✅ 更新 newAppointment 初始化
  const [newAppointment, setNewAppointment] = useState<CreateAppointmentData>({
    UserId: '',
    DoctorId: '',
    IllnessTxt: '',
    AppointmentDate: '',
    StartTime: '',
    EndTime: ''
  });

  // 获取用户邮箱
  const getUserEmail = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user?.username || userId.substring(0, 8) + '...';
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      // 同时获取预约和用户信息
      const adminId = authUtils.getUserId();
      const [appointmentsResult, usersResult] = await Promise.all([
        appointmentsAPI.getAll(),
        usersAPI.getAll(adminId!)
      ]);
      
      if (appointmentsResult.success && appointmentsResult.data) {
        setAppointments(appointmentsResult.data);
        setFilteredAppointments(appointmentsResult.data);
      }
      
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 更新创建预约处理函数
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // ✅ 组合日期和时间成 ISO DateTime
      const startDateTime = new Date(`${newAppointment.AppointmentDate}T${newAppointment.StartTime}:00`);
      const endDateTime = new Date(`${newAppointment.AppointmentDate}T${newAppointment.EndTime}:00`);

      // 验证时间
      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        return;
      }

      // 验证日期不能是过去
      const now = new Date();
      if (startDateTime < now) {
        alert('Appointment time cannot be in the past');
        return;
      }

      const appointmentData = {
        UserId: newAppointment.UserId,
        DoctorId: newAppointment.DoctorId,
        IllnessTxt: newAppointment.IllnessTxt,
        StartTime: startDateTime.toISOString(),  // ✅ 完整的 DateTime
        EndTime: endDateTime.toISOString()        // ✅ 完整的 DateTime
        // Date 字段由后端自动生成（创建日期）
      };

      console.log('Creating appointment with data:', appointmentData);

      const result = await appointmentsAPI.create(appointmentData);
      
      if (result.success) {
        alert('Appointment created successfully!');
        setShowCreateModal(false);
        setNewAppointment({
          UserId: '',
          DoctorId: '',
          IllnessTxt: '',
          AppointmentDate: '',
          StartTime: '',
          EndTime: ''
        });
        fetchAppointments();
      } else {
        alert(result.message || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment');
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    
    try {
      const result = await appointmentsAPI.update(editingAppointment);
      
      if (result.success) {
        alert('Appointment updated successfully!');
        setShowEditModal(false);
        setEditingAppointment(null);
        fetchAppointments();
      } else {
        alert(result.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    
    try {
      const result = await appointmentsAPI.delete(id);
      
      if (result.success) {
        alert('Appointment deleted successfully!');
        fetchAppointments();
      } else {
        alert(result.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  useEffect(() => {
    let filtered = appointments;
    if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);
    if (searchTerm) {
      filtered = filtered.filter(a => {
        const patientEmail = getUserEmail(a.userId).toLowerCase();
        const doctorEmail = getUserEmail(a.doctorId).toLowerCase();
        const search = searchTerm.toLowerCase();
        return patientEmail.includes(search) ||
               doctorEmail.includes(search) ||
               a.illnessTxt.toLowerCase().includes(search);
      });
    }
    setFilteredAppointments(filtered);
  }, [searchTerm, statusFilter, appointments, users]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadge = (status: string, isAccept: boolean) => {
    if (status === '0') return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    if (status === '1') return { color: 'bg-green-100 text-green-800', label: 'Accepted' };
    if (status === '2') return { color: 'bg-red-100 text-red-800', label: 'Rejected' };
    if (status === '3') return { color: 'bg-blue-100 text-blue-800', label: 'Completed' };
    if (status === '4') return { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' };
    if (status === '5') return { color: 'bg-emerald-100 text-emerald-800', label: 'Paid' };
    return { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };

  // ✅ 格式化创建日期
  const formatCreatedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ✅ 格式化预约时间
  const formatAppointmentTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = start.toLocaleDateString();
    const startTimeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Appointments Management</h1>
          <p className="text-gray-600 mt-1">Manage all appointments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === '0').length}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === '1').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === '3').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === '4').length}</p>
            </div>
            <Calendar className="w-10 h-10 text-gray-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold">{appointments.filter(a => a.status === '5').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email or illness..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p>No appointments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointment Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Illness</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredAppointments.map((apt) => {
                  const badge = getStatusBadge(apt.status, apt.isAccept);
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm">{getUserEmail(apt.userId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Stethoscope className="w-5 h-5 text-gray-400 mr-2" />
                          <span className="text-sm">{getUserEmail(apt.doctorId)}</span>
                        </div>
                      </td>
                      {/* ✅ 显示预约时间 */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatAppointmentTime(apt.startTime, apt.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4"><div className="text-sm max-w-xs truncate">{apt.illnessTxt}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.color}`}>{badge.label}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">RM {apt.price.toFixed(2)}</td>
                      {/* ✅ 显示创建日期 */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCreatedDate(apt.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { 
                              setSelectedAppointment(apt);
                              setShowViewModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="View Details"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => { 
                              setEditingAppointment(apt); 
                              setShowEditModal(true); 
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAppointment(apt.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AppointmentModals
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        newAppointment={newAppointment}
        setNewAppointment={setNewAppointment}
        handleCreateAppointment={handleCreateAppointment}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingAppointment={editingAppointment}
        setEditingAppointment={setEditingAppointment}
        handleUpdateAppointment={handleUpdateAppointment}
      />

      <AppointmentViewModal
        show={showViewModal}
        appointment={selectedAppointment}
        users={users}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAppointment(null);
        }}
      />
    </div>
  );
}