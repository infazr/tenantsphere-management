export interface BaseResponse<T = unknown> {
  traceId: string;
  result: T;
  message: string;
  timeStamp: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResult {
  token: string;
  refreshToken?: string;
}

export interface DecodedToken {
  sub: string;
  email: string;
  name?: string;
  PrivilegeType?: string;
  tenant?: string | null;
  TenantKey?: string | null;
  exp: number;
  iat: number;
}

export type Module = 'employee' | 'project' | 'leave' | 'timesheet';

export interface Tenant {
  id: number;
  name: string;
  email: string;
  displayPicture?: string;
  remarks?: string;
  modules: Module[];
  isActivated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTenantRequest {
  Name: string;
  Email: string;
  DisplayPictureFile?: File;
  Remarks?: string;
  Modules: Module[];
  IsActivated: boolean;
}

export interface UpdateTenantRequest {
  Id: number;
  Name?: string;
  DisplayPictureFile?: File;
  Remarks?: string;
  Modules: Module[];
  IsActivated: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetTenantsParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortingOrder?: 'asc' | 'desc';
  search?: string;
  isActive?: boolean;
}

export type UserRole = 'SuperAdmin' | 'TenantAdmin' | 'Employee';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  tenantId?: string | null;
  tenantKey?: string | null;
}

export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
  email: string;
  token: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  email: string;
}
