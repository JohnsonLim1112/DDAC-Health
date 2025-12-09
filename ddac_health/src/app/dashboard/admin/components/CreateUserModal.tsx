import React, { useState } from 'react';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
import { authUtils, userInfoAPI, usersAPI } from '../../../../lib/api';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateUserData {
  Username: string;
  Password: string;
  role: string;
}

interface DoctorInfo {
  Name: string;
  Gender: string;
  Age: number;
  Address: string;
  Specialization: string;
  ExperienceYears: number;
  Bio: string;
}

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserData>({
    Username: '',
    Password: '',
    role: 'customer'
  });

  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo>({
    Name: '',
    Gender: 'Male',
    Age: 30,
    Address: '',
    Specialization: '',
    ExperienceYears: 0,
    Bio: ''
  });

  const resetForms = () => {
    setNewUser({ Username: '', Password: '', role: 'customer' });
    setDoctorInfo({
      Name: '',
      Gender: 'Male',
      Age: 30,
      Address: '',
      Specialization: '',
      ExperienceYears: 0,
      Bio: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  
    if (newUser.role === 'doctor') {
      if (!doctorInfo.Name || !doctorInfo.Specialization || !doctorInfo.Address) {
        alert('Please fill in all required doctor information!');
        return;
      }
    }
    
    try {
      const adminId = authUtils.getUserId();
      
  
      const createUserResult = await usersAPI.create({
        AdminId: adminId!,
        Username: newUser.Username,
        Password: newUser.Password,
        role: newUser.role
      });
      
      if (!createUserResult.success) {
        alert(createUserResult.message || 'Failed to create user');
        return;
      }

 
      if (newUser.role === 'doctor' && createUserResult.data?.userId) {
        const doctorData = {
          userId: createUserResult.data.userId,
          name: doctorInfo.Name,
          gender: doctorInfo.Gender,
          age: doctorInfo.Age,
          address: doctorInfo.Address,
          specialization: doctorInfo.Specialization,
          experienceYears: doctorInfo.ExperienceYears,
          bio: doctorInfo.Bio
        };

        const createInfoResult = await userInfoAPI.create(doctorData);
        
        if (!createInfoResult.success) {
          alert('User created but failed to save doctor info: ' + createInfoResult.message);
        }
      }

      alert('User created successfully!');
      resetForms();
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Create New User</h2>
          <p className="text-gray-600 mt-1">Add a new user to the system</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={newUser.Username}
              onChange={(e) => setNewUser({ ...newUser, Username: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newUser.Password}
                onChange={(e) => setNewUser({ ...newUser, Password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="customer">Customer</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Doctor Info - Only show when role is doctor */}
          {newUser.role === 'doctor' && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Doctor Information (Required)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={doctorInfo.Name}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, Name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={doctorInfo.Gender}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, Gender: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={doctorInfo.Age}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, Age: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="25"
                    max="80"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years) *</label>
                  <input
                    type="number"
                    value={doctorInfo.ExperienceYears}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, ExperienceYears: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0"
                    max="50"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                  <input
                    type="text"
                    value={doctorInfo.Specialization}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, Specialization: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g., Cardiology, Pediatrics, General Practice"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={doctorInfo.Address}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, Address: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Clinic/Hospital address"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
                  <textarea
                    value={doctorInfo.Bio}
                    onChange={(e) => setDoctorInfo({ ...doctorInfo, Bio: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    placeholder="Brief description about the doctor..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForms();
                onClose();
              }}
              className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}