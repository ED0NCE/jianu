import Taro from '@tarojs/taro';
import { BASE_URL, TIMEOUT, DEBUG } from './config';

// 请求方法类型
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

// 请求配置类型
interface RequestConfig {
  header?: Record<string, string>;
  timeout?: number;
  loading?: boolean;
  data?: any;
}

// 默认配置
const DEFAULT_CONFIG: RequestConfig = {
  header: {
    'Content-Type': 'application/json'
  },
  timeout: TIMEOUT,
  loading: true
};

// 调试日志
const debugLog = (type: string, data: any) => {
  if (DEBUG) {
    console.log(`[API ${type}]`, data);
  }
};

// 请求工具
export const http = {
  async request<T>(url: string, method: Method, data?: any, config?: RequestConfig): Promise<T> {
    const finalConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      header: {
        ...DEFAULT_CONFIG.header,
        ...config?.header
      }
    };

    try {
      const response = await Taro.request({
        url: `${BASE_URL}${url}`,
        method,
        data,
        header: finalConfig.header,
        timeout: finalConfig.timeout
      });

      // 调试模式打印响应
      if (DEBUG) {
        debugLog('Response', {
          url,
          method,
          status: response.statusCode,
          data: response.data
        });
      }

      // 处理响应
      if (response.statusCode === 200) {
        return response.data;
      } else if (response.statusCode === 401) {
        // 未登录
        Taro.showToast({
          title: '请先登录',
          icon: 'none'
        });
        throw new Error('未登录');
      } else {
        throw new Error('请求失败');
      }
    } catch (error) {
      if (DEBUG) {
        debugLog('Error', {
          url,
          method,
          error: error.message
        });
      }
      console.error('Request failed:', error);
      throw error;
    }
  },

  get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, 'GET', undefined, config);
  },

  post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, 'POST', data, config);
  },

  put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, 'PUT', data, config);
  },

  delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, 'DELETE', undefined, config);
  }
}; 