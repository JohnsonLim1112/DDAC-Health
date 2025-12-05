// src/lib/api.ts

// ==================== 配置 ====================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5089';

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

export interface LoginData {
  LoginId: string;
  LoginRole: string;
}

export interface ApiError {
  message: string;
  status: number;
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
        setUserData(result.data);
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

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

  logout: (): void => {
    clearUserData();
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
};