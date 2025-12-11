'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Stethoscope,
  Download,
  BarChart3,
  Calendar,
  Building2,
 
} from 'lucide-react';
import { authUtils, usersAPI } from '../../../../lib/api';

type ReportType = 'system' | 'user' | 'doctor';

interface MonthlyData {
  month: string;
  count: number;
  change?: number;
  changePercent?: number;
}

interface User {
  id: string;
  username: string;
  role: string;
}


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5255';

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('system');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // User/Doctor specific
  const [users, setUsers] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (reportType === 'system') {
      loadSystemReport();
    }
  }, [reportType, selectedYear]);

  useEffect(() => {
    if (reportType === 'user' && selectedUserId) {
      loadUserReport();
    }
  }, [reportType, selectedYear, selectedUserId]);

  useEffect(() => {
    if (reportType === 'doctor' && selectedDoctorId) {
      loadDoctorReport();
    }
  }, [reportType, selectedYear, selectedDoctorId]);

  const loadUsers = async () => {
    try {
      const adminId = authUtils.getUserId();
      if (!adminId) return;

      const result = await usersAPI.getAll(adminId);
      if (result.success && result.data) {
        setUsers(result.data);
        

        const doctorsList = result.data.filter((user: User) => user.role === 'doctor');
        setDoctors(doctorsList);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };


  const loadSystemReport = async () => {
    try {
      setIsLoading(true);
  
      const response = await fetch(
        `${API_BASE_URL}/book/MonthlyReport?year=${selectedYear}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const processed = processMonthlyData(result.data);
        setMonthlyData(processed);
      }
    } catch (error) {
      console.error('Error loading system report:', error);
      alert('Failed to load system report');
    } finally {
      setIsLoading(false);
    }
  };


  const loadUserReport = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/book/UserMonthlyReport?userId=${selectedUserId}&year=${selectedYear}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const processed = processMonthlyData(result.data);
        setMonthlyData(processed);
      }
    } catch (error) {
      console.error('Error loading user report:', error);
      alert('Failed to load user report');
    } finally {
      setIsLoading(false);
    }
  };


  const loadDoctorReport = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/book/DoctorMonthlyReport?doctorId=${selectedDoctorId}&year=${selectedYear}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        const processed = processMonthlyData(result.data);
        setMonthlyData(processed);
      }
    } catch (error) {
      console.error('Error loading doctor report:', error);
      alert('Failed to load doctor report');
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (data: { [key: string]: number }): MonthlyData[] => {
    const months = [
      '01', '02', '03', '04', '05', '06',
      '07', '08', '09', '10', '11', '12'
    ];

    const processed: MonthlyData[] = [];
    let previousCount = 0;

    months.forEach((month, index) => {
      const monthKey = `${selectedYear}-${month}`;
      const count = data[monthKey] || 0;

      let change = 0;
      let changePercent = 0;

      if (index > 0 && previousCount > 0) {
        change = count - previousCount;
        changePercent = ((count - previousCount) / previousCount) * 100;
      }

      processed.push({
        month: monthKey,
        count,
        change: index === 0 ? undefined : change,
        changePercent: index === 0 ? undefined : changePercent
      });

      if (count > 0) previousCount = count;
    });

    return processed;
  };

  const downloadCSV = () => {
    const headers = ['Month', 'Appointments', 'Change', 'Change %'];
    const rows = monthlyData
      .filter(data => data.count > 0)
      .map(data => [
        getMonthName(data.month),
        data.count,
        data.change !== undefined ? data.change : 'N/A',
        data.changePercent !== undefined ? `${data.changePercent.toFixed(1)}%` : 'N/A'
      ]);

    let filename = '';
    if (reportType === 'system') {
      filename = `system-report-${selectedYear}.csv`;
    } else if (reportType === 'user') {
      const user = users.find(u => u.id === selectedUserId);
      filename = `user-report-${user?.username || 'unknown'}-${selectedYear}.csv`;
    } else {
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      filename = `doctor-report-${doctor?.username || 'unknown'}-${selectedYear}.csv`;
    }

    const csvContent = [
      `Report Type,${reportType === 'system' ? 'System-wide' : reportType === 'user' ? 'User-specific' : 'Doctor-specific'}`,
      `Year,${selectedYear}`,
      reportType === 'user' ? `User,${users.find(u => u.id === selectedUserId)?.username || ''}` : '',
      reportType === 'doctor' ? `Doctor,${doctors.find(d => d.id === selectedDoctorId)?.username || ''}` : '',
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].filter(line => line !== '').join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const totalAppointments = monthlyData.reduce((sum, data) => sum + data.count, 0);
  const activeMonths = monthlyData.filter(data => data.count > 0).length;
  const averagePerMonth = activeMonths > 0 ? totalAppointments / activeMonths : 0;
  const maxMonth = monthlyData.reduce((max, data) => data.count > max.count ? data : max, { month: '', count: 0 });

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getReportTitle = () => {
    if (reportType === 'system') return 'System-wide Appointments Growth';
    if (reportType === 'user') {
      const user = users.find(u => u.id === selectedUserId);
      return user ? `User: ${user.username}` : 'User Appointments Growth';
    }
    if (reportType === 'doctor') {
      const doctor = doctors.find(d => d.id === selectedDoctorId);
      return doctor ? `Doctor: ${doctor.username}` : 'Doctor Appointments Growth';
    }
    return 'Appointments Growth Report';
  };



  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Appointments Growth Reports
        </h1>
        <p className="text-gray-600 mt-2">Analyze appointment trends across different scopes</p>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Report Type</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* System Report */}
          <button
            onClick={() => {
              setReportType('system');
              setSelectedUserId('');
              setSelectedDoctorId('');
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              reportType === 'system'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-3 ${
                reportType === 'system' ? 'bg-blue-100' : 'bg-gray-100'
              }`}>
                <Building2 className={`w-8 h-8 ${
                  reportType === 'system' ? 'text-blue-600' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">System-wide Report</h3>
              <p className="text-sm text-gray-600">All appointments in the system</p>
            </div>
          </button>

          {/* User Report */}
          <button
            onClick={() => {
              setReportType('user');
              setSelectedDoctorId('');
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              reportType === 'user'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-3 ${
                reportType === 'user' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Users className={`w-8 h-8 ${
                  reportType === 'user' ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">User Report</h3>
              <p className="text-sm text-gray-600">Individual user appointments</p>
            </div>
          </button>

          {/* Doctor Report */}
          <button
            onClick={() => {
              setReportType('doctor');
              setSelectedUserId('');
            }}
            className={`p-6 rounded-xl border-2 transition-all ${
              reportType === 'doctor'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-3 ${
                reportType === 'doctor' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <Stethoscope className={`w-8 h-8 ${
                  reportType === 'doctor' ? 'text-purple-600' : 'text-gray-600'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Doctor Report</h3>
              <p className="text-sm text-gray-600">Individual doctor appointments</p>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* User Selector */}
          {reportType === 'user' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User (Customer)
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">-- Select a user --</option>
                {users.filter(u => u.role === 'customer').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Doctor Selector */}
          {reportType === 'doctor' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="">-- Select a doctor --</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.username}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading report...</p>
          </div>
        </div>
      )}

      {/* Report Results */}
      {!isLoading && monthlyData.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total</p>
                  <p className="text-4xl font-bold mt-2">{totalAppointments}</p>
                  <p className="text-blue-100 text-xs mt-1">appointments</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <Calendar className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Active Months</p>
                  <p className="text-4xl font-bold mt-2">{activeMonths}</p>
                  <p className="text-green-100 text-xs mt-1">out of 12</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <BarChart3 className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Average/Month</p>
                  <p className="text-4xl font-bold mt-2">{averagePerMonth.toFixed(1)}</p>
                  <p className="text-purple-100 text-xs mt-1">appointments</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Peak Month</p>
                  <p className="text-2xl font-bold mt-2">{maxMonth.count}</p>
                  <p className="text-amber-100 text-xs mt-1">
                    {maxMonth.month ? getMonthName(maxMonth.month) : 'N/A'}
                  </p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Report Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{getReportTitle()}</h2>
                <p className="text-gray-600 mt-1">Monthly growth analysis for {selectedYear}</p>
              </div>
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download CSV
              </button>
            </div>
          </div>

          {/* Monthly Data Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Month</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Appointments</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Change</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Growth %</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {monthlyData.filter(data => data.count > 0).map((data) => (
                    <tr key={data.month} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {getMonthName(data.month)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {data.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {data.change !== undefined ? (
                          <span className={`font-semibold ${
                            data.change > 0 ? 'text-green-600' : data.change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {data.change > 0 ? '+' : ''}{data.change}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {data.changePercent !== undefined ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                            data.changePercent > 0 
                              ? 'bg-green-100 text-green-700' 
                              : data.changePercent < 0 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="bg-gray-200 rounded-full h-3 max-w-xs">
                          <div 
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ 
                              width: `${(data.count / Math.max(...monthlyData.map(d => d.count))) * 100}%` 
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && monthlyData.length === 0 && (reportType !== 'user' || selectedUserId) && (reportType !== 'doctor' || selectedDoctorId) && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">No appointments found for the selected criteria</p>
        </div>
      )}

      {/* Selection Required State */}
      {!isLoading && reportType === 'user' && !selectedUserId && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a User</h3>
          <p className="text-gray-600">Please select a user from the dropdown above to view their report</p>
        </div>
      )}

      {!isLoading && reportType === 'doctor' && !selectedDoctorId && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Doctor</h3>
          <p className="text-gray-600">Please select a doctor from the dropdown above to view their report</p>
        </div>
      )}
    </div>
  );
}