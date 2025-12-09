import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, X } from 'lucide-react';
import { healthAPI } from '../lib/api';
import HealthRecordCard from '../components/HealthRecordCard';
import HealthTrendsChart from '../components/HealthTrendsChart';

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

interface PatientHealthViewProps {
  show: boolean;
  patientId: string;
  patientName?: string;
  onClose: () => void;
}

export default function PatientHealthView({
  show,
  patientId,
  patientName,
  onClose
}: PatientHealthViewProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bloodPressure' | 'bmi'>('weight');

  useEffect(() => {
    if (show && patientId) {
      loadHealthRecords();
    }
  }, [show, patientId]);

  const loadHealthRecords = async () => {
    try {
      setIsLoading(true);
      const result = await healthAPI.getByUserId(patientId);
      
      if (result.success && result.data) {
        setRecords(result.data);
      }
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setIsLoading(false);
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

  if (!show) return null;

  const latestMetrics = getLatestMetrics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6" />
                Patient Health Records
              </h2>
              {patientName && (
                <p className="text-blue-100 mt-1">Patient: {patientName}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading health records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No health records available for this patient</p>
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              {latestMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Latest Weight</p>
                    <p className="text-2xl font-bold text-green-900">
                      {latestMetrics.weight ? `${latestMetrics.weight} kg` : 'N/A'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">{latestMetrics.date}</p>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
                    <p className="text-sm text-red-700 font-medium mb-1">Blood Pressure</p>
                    <p className="text-2xl font-bold text-red-900">
                      {latestMetrics.bloodPressure || 'N/A'}
                    </p>
                    <p className="text-xs text-red-600 mt-1">{latestMetrics.date}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                    <p className="text-sm text-purple-700 font-medium mb-1">BMI</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {latestMetrics.bmi || 'N/A'}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">{latestMetrics.date}</p>
                  </div>
                </div>
              )}

              {/* Metric Selector */}
              <div className="flex items-center gap-4">
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

              {/* Trend Chart */}
              <HealthTrendsChart records={records} metric={selectedMetric} />

              {/* Records Grid - Read Only */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Health Records History</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {records.slice(0, 6).map((record) => (
                    <HealthRecordCard
                      key={record.id}
                      record={record}
                      onEdit={() => {}}  // ✅ Disabled for doctors
                      onDelete={() => {}}  // ✅ Disabled for doctors
                    />
                  ))}
                </div>
                {records.length > 6 && (
                  <p className="text-center text-sm text-gray-600 mt-4">
                    Showing 6 of {records.length} records
                  </p>
                )}
              </div>
            </>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}