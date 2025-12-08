'use client';

import React, { useEffect, useState } from 'react';
import { Search, Stethoscope, Calendar, Clock, MapPin, Award, Briefcase, User } from 'lucide-react';
import { userInfoAPI, appointmentsAPI, authUtils } from '../../../lib/api';

interface DoctorInfo {
  id: string;
  userId: string;
  name: string;
  gender: string;
  age: number;
  address: string;
  specialization?: string;
  experienceYears?: number;
  qualification?: string;
  bio?: string;
}

export default function BookAppointmentPage() {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ 新的预约表单字段
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [symptoms, setSymptoms] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const result = await userInfoAPI.getDoctors();
      if (result.success && result.data) {
        setDoctors(result.data);
        setFilteredDoctors(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      alert('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  // 搜索和筛选
  useEffect(() => {
    let filtered = doctors;

    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(doc => doc.specialization === selectedSpecialization);
    }

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, selectedSpecialization, doctors]);

  // 获取所有专业列表
  const specializations = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  // 打开预约模态框
  const handleBookClick = (doctor: DoctorInfo) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  // ✅ 自动计算结束时间（默认1小时后）
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    
    if (time) {
      const [hours, minutes] = time.split(':');
      const endHour = (parseInt(hours) + 1).toString().padStart(2, '0');
      setEndTime(`${endHour}:${minutes}`);
    }
  };

  // ✅ 验证时间间隔（最多1小时）
  const validateTimeDuration = (start: string, end: string): boolean => {
    if (!start || !end) return true;
    
    const startDate = new Date(`2000-01-01T${start}:00`);
    const endDate = new Date(`2000-01-01T${end}:00`);
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / 60000;
    
    return durationMinutes > 0 && durationMinutes <= 60;
  };

  // ✅ 验证工作时间（8:00-18:00）
  const validateWorkingHours = (time: string): boolean => {
    if (!time) return true;
    
    const [hours] = time.split(':').map(Number);
    return hours >= 8 && hours < 18;
  };

  // ✅ 提交预约
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;

    try {
      setIsSubmitting(true);

      const userId = authUtils.getUserId();
      if (!userId) {
        alert('Please login first');
        return;
      }

      // ✅ 验证时间
      if (!appointmentDate || !startTime || !endTime) {
        alert('Please fill in all time fields');
        return;
      }

      // ✅ 验证工作时间
      if (!validateWorkingHours(startTime)) {
        alert('Start time must be between 8:00 AM and 6:00 PM (doctor\'s working hours)');
        return;
      }

      if (!validateWorkingHours(endTime)) {
        alert('End time must be within doctor\'s working hours (8:00 AM - 6:00 PM)');
        return;
      }

      // ✅ 验证时间间隔
      if (!validateTimeDuration(startTime, endTime)) {
        alert('Appointment duration must be between 1 minute and 1 hour');
        return;
      }

      // ✅ 组合成完整的 DateTime
      const startDateTime = new Date(`${appointmentDate}T${startTime}:00`);
      const endDateTime = new Date(`${appointmentDate}T${endTime}:00`);

      // 验证结束时间必须在开始时间之后
      if (endDateTime <= startDateTime) {
        alert('End time must be after start time');
        return;
      }

      // 验证时间不能是过去
      const now = new Date();
      if (startDateTime < now) {
        alert('Appointment time cannot be in the past');
        return;
      }

      // ✅ 使用新的 API 结构
      const result = await appointmentsAPI.create({
        UserId: userId,
        DoctorId: selectedDoctor.userId,
        IllnessTxt: symptoms,
        StartTime: startDateTime.toISOString(),
        EndTime: endDateTime.toISOString()
      });

      if (result.success) {
        alert('Appointment request submitted successfully! Please wait for doctor confirmation.');
        setShowBookingModal(false);
        setAppointmentDate('');
        setStartTime('');
        setEndTime('');
        setSymptoms('');
        setSelectedDoctor(null);
      } else {
        alert(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit appointment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-blue-100">Find and book with our qualified doctors</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, specialization, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors List */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">{doctor.name}</h3>
                <p className="text-blue-100 text-sm">{doctor.specialization || 'General Practice'}</p>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{doctor.gender}, {doctor.age} years</span>
                </div>

                {doctor.experienceYears && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{doctor.experienceYears} years experience</span>
                  </div>
                )}

                {doctor.qualification && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{doctor.qualification}</span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{doctor.address}</span>
                </div>

                {doctor.bio && (
                  <p className="text-sm text-gray-600 pt-3 border-t">{doctor.bio}</p>
                )}

                <button
                  onClick={() => handleBookClick(doctor)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
              <h2 className="text-2xl font-bold">Book Appointment</h2>
              <p className="mt-1">with Dr. {selectedDoctor.name}</p>
              <p className="text-sm text-blue-100">{selectedDoctor.specialization}</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
              {/* ✅ 工作时间说明 */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">⏰ Working Hours</p>
                <p className="text-sm text-blue-700">
                  Appointments available: <strong>8:00 AM - 6:00 PM</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Maximum appointment duration: 1 hour
                </p>
              </div>

              {/* ✅ 预约日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* ✅ 开始时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    min="08:00"
                    max="18:00"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      startTime && !validateWorkingHours(startTime) ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {startTime && !validateWorkingHours(startTime) && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Must be between 8:00 AM and 6:00 PM</p>
                )}
                {startTime && validateWorkingHours(startTime) && (
                  <p className="text-xs text-green-600 mt-1">✓ Valid working hours</p>
                )}
              </div>

              {/* ✅ 结束时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min="08:00"
                    max="18:00"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      endTime && (!validateWorkingHours(endTime) || !validateTimeDuration(startTime, endTime)) 
                        ? 'border-red-500' 
                        : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {startTime && endTime && (
                  <>
                    {!validateWorkingHours(endTime) && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Must be within working hours (8:00 AM - 6:00 PM)</p>
                    )}
                    {validateWorkingHours(endTime) && !validateTimeDuration(startTime, endTime) && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Duration must be max 1 hour</p>
                    )}
                    {validateWorkingHours(endTime) && validateTimeDuration(startTime, endTime) && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Duration: {Math.abs(
                          (new Date(`2000-01-01T${endTime}:00`).getTime() - 
                           new Date(`2000-01-01T${startTime}:00`).getTime()) / 60000
                        )} minutes
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* ✅ 症状描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms / Reason for Visit *
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={4}
                  placeholder="Describe your symptoms or reason for consultation..."
                  required
                />
              </div>

              {/* 预约摘要 */}
              {appointmentDate && startTime && endTime && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2">Appointment Summary:</p>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>📅 Date: {new Date(appointmentDate).toLocaleDateString()}</p>
                    <p>🕐 Time: {startTime} - {endTime}</p>
                    <p>👨‍⚕️ Doctor: Dr. {selectedDoctor.name}</p>
                    <p>🏥 Specialization: {selectedDoctor.specialization}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedDoctor(null);
                    setAppointmentDate('');
                    setStartTime('');
                    setEndTime('');
                    setSymptoms('');
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}