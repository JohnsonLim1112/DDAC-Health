// src/lib/api.ts

// ==================== 配置 ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ==================== 类型定义 ====================

// 用户类型
export type UserType = 'patient' | 'doctor' | 'admin';

// 登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    userType: UserType;
    phone?: string;
  };
}

// 注册请求
export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  userType: UserType;
}

// 注册响应
export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    userType: UserType;
  };
}

// 错误响应
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ==================== 工具函数 ====================

/**
 * 处理 API 响应
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    
    const error: ApiError = {
      message: errorData.message || `HTTP Error ${response.status}`,
      status: response.status,
      errors: errorData.errors,
    };
    
    throw error;
  }
  
  return response.json();
}

/**
 * 获取认证 token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * 设置认证 token
 */
function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

/**
 * 清除认证 token
 */
function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

/**
 * 创建请求头
 */
function createHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// ==================== 认证 API ====================

export const authAPI = {
  /**
   * 用户登录
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
      });
      
      const result = await handleResponse<LoginResponse>(response);
      
      // 保存 token
      if (result.token) {
        setAuthToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * 用户注册
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
      });
      
      return handleResponse<RegisterResponse>(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: createHeaders(true),
      });
      
      await handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 无论成功与否，都清除本地 token
      clearAuthToken();
    }
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<LoginResponse['user']> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: createHeaders(true),
      });
      
      return handleResponse<LoginResponse['user']>(response);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * 刷新 token
   */
  refreshToken: async (): Promise<{ token: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: createHeaders(true),
      });
      
      const result = await handleResponse<{ token: string }>(response);
      
      if (result.token) {
        setAuthToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      clearAuthToken();
      throw error;
    }
  },

  /**
   * 忘记密码
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ email }),
      });
      
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * 重置密码
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ token, newPassword }),
      });
      
      return handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};

// ==================== 健康数据 API ====================

export interface HealthRecord {
  id: string;
  userId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  recordDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreateHealthRecordRequest {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
  recordDate?: string;
}

export const healthAPI = {
  /**
   * 获取用户健康记录列表
   */
  getHealthRecords: async (userId: string, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<HealthRecord[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_BASE_URL}/health/${userId}/records?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(true),
      });
      
      return handleResponse<HealthRecord[]>(response);
    } catch (error) {
      console.error('Get health records error:', error);
      throw error;
    }
  },

  /**
   * 创建健康记录
   */
  createHealthRecord: async (data: CreateHealthRecordRequest): Promise<HealthRecord> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/records`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(data),
      });
      
      return handleResponse<HealthRecord>(response);
    } catch (error) {
      console.error('Create health record error:', error);
      throw error;
    }
  },

  /**
   * 更新健康记录
   */
  updateHealthRecord: async (recordId: string, data: Partial<CreateHealthRecordRequest>): Promise<HealthRecord> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/records/${recordId}`, {
        method: 'PUT',
        headers: createHeaders(true),
        body: JSON.stringify(data),
      });
      
      return handleResponse<HealthRecord>(response);
    } catch (error) {
      console.error('Update health record error:', error);
      throw error;
    }
  },

  /**
   * 删除健康记录
   */
  deleteHealthRecord: async (recordId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/records/${recordId}`, {
        method: 'DELETE',
        headers: createHeaders(true),
      });
      
      await handleResponse(response);
    } catch (error) {
      console.error('Delete health record error:', error);
      throw error;
    }
  },
};

// ==================== 预约 API ====================

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'online' | 'physical';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  doctor?: {
    id: string;
    fullName: string;
    specialty?: string;
  };
  patient?: {
    id: string;
    fullName: string;
  };
}

export interface CreateAppointmentRequest {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: 'online' | 'physical';
  notes?: string;
}

export const appointmentAPI = {
  /**
   * 获取用户预约列表
   */
  getAppointments: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const url = `${API_BASE_URL}/appointments?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(true),
      });
      
      return handleResponse<Appointment[]>(response);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },

  /**
   * 创建预约
   */
  createAppointment: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: createHeaders(true),
        body: JSON.stringify(data),
      });
      
      return handleResponse<Appointment>(response);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  /**
   * 取消预约
   */
  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: createHeaders(true),
      });
      
      return handleResponse<Appointment>(response);
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  },
};

// ==================== 医生 API ====================

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty?: string;
  qualifications?: string;
  experience?: number;
  availableDays?: string[];
  availableTimeSlots?: string[];
  consultationFee?: number;
  rating?: number;
}

export const doctorAPI = {
  /**
   * 获取医生列表
   */
  getDoctors: async (params?: {
    specialty?: string;
    search?: string;
  }): Promise<Doctor[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.specialty) queryParams.append('specialty', params.specialty);
      if (params?.search) queryParams.append('search', params.search);
      
      const url = `${API_BASE_URL}/doctors?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createHeaders(true),
      });
      
      return handleResponse<Doctor[]>(response);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  /**
   * 获取医生详情
   */
  getDoctorById: async (doctorId: string): Promise<Doctor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'GET',
        headers: createHeaders(true),
      });
      
      return handleResponse<Doctor>(response);
    } catch (error) {
      console.error('Get doctor error:', error);
      throw error;
    }
  },

  /**
   * 获取医生可用时间段
   */
  getDoctorAvailability: async (doctorId: string, date: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/availability?date=${date}`, {
        method: 'GET',
        headers: createHeaders(true),
      });
      
      return handleResponse<string[]>(response);
    } catch (error) {
      console.error('Get doctor availability error:', error);
      throw error;
    }
  },
};

// ==================== 导出工具函数 ====================

export const authUtils = {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },
};