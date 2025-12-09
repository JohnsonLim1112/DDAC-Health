import React, { useState } from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
import { usersAPI } from '../../../../lib/api';

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

interface CreateAppointmentData {
  UserId: string;
  DoctorId: string;
  IllnessTxt: string;
  AppointmentDate: string;  
  StartTime: string;       
  EndTime: string;          
}

interface User {
  id: string;
  username: string;
  role: string;
}

interface AppointmentModalsProps {
  showCreateModal: boolean;
  setShowCreateModal: (show: boolean) => void;
  newAppointment: CreateAppointmentData;
  setNewAppointment: (data: CreateAppointmentData) => void;
  handleCreateAppointment: (e: React.FormEvent) => void;
  showEditModal: boolean;
  setShowEditModal: (show: boolean) => void;
  editingAppointment: Appointment | null;
  setEditingAppointment: (appointment: Appointment | null) => void;
  handleUpdateAppointment: (e: React.FormEvent) => void;
}

export default function AppointmentModals({
  showCreateModal,
  setShowCreateModal,
  newAppointment,
  setNewAppointment,
  handleCreateAppointment,
  showEditModal,
  setShowEditModal,
  editingAppointment,
  setEditingAppointment,
  handleUpdateAppointment
}: AppointmentModalsProps) {
  const [patientEmail, setPatientEmail] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<User[]>([]);
  const [doctorSearchResults, setDoctorSearchResults] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);


  const loadUsers = async () => {
    try {
      const adminId = localStorage.getItem('userData');
      if (!adminId) return;
      
      const userData = JSON.parse(adminId);
      const result = await usersAPI.getAll(userData.LoginId);
      
      if (result.success && result.data) {
        setAllUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

 
  const searchPatient = (email: string) => {
    setPatientEmail(email);
    if (email.length > 0) {
      const results = allUsers.filter(u => 
        u.username.toLowerCase().includes(email.toLowerCase()) && 
        u.role === 'customer'
      );
      setPatientSearchResults(results);
    } else {
      setPatientSearchResults([]);
    }
  };


  const searchDoctor = (email: string) => {
    setDoctorEmail(email);
    if (email.length > 0) {
      const results = allUsers.filter(u => 
        u.username.toLowerCase().includes(email.toLowerCase()) && 
        u.role === 'doctor'
      );
      setDoctorSearchResults(results);
    } else {
      setDoctorSearchResults([]);
    }
  };

  
  const selectPatient = (user: User) => {
    setNewAppointment({ ...newAppointment, UserId: user.id });
    setPatientEmail(user.username);
    setPatientSearchResults([]);
  };

 
  const selectDoctor = (user: User) => {
    setNewAppointment({ ...newAppointment, DoctorId: user.id });
    setDoctorEmail(user.username);
    setDoctorSearchResults([]);
  };

  
  React.useEffect(() => {
    if (showCreateModal) {
      loadUsers();
     
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      if (!newAppointment.AppointmentDate) {
        setNewAppointment({
          ...newAppointment,
          AppointmentDate: tomorrowStr,
          StartTime: '09:00',
          EndTime: '10:00'
        });
      }
    }
  }, [showCreateModal]);

  return (
    <>
      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Create New Appointment</h2>
              <p className="text-gray-600 mt-1">Schedule a new appointment</p>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              {/* Patient Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Email *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={patientEmail}
                    onChange={(e) => searchPatient(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search patient by email..."
                    required
                  />
                </div>
                {patientSearchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {patientSearchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={() => selectPatient(user)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    ))}
                  </div>
                )}
                {newAppointment.UserId && (
                  <p className="text-xs text-green-600 mt-1">✓ Patient selected</p>
                )}
              </div>

              {/* Doctor Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Email *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={doctorEmail}
                    onChange={(e) => searchDoctor(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search doctor by email..."
                    required
                  />
                </div>
                {doctorSearchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {doctorSearchResults.map(user => (
                      <div
                        key={user.id}
                        onClick={() => selectDoctor(user)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                      </div>
                    ))}
                  </div>
                )}
                {newAppointment.DoctorId && (
                  <p className="text-xs text-green-600 mt-1">✓ Doctor selected</p>
                )}
              </div>

              {/* ✅ Appointment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Appointment Date *
                </label>
                <input
                  type="date"
                  value={newAppointment.AppointmentDate}
                  onChange={(e) => setNewAppointment({ ...newAppointment, AppointmentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Select the date for your appointment</p>
              </div>

              {/* ✅ Time Slots */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={newAppointment.StartTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, StartTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={newAppointment.EndTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, EndTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Illness Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Illness Description *</label>
                <textarea
                  value={newAppointment.IllnessTxt}
                  onChange={(e) => setNewAppointment({ ...newAppointment, IllnessTxt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Describe the symptoms"
                  rows={4}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAppointment({ 
                      UserId: '', 
                      DoctorId: '', 
                      IllnessTxt: '',
                      AppointmentDate: '',
                      StartTime: '',
                      EndTime: ''
                    });
                    setPatientEmail('');
                    setDoctorEmail('');
                    setPatientSearchResults([]);
                    setDoctorSearchResults([]);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAppointment.UserId || !newAppointment.DoctorId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Edit Appointment</h2>
              <p className="text-gray-600 mt-1">Update appointment details</p>
            </div>
            
            <form onSubmit={handleUpdateAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                <input 
                  type="text" 
                  value={editingAppointment.userId} 
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor ID</label>
                <input 
                  type="text" 
                  value={editingAppointment.doctorId} 
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" 
                />
              </div>

              {/* ✅ Appointment Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Appointment Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editingAppointment.startTime?.substring(0, 16) || ''}
                  onChange={(e) => setEditingAppointment({ 
                    ...editingAppointment, 
                    startTime: new Date(e.target.value).toISOString() 
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editingAppointment.endTime?.substring(0, 16) || ''}
                  onChange={(e) => setEditingAppointment({ 
                    ...editingAppointment, 
                    endTime: new Date(e.target.value).toISOString() 
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Illness</label>
                <textarea
                  value={editingAppointment.illnessTxt}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, illnessTxt: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4} 
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine</label>
                <input
                  type="text"
                  value={editingAppointment.medicine}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, medicine: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Prescribed medicine"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (RM)</label>
                <input
                  type="number" 
                  step="0.01"
                  value={editingAppointment.price}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editingAppointment.status}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="0">Pending</option>
                  <option value="1">Accepted</option>
                  <option value="2">Rejected</option>
                  <option value="3">Completed</option>
                  <option value="4">Cancelled</option>
                  <option value="5">Paid</option>
                </select>
              </div>

              {/* ✅ Rejection Reason  */}
              {editingAppointment.status === '2' && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={editingAppointment.comment}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, comment: e.target.value })}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    rows={3}
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                  <p className="text-xs text-red-600 mt-1">This will be visible to the patient</p>
                </div>
              )}

              {/* ✅ Comment/Notes  */}
              {editingAppointment.status !== '2' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment / Notes
                  </label>
                  <textarea
                    value={editingAppointment.comment}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, comment: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Add any notes or comments..."
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingAppointment.isAccept}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, isAccept: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Accepted by Doctor</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                  }}
                  className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}