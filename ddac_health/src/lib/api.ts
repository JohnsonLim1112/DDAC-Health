// src/lib/api.ts

// ==================== 配置 ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5255';

// ==================== 类型定义 ====================

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

export interface HttpVO {
  success: boolean;
  message?: string;
  data?: any;
}

// 登录成功后的数据
export interface LoginData {
  LoginId: string;
  LoginRole: string;
  LoginUsername: string;  // ✅ 添加 username
}

export interface ApiError {
  message: string;
  status: number;
}

// Appointments (Book) 相关
export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  isAccept: boolean;
  illnessTxt: string;
  medicine: string;
  price: number;
  status: string;
  createTime: string;
  updateTime: string;
}

export interface CreateAppointmentRequest {
  UserId: string;
  DoctorId: string;
  IllnessTxt: string;
}

// User Management 相关
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

// ==================== 工具函数 ====================

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

// ==================== 认证 API ====================

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
      
      // 保存用户数据
      if (result.success && result.data) {
        // 转换后端返回的小写字段为大写
        const transformedData: LoginData = {
          LoginId: result.data.loginId,    
          LoginRole: result.data.loginRole,
          LoginUsername: email  // ✅ 保存 email
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
        body: JSON.stringify({
          ...appointment,
          updateTime: new Date().toISOString()
        }),
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
  /**
   * 获取所有用户（需要 admin 权限）
   */
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

  /**
   * 创建用户（需要 admin 权限）
   */
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

  /**
   * 更新用户（需要 admin 权限）
   */
  update: async (adminId: string, users: User[]): Promise<HttpVO> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update`, {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          id: adminId,
          Data: users
        }),
      });
      
      return handleResponse<HttpVO>(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  /**
   * 删除用户（需要 admin 权限）
   */
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
  /**
   * 获取用户信息
   */
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

  /**
   * 获取所有医生列表
   */
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

  /**
   * 创建用户信息
   */
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

  /**
   * 更新用户信息
   */
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

// ==================== 导出工具函数 ====================

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
  getRole: (): string | null => {  // ✅ 别名方法
    const userData = getUserData();
    return userData?.LoginRole || null;
  },
  getUserEmail: (): string | null => {  // ✅ 新增获取 email 方法
    const userData = getUserData();
    return userData?.LoginUsername || null;
  },
  logout: (): void => {  // ✅ 添加 logout 方法
    clearUserData();
  },
};