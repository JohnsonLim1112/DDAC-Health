// src/lib/api.ts


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5255';



export interface LoginRequest {
  Username: string;
  Password: string;
}

export interface RegisterRequest {
  Username: string;
  Password: string;
  Password2: string;
  SecurityPassword: string;
}

export interface HttpVO<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}


export interface LoginData {
  LoginId: string;
  LoginRole: string;
  LoginUsername: string;  
}

export interface ApiError {
  message: string;
  status: number;
}

// Appointments (Book) 
export interface Appointment {
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

export interface CreateAppointmentRequest {
  UserId: string;
  DoctorId: string;
  IllnessTxt: string;
  StartTime: string;   
  EndTime: string;    
}

// User Management 
export interface User {
  id: string;
  username: string;
  password: string;
  securityPassword: string;
  role: 'customer' | 'doctor' | 'admin';
}

export interface CreateUserRequest {
  AdminId: string;
  Username: string;
  Password: string;
  role: string;
}

interface MonthlyReportResponse {
  success: boolean;
  message: string;
  data: { [key: string]: number };
}

interface AppointmentDetailsResponse {
  success: boolean;
  message: string;
  data: any[];
}



async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    
    const error: ApiError = {
      message: errorData.message || `HTTP Error ${response.status}`,
      status: response.status,
    };
    
    throw error;
  }
  
  return response.json();
}

function getUserData(): LoginData | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
}

function setUserData(data: LoginData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userData', JSON.stringify(data));
}

function clearUserData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userData');
}

function createHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}



export const authAPI = {
  /**
   * 用户登录
   */
  login: async (email: string, password: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/login`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          Username: email,
          Password: password,
        }),
      });
      
      const result = await handleResponse<HttpVO>(response);
      
    
      if (result.success && result.data) {
       
        const transformedData: LoginData = {
          LoginId: result.data.loginId,    
          LoginRole: result.data.loginRole,
          LoginUsername: email  // 
        };
        setUserData(transformedData);
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
  register: async (
    username: string,
    password: string,
    confirmPassword: string,
    securityPassword: string
  ): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/register`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          Username: username,
          Password: password,
          Password2: confirmPassword,
          SecurityPassword: securityPassword,
        }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * 用户登出
   */
  logout: (): void => {
    clearUserData();
  },

  /**
   * 验证邮箱
   */
  validateEmail: async (email: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/email`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          Username: email,
        }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Email validation error:', error);
      throw error;
    }
  },

  /**
   * 验证安全密码
   */
  validateSecurityPassword: async (id: string, securityPassword: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/security`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          id: id,
          SecurityPassword: securityPassword,
        }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Security password validation error:', error);
      throw error;
    }
  },

  /**
   * 修改密码
   */
  changePassword: async (id: string, newPassword: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/change`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          id: id,
          password: newPassword,
        }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * 删除用户
   */
  deleteUser: async (id: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/delete`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          id: id,
        }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  /**
   * ✅ 根据用户ID获取用户名（email）
   */
  checkUsername: async (userId: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/username?id=${userId}`, {
        method: 'POST',
        headers: createHeaders(),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Check username error:', error);
      throw error;
    }
  },
};

// ==================== Appointments API ====================

export const appointmentsAPI = {
  /**
   * 获取所有预约
   */
  getAll: async (): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/GetAll`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },

  /**
   * 根据用户ID获取预约
   */
  getByUserId: async (userId: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/UserGet?UserId=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      const result = await handleResponse<HttpVO>(response);
      console.log('User appointments result:', result);
      return result;
    } catch (error) {
      console.error('Get user appointments error:', error);
      console.error('UserId:', userId);
      console.error('Full URL:', `${API_BASE_URL}/book/UserGet?UserId=${userId}`);
      throw error;
    }
  },

  /**
   * 根据医生ID获取预约
   */
  getByDoctorId: async (doctorId: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/DoctorGet?DoctorId=${doctorId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      throw error;
    }
  },

  /**
   * 创建预约
   */
  create: async (appointmentData: CreateAppointmentRequest): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/create`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(appointmentData),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },

  /**
   * 更新预约
   */
  update: async (appointment: Appointment): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/update`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(appointment),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  },

  /**
   * 删除预约
   */
  delete: async (id: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/delete`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ id }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }
  },
};

// ==================== User Management API ====================

export const usersAPI = {
  
  getAll: async (adminId: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/get?adminId=${adminId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

 
  create: async (userData: CreateUserRequest): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(userData),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  
 update: async (
    adminId: string,
    users: User[],
    options?: { changePassword?: boolean }
  ): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          id: adminId,
          updatePassword: options?.changePassword ?? false,    
          updateSecurityPassword: false,                        
          Data: users
        }),
      });

      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  
  delete: async (id: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/delete`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ id }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },
};

