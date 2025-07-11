export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}



export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export interface SortParams {
  field: string;
  direction: SortDirection;
}

export interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  timestamp?: number;
}

export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  message: string | null;
  status: number | null;
  code?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}