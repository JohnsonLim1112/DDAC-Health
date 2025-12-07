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
  
  // 预约表单
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
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

  // 提交预约
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor) return;

    try {
      const userId = authUtils.getUserId();
      if (!userId) {
        alert('Please login first');
        return;
      }

      const appointmentDateTime = `${appointmentDate} ${appointmentTime}`;
      const illnessText = `${symptoms}\n\nScheduled for: ${appointmentDateTime}`;

      const result = await appointmentsAPI.create({
        UserId: userId,
        DoctorId: selectedDoctor.userId,
        IllnessTxt: illnessText
      });

      if (result.success) {
        alert('Appointment request submitted successfully!');
        setShowBookingModal(false);
        setAppointmentDate('');
        setAppointmentTime('');
        setSymptoms('');
        setSelectedDoctor(null);
      } else {
        alert(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit appointment request');
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
              <p className="text-gray-600 mt-1">with Dr. {selectedDoctor.name}</p>
              <p className="text-sm text-blue-600">{selectedDoctor.specialization}</p>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select time</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms / Reason for Visit
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedDoctor(null);
                    setAppointmentDate('');
                    setAppointmentTime('');
                    setSymptoms('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}