'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { authUtils } from '../../../../lib/api';

interface MonthlyData {
  month: string;
  count: number;
  change?: number;
  changePercent?: number;
}

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

// ✅ 使用环境变量
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5255';

export default function DoctorSummaryPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [monthDetails, setMonthDetails] = useState<{ [key: string]: Appointment[] }>({});
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadMonthlyReport();
  }, [selectedYear]);

  const loadMonthlyReport = async () => {
    try {
      setIsLoading(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      
      const response = await fetch(
        `${API_BASE_URL}/book/DoctorMonthlyReport?doctorId=${doctorId}&year=${selectedYear}`
      );
      
      const result = await response.json();

      if (result.success && result.data) {
        const processedData = processMonthlyData(result.data);
        setMonthlyData(processedData);
      }
    } catch (error) {
      console.error('Error loading monthly report:', error);
      alert('Failed to load monthly report');
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

  const loadMonthDetails = async (monthKey: string) => {
    if (monthDetails[monthKey]) {
      setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
      return;
    }

    try {
      setIsLoadingDetails(true);
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      const [year, month] = monthKey.split('-');
      
 
      const response = await fetch(
        `${API_BASE_URL}/book/DoctorMonthlyDetails?doctorId=${doctorId}&year=${year}&month=${parseInt(month)}`
      );

      const result = await response.json();

      if (result.success && result.data) {
        setMonthDetails(prev => ({
          ...prev,
          [monthKey]: result.data
        }));
        setExpandedMonth(monthKey);
      }
    } catch (error) {
      console.error('Error loading month details:', error);
      alert('Failed to load month details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const downloadCSVReport = () => {
    const headers = ['Month', 'Appointments', 'Change', 'Change %'];
    const rows = monthlyData
      .filter(data => data.count > 0)
      .map(data => [
        getMonthName(data.month),
        data.count,
        data.change !== undefined ? data.change : 'N/A',
        data.changePercent !== undefined ? `${data.changePercent.toFixed(1)}%` : 'N/A'
      ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctor-appointments-report-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadDetailedCSVReport = async () => {
    try {
      const doctorId = authUtils.getUserId();
      if (!doctorId) return;

      const allDetails: Appointment[] = [];
      
      for (const data of monthlyData.filter(d => d.count > 0)) {
        const [year, month] = data.month.split('-');
        

        const response = await fetch(
          `${API_BASE_URL}/book/DoctorMonthlyDetails?doctorId=${doctorId}&year=${year}&month=${parseInt(month)}`
        );
        
        const result = await response.json();
        if (result.success && result.data) {
          allDetails.push(...result.data);
        }
      }

      const headers = ['Date', 'Patient ID', 'Symptoms', 'Status', 'Price', 'Notes'];
      const rows = allDetails.map(apt => [
        new Date(apt.startTime).toLocaleDateString(),
        apt.userId.substring(0, 12),
        `"${apt.illnessTxt.replace(/"/g, '""')}"`,
        getStatusLabel(apt.status),
        `RM ${apt.price.toFixed(2)}`,
        `"${apt.comment.replace(/"/g, '""')}"`
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doctor-appointments-detailed-${selectedYear}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading detailed report:', error);
      alert('Failed to download detailed report');
    }
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      '0': 'Pending',
      '1': 'Accepted',
      '2': 'Rejected',
      '3': 'Completed',
      '4': 'Cancelled',
      '5': 'Paid'
    };
    return labels[status] || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      '0': 'bg-yellow-100 text-yellow-800',
      '1': 'bg-green-100 text-green-800',
      '2': 'bg-red-100 text-red-800',
      '3': 'bg-blue-100 text-blue-800',
      '4': 'bg-gray-100 text-gray-800',
      '5': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalAppointments = monthlyData.reduce((sum, data) => sum + data.count, 0);
  const activeMonths = monthlyData.filter(data => data.count > 0).length;
  const averagePerMonth = activeMonths > 0 ? totalAppointments / activeMonths : 0;

  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              Appointments Summary
            </h1>
            <p className="text-gray-600 mt-2">Monthly appointments report and statistics</p>
          </div>
          
          {/* Year Selector */}
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {/* Download Buttons */}
            <button
              onClick={downloadCSVReport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Summary CSV
            </button>
            <button
              onClick={downloadDetailedCSVReport}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Detailed CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
              <p className="text-4xl font-bold mt-2">{totalAppointments}</p>
              <p className="text-blue-100 text-xs mt-1">in {selectedYear}</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Months</p>
              <p className="text-4xl font-bold mt-2">{activeMonths}</p>
              <p className="text-purple-100 text-xs mt-1">out of 12 months</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Average/Month</p>
              <p className="text-4xl font-bold mt-2">{averagePerMonth.toFixed(1)}</p>
              <p className="text-green-100 text-xs mt-1">appointments</p>
            </div>
            <div className="bg-white/20 p-4 rounded-lg">
              <BarChart3 className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Breakdown</h2>
        
        {totalAppointments === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No appointments found for {selectedYear}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthlyData.filter(data => data.count > 0).map((data) => (
              <div key={data.month} className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => loadMonthDetails(data.month)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="font-semibold text-gray-800 min-w-[120px]">
                        {getMonthName(data.month)}
                      </div>
                      
                      <div className="flex items-center gap-6 flex-1">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">{data.count}</span>
                          <span className="text-sm text-gray-600 ml-2">appointments</span>
                        </div>

                        {data.change !== undefined && (
                          <div className={`flex items-center gap-1 ${
                            data.change > 0 ? 'text-green-600' : data.change < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {data.change > 0 ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : data.change < 0 ? (
                              <TrendingDown className="w-5 h-5" />
                            ) : null}
                            <span className="font-semibold">
                              {data.change > 0 ? '+' : ''}{data.change}
                            </span>
                            <span className="text-sm">
                              ({data.changePercent && data.changePercent > 0 ? '+' : ''}
                              {data.changePercent?.toFixed(1)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-gray-400">
                      {expandedMonth === data.month ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(data.count / Math.max(...monthlyData.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedMonth === data.month && (
                  <div className="border-t bg-white">
                    {isLoadingDetails ? (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading details...</p>
                      </div>
                    ) : monthDetails[data.month] ? (
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Patient ID</th>
                                <th className="px-4 py-2 text-left">Symptoms</th>
                                <th className="px-4 py-2 text-left">Status</th>
                                <th className="px-4 py-2 text-right">Price</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {monthDetails[data.month].map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    {new Date(apt.startTime).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 font-mono text-xs">
                                    {apt.userId.substring(0, 12)}...
                                  </td>
                                  <td className="px-4 py-3 max-w-xs truncate">
                                    {apt.illnessTxt}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                      {getStatusLabel(apt.status)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold">
                                    RM {apt.price.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}