import React, { useState, useEffect } from 'react';
import { X, Heart, Ruler, Weight, Activity, FileText, StickyNote, Calendar } from 'lucide-react';

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

interface HealthRecordModalProps {
  show: boolean;
  record: HealthRecord | null;
  latestRecord: HealthRecord | null; 
  onSave: (data: Partial<HealthRecord>) => void;
  onClose: () => void;
  isProcessing: boolean;
}

export default function HealthRecordModal({
  show,
  record,
  latestRecord, 
  onSave,
  onClose,
  isProcessing
}: HealthRecordModalProps) {
  const [formData, setFormData] = useState({
    recordDate: '',
    height: '',
    weight: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    medicalHistory: '',
    notes: ''
  });

  useEffect(() => {
    if (record) {
    
      setFormData({
        recordDate: record.recordDate.split('T')[0],
        height: record.height?.toString() || '',
        weight: record.weight?.toString() || '',
        bloodPressureSystolic: record.bloodPressureSystolic?.toString() || '',
        bloodPressureDiastolic: record.bloodPressureDiastolic?.toString() || '',
        medicalHistory: record.medicalHistory || '',
        notes: record.notes || ''
      });
    } else if (latestRecord) {
     
      setFormData({
        recordDate: new Date().toISOString().split('T')[0],
        height: latestRecord.height?.toString() || '',  
        weight: '', 
        bloodPressureSystolic: '',  
        bloodPressureDiastolic: '',
        medicalHistory: latestRecord.medicalHistory || '',  
        notes: ''  
      });
    } else {
     
      setFormData({
        recordDate: new Date().toISOString().split('T')[0],
        height: '',
        weight: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        medicalHistory: '',
        notes: ''
      });
    }
  }, [record, latestRecord, show]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: any = {
      recordDate: formData.recordDate,
      height: formData.height ? parseFloat(formData.height) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      bloodPressureSystolic: formData.bloodPressureSystolic ? parseInt(formData.bloodPressureSystolic) : null,
      bloodPressureDiastolic: formData.bloodPressureDiastolic ? parseInt(formData.bloodPressureDiastolic) : null,
      medicalHistory: formData.medicalHistory || null,
      notes: formData.notes || null
    };

    if (record) {
      data.id = record.id;
      data.userId = record.userId;
      data.createTime = record.createTime;
      data.updateTime = new Date().toISOString();
    }

    onSave(data);
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height && weight) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  if (!show) return null;

  const bmi = calculateBMI();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6" />
                {record ? 'Edit Health Record' : 'Add Health Record'}
              </h2>
              <p className="text-blue-100 mt-1">Track your health metrics</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Record Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Record Date *
            </label>
            <input
              type="date"
              value={formData.recordDate}
              onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="170.5"
              />
              {!record && latestRecord?.height && (
                <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from last record</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Weight className="w-4 h-4" />
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="70.5"
              />
            </div>
          </div>

          {/* BMI Display */}
          {bmi && (
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Body Mass Index (BMI)</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">{bmi}</p>
                </div>
                <Heart className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          )}

          {/* Blood Pressure */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Blood Pressure (mmHg)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Systolic (120)"
                />
                <p className="text-xs text-gray-500 mt-1">Upper number</p>
              </div>
              <div>
                <input
                  type="number"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Diastolic (80)"
                />
                <p className="text-xs text-gray-500 mt-1">Lower number</p>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Medical History
            </label>
            <textarea
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="Any medical conditions, allergies, or past illnesses..."
            />
            {!record && latestRecord?.medicalHistory && (
              <p className="text-xs text-blue-600 mt-1">✓ Auto-filled from last record</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
              placeholder="Additional notes or observations..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isProcessing ? 'Saving...' : record ? 'Update Record' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}