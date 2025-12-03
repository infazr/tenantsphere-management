import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  BaseResponse,
  SignInRequest,
  SignInResult,
  Tenant,
  CreateTenantRequest,
  UpdateTenantRequest,
  GetTenantsParams,
  PaginatedResponse,
  Module,
  ChangePasswordRequest,
} from '@/types/api';

const API_BASE_URL = 'https://swtt4qvvptprbix33gretpwtn40leddi.lambda-url.us-east-1.on.aws';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<BaseResponse>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signIn(data: SignInRequest): Promise<BaseResponse<SignInResult>> {
    const response = await this.client.post<BaseResponse<SignInResult>>('/api/v1/Auth/signin', data);
    return response.data;
  }

  async signOut(): Promise<BaseResponse<boolean>> {
    const response = await this.client.post<BaseResponse<boolean>>('/api/v1/Auth/signout');
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<boolean> {
    const response = await this.client.post<boolean>('/api/v1/Auth/change-password', data);
    return response.data;
  }

  // Tenant endpoints
  async getTenants(params?: GetTenantsParams): Promise<BaseResponse<PaginatedResponse<Tenant>>> {
    const response = await this.client.get<BaseResponse<PaginatedResponse<Tenant>>>('/api/v1/Tenants', {
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        sortBy: params?.sortBy,
        sortingOrder: params?.sortingOrder,
        search: params?.search,
        isActive: params?.isActive,
      },
    });
    return response.data;
  }

  async getTenantById(tenantId: number): Promise<BaseResponse<Tenant>> {
    const response = await this.client.get<BaseResponse<Tenant>>(`/api/v1/Tenants/${tenantId}`);
    return response.data;
  }

  async createTenant(data: CreateTenantRequest): Promise<BaseResponse<Tenant>> {
    const formData = new FormData();
    formData.append('Name', data.Name);
    formData.append('Email', data.Email);
    if (data.DisplayPictureFile) {
      formData.append('DisplayPictureFile', data.DisplayPictureFile);
    }
    if (data.Remarks) {
      formData.append('Remarks', data.Remarks);
    }
    data.Modules.forEach((module) => {
      formData.append('Modules', module);
    });
    formData.append('IsActivated', String(data.IsActivated));

    const response = await this.client.post<BaseResponse<Tenant>>('/api/v1/Tenants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateTenant(data: UpdateTenantRequest): Promise<BaseResponse<Tenant>> {
    const formData = new FormData();
    formData.append('Id', String(data.Id));
    if (data.Name) {
      formData.append('Name', data.Name);
    }
    if (data.DisplayPictureFile) {
      formData.append('DisplayPictureFile', data.DisplayPictureFile);
    }
    if (data.Remarks) {
      formData.append('Remarks', data.Remarks);
    }
    data.Modules.forEach((module) => {
      formData.append('Modules', module);
    });
    formData.append('IsActivated', String(data.IsActivated));

    const response = await this.client.put<BaseResponse<Tenant>>('/api/v1/Tenants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteTenant(tenantId: number): Promise<BaseResponse<boolean>> {
    const response = await this.client.delete<BaseResponse<boolean>>(`/api/v1/Tenants/${tenantId}`);
    return response.data;
  }

  async deactivateTenant(tenantId: number): Promise<BaseResponse<boolean>> {
    const response = await this.client.put<BaseResponse<boolean>>(`/api/v1/Tenants/deactivate/${tenantId}`);
    return response.data;
  }

  async getTenantDisplayPicture(tenantId: number): Promise<string> {
    const response = await this.client.get(`/api/v1/Tenants/display-picture/${tenantId}`, {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  }

  // Module endpoints
  async getModules(): Promise<BaseResponse<Module[]>> {
    const response = await this.client.get<BaseResponse<Module[]>>('/api/v1/Module');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
