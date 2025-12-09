import React from 'react';
import { Heart, Activity, Ruler, Weight, Calendar, FileText, Edit, Trash2 } from 'lucide-react';

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

interface HealthRecordCardProps {
  record: HealthRecord;
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

export default function HealthRecordCard({ record, onEdit, onDelete }: HealthRecordCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateBMI = () => {
    if (record.height && record.weight) {
      const heightInMeters = record.height / 100;
      const bmi = record.weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: 'text-green-600' };
    if (systolic < 130 && diastolic < 80) return { label: 'Elevated', color: 'text-yellow-600' };
    if (systolic < 140 || diastolic < 90) return { label: 'High (Stage 1)', color: 'text-orange-600' };
    return { label: 'High (Stage 2)', color: 'text-red-600' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const bpCategory = (record.bloodPressureSystolic && record.bloodPressureDiastolic) 
    ? getBPCategory(record.bloodPressureSystolic, record.bloodPressureDiastolic) 
    : null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h3 className="font-semibold text-lg">{formatDate(record.recordDate)}</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(record)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(record.id)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Height */}
          {record.height && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Ruler className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-medium">Height</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{record.height} cm</p>
            </div>
          )}

          {/* Weight */}
          {record.weight && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <Weight className="w-4 h-4 text-green-600" />
                <p className="text-xs text-green-700 font-medium">Weight</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{record.weight} kg</p>
            </div>
          )}

          {/* Blood Pressure */}
          {record.bloodPressureSystolic && record.bloodPressureDiastolic && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-red-600" />
                <p className="text-xs text-red-700 font-medium">Blood Pressure</p>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
              </p>
              {bpCategory && (
                <p className={`text-xs font-semibold mt-1 ${bpCategory.color}`}>
                  {bpCategory.label}
                </p>
              )}
            </div>
          )}

          {/* BMI */}
          {bmi && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-purple-700 font-medium">BMI</p>
              </div>
              <p className="text-lg font-bold text-gray-800">{bmi}</p>
              {bmiCategory && (
                <p className={`text-xs font-semibold mt-1 ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Medical History */}
        {record.medicalHistory && (
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="text-xs text-orange-700 font-medium mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Medical History
            </p>
            <p className="text-sm text-gray-800">{record.medicalHistory}</p>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-700 font-medium mb-2">Notes</p>
            <p className="text-sm text-gray-800">{record.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}