// ==================== User Info API ====================

export interface UserInfo {
  userId: string;
  name: string;
  gender: string;
  age: number;
  address: string;
  specialization?: string;
  experienceYears?: number;
  bio?: string;
}

export const userInfoAPI = {
  
  get: async (userId: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserInfo/get?UserId=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  },

 
  getDoctors: async (): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserInfo/GetDoctors`, {
        method: 'GET',
        headers: createHeaders(),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Get doctors error:', error);
      throw error;
    }
  },

  
  create: async (userInfo: Partial<UserInfo>): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserInfo/create`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(userInfo),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Create user info error:', error);
      throw error;
    }
  },

 
  update: async (userInfo: UserInfo): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserInfo/update`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(userInfo),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Update user info error:', error);
      throw error;
    }
  },

  /**
   * 删除用户信息
   */
  delete: async (id: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserInfo/delete`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ id }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Delete user info error:', error);
      throw error;
    }
  },
};



export const authUtils = {
  getUserData,
  setUserData,
  clearUserData,
  isAuthenticated: (): boolean => {
    return !!getUserData();
  },
  getUserId: (): string | null => {
    const userData = getUserData();
    return userData?.LoginId || null;
  },
  getUserRole: (): string | null => {
    const userData = getUserData();
    return userData?.LoginRole || null;
  },
  getRole: (): string | null => {  
    const userData = getUserData();
    return userData?.LoginRole || null;
  },
  getUserEmail: (): string | null => {  
    const userData = getUserData();
    return userData?.LoginUsername || null;
  },
  logout: (): void => { 
    clearUserData();
  },
};


// Health Records API
export interface HealthRecord {
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

export interface CreateHealthRecordRequest {
  UserId: string;
  Height: number | null;
  Weight: number | null;
  BloodPressureSystolic: number | null;
  BloodPressureDiastolic: number | null;
  MedicalHistory: string | null;
  RecordDate: string;
  Notes: string | null;
}

export const healthAPI = {
  create: async (data: CreateHealthRecordRequest): Promise<HttpVO<HealthRecord>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/create`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse<HttpVO<HealthRecord>>(response);
    } catch (error) {
      console.error('Create health record error:', error);
      throw error;
    }
  },

  getByUserId: async (userId: string): Promise<HttpVO<HealthRecord[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/user?userId=${userId}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      return handleResponse<HttpVO<HealthRecord[]>>(response);
    } catch (error) {
      console.error('Get health records error:', error);
      throw error;
    }
  },

  getByDateRange: async (userId: string, startDate: string, endDate: string): Promise<HttpVO<HealthRecord[]>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health/filter?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET', headers: createHeaders() }
      );
      return handleResponse<HttpVO<HealthRecord[]>>(response);
    } catch (error) {
      console.error('Get filtered health records error:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<HttpVO<HealthRecord>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/get?id=${id}`, {
        method: 'GET',
        headers: createHeaders(),
      });
      return handleResponse<HttpVO<HealthRecord>>(response);
    } catch (error) {
      console.error('Get health record error:', error);
      throw error;
    }
  },

  update: async (record: HealthRecord): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/update`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(record),
      });
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Update health record error:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/delete`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({ id }),
      });
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Delete health record error:', error);
      throw error;
    }
  },
};


export const appointmentsReportAPI = {
  /**
   * 获取医生的月度报告
   * @param doctorId 医生ID
   * @param year 年份
   */
  getDoctorMonthlyReport: async (doctorId: string, year: number): Promise<MonthlyReportResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/book/DoctorMonthlyReport?doctorId=${doctorId}&year=${year}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctor monthly report:', error);
      throw error;
    }
  },

  /**
   * 获取医生指定月份的详细预约数据
   * @param doctorId 医生ID
   * @param year 年份
   * @param month 月份 (1-12)
   */
  getDoctorMonthlyDetails: async (
    doctorId: string, 
    year: number, 
    month: number
  ): Promise<AppointmentDetailsResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/book/DoctorMonthlyDetails?doctorId=${doctorId}&year=${year}&month=${month}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching doctor monthly details:', error);
      throw error;
    }
  },

  /**
   * 获取管理员的月度报告（全部医生）
   * @param year 年份
   */
  getMonthlyReport: async (year: number): Promise<MonthlyReportResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/book/MonthlyReport?year=${year}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  },

  /**
   * 获取用户的月度报告
   * @param userId 用户ID
   * @param year 年份
   */
  getUserMonthlyReport: async (userId: string, year: number): Promise<MonthlyReportResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/book/UserMonthlyReport?userId=${userId}&year=${year}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching user monthly report:', error);
      throw error;
    }
  }
};