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

// 登录成功后的数据（前端使用大写）
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
          LoginRole: result.data.loginRole      
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
};