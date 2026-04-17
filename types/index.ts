export type EmploymentType = "full_time" | "part_time" | "contract";

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: string;
  currency: string;
  employment_type: EmploymentType;
  hired_on: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface EmployeeListResponse {
  employees: Employee[];
  meta: PaginationMeta;
}

export interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  job_title_id: number;
  department_id: number;
  country: string;
  salary: string;
  currency: string;
  employment_type: EmploymentType;
  hired_on: string;
}

export interface SalaryUpdateData {
  salary: string;
  currency: string;
}

export interface JobTitle {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface SalaryBreakdown {
  job_title: string;
  avg_salary: string;
}

export interface SalaryInsights {
  filters: Record<string, string>;
  insights: {
    employee_count: number;
    min_salary: string;
    max_salary: string;
    avg_salary: string;
    breakdowns: SalaryBreakdown[];
  };
}

export interface SalaryHistoryEntry {
  effective_from: string;
  salary: string;
  currency: string;
  change: string | null;
}

export interface SalaryHistoryResponse {
  salary_history: SalaryHistoryEntry[];
}

export interface ApiValidationError {
  errors: Record<string, string[]>;
}
