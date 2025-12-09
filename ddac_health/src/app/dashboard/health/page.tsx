'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Heart, TrendingUp, Calendar, Filter } from 'lucide-react';
import { healthAPI, authUtils } from '../../../lib/api';
import HealthRecordCard from '../../../components/HealthRecordCard';
import HealthTrendsChart from '../../../components/HealthTrendsChart';
import HealthRecordModal from '../../../components/HealthRecordModal';

interface HealthRecord {
  id: string;
  userId: string;
  height: number | null;
  weight: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  medicalHistory: string | null;
  recordDate: string;
  notes: string | null;
  createTime: string;
  updateTime: string;
}

export default function CustomerHealthRecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bloodPressure' | 'bmi'>('weight');
  const [dateFilter, setDateFilter] = useState<'all' | '1m' | '3m' | '6m' | '1y'>('all');

  useEffect(() => {
    loadHealthRecords();
  }, []);

  useEffect(() => {
    filterRecordsByDate();
  }, [dateFilter, records]);

  const loadHealthRecords = async () => {
    try {
      setIsLoading(true);
      const userId = authUtils.getUserId();
      if (!userId) return;

      const result = await healthAPI.getByUserId(userId);
      
      if (result.success && result.data) {
        setRecords(result.data);
        setFilteredRecords(result.data);
      }
    } catch (error) {
      console.error('Error loading health records:', error);
      alert('Failed to load health records');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecordsByDate = () => {
    if (dateFilter === 'all') {
      setFilteredRecords(records);
      return;
    }

    const now = new Date();
    const monthsMap = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };
    const months = monthsMap[dateFilter];
    const startDate = new Date(now.setMonth(now.getMonth() - months));

    const filtered = records.filter(record => 
      new Date(record.recordDate) >= startDate
    );
    setFilteredRecords(filtered);
  };

  const handleAddClick = () => {
    setEditingRecord(null);
    setShowModal(true);
  };

  const handleEditClick = (record: HealthRecord) => {
    setEditingRecord(record);
    setShowModal(true);
  };

  const handleSaveRecord = async (data: Partial<HealthRecord>) => {
    try {
      setIsProcessing(true);
      const userId = authUtils.getUserId();
      if (!userId) return;

      if (editingRecord) {
        // Update existing record
        const result = await healthAPI.update({
          ...editingRecord,
          ...data
        } as HealthRecord);

        if (result.success) {
          alert('Health record updated successfully!');
          setShowModal(false);
          setEditingRecord(null);
          loadHealthRecords();
        } else {
          alert(result.message || 'Failed to update record');
        }
      } else {
        // Create new record
        const result = await healthAPI.create({
          UserId: userId,
          Height: data.height ?? null,
          Weight: data.weight ?? null,
          BloodPressureSystolic: data.bloodPressureSystolic ?? null,
          BloodPressureDiastolic: data.bloodPressureDiastolic ?? null,
          MedicalHistory: data.medicalHistory ?? null,
          RecordDate: data.recordDate!,
          Notes: data.notes ?? null
        });

        if (result.success) {
          alert('Health record created successfully!');
          setShowModal(false);
          loadHealthRecords();
        } else {
          alert(result.message || 'Failed to create record');
        }
      }
    } catch (error) {
      console.error('Error saving health record:', error);
      alert('Failed to save health record');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

    try {
      const result = await healthAPI.delete(id);
      
      if (result.success) {
        alert('Health record deleted successfully!');
        loadHealthRecords();
      } else {
        alert(result.message || 'Failed to delete record');
      }
    } catch (error) {
      console.error('Error deleting health record:', error);
      alert('Failed to delete health record');
    }
  };

  const getLatestMetrics = () => {
    if (records.length === 0) return null;
    
    const latest = records.reduce((prev, current) => 
      new Date(current.recordDate) > new Date(prev.recordDate) ? current : prev
    );

    const calculateBMI = () => {
      if (latest.height && latest.weight) {
        const heightInMeters = latest.height / 100;
        return (latest.weight / (heightInMeters * heightInMeters)).toFixed(1);
      }
      return null;
    };

    return {
      weight: latest.weight,
      bloodPressure: latest.bloodPressureSystolic && latest.bloodPressureDiastolic 
        ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`
        : null,
      bmi: calculateBMI(),
      date: new Date(latest.recordDate).toLocaleDateString()
    };
  };


  const getLatestRecord = (): HealthRecord | null => {
    if (records.length === 0) return null;
    
    return records.reduce((prev, current) => 
      new Date(current.recordDate) > new Date(prev.recordDate) ? current : prev
    );
  };

  const latestMetrics = getLatestMetrics();
  const latestRecord = getLatestRecord();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading health records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            My Health Records
          </h1>
          <p className="text-gray-600 mt-2">Track and monitor your health metrics</p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Record
        </button>
      </div>

      {/* Quick Stats */}
      {latestMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <p className="text-sm text-green-700 font-medium mb-1">Latest Weight</p>
            <p className="text-3xl font-bold text-green-900">
              {latestMetrics.weight ? `${latestMetrics.weight} kg` : 'N/A'}
            </p>
            <p className="text-xs text-green-600 mt-2">{latestMetrics.date}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border-2 border-red-200">
            <p className="text-sm text-red-700 font-medium mb-1">Blood Pressure</p>
            <p className="text-3xl font-bold text-red-900">
              {latestMetrics.bloodPressure || 'N/A'}
            </p>
            <p className="text-xs text-red-600 mt-2">{latestMetrics.date}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <p className="text-sm text-purple-700 font-medium mb-1">BMI</p>
            <p className="text-3xl font-bold text-purple-900">
              {latestMetrics.bmi || 'N/A'}
            </p>
            <p className="text-xs text-purple-600 mt-2">{latestMetrics.date}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-1">Total Records</p>
            <p className="text-3xl font-bold text-blue-900">{records.length}</p>
            <p className="text-xs text-blue-600 mt-2">All time</p>
          </div>
        </div>
      )}

      {/* Filters and Trend Selection */}
      <div className="bg-white rounded-xl shadow-md border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Time</option>
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">View Trend:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="weight">Weight</option>
              <option value="bloodPressure">Blood Pressure</option>
              <option value="bmi">BMI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      {filteredRecords.length > 0 && (
        <HealthTrendsChart records={filteredRecords} metric={selectedMetric} />
      )}

      {/* Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Health Records</h3>
          <p className="text-gray-600 mb-6">Start tracking your health by adding your first record</p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add First Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <HealthRecordCard
              key={record.id}
              record={record}
              onEdit={handleEditClick}
              onDelete={handleDeleteRecord}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <HealthRecordModal
        show={showModal}
        record={editingRecord}
        latestRecord={latestRecord}  
        onSave={handleSaveRecord}
        onClose={() => {
          setShowModal(false);
          setEditingRecord(null);
        }}
        isProcessing={isProcessing}
      />
    </div>
  );
}