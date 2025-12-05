import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';

// Types based on backend model
export interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: 'housekeeping' | 'maintenance' | 'front_desk' | 'room_service' | 'management';
  position: string;
  status: 'active' | 'inactive' | 'on_leave';
  shift: 'morning' | 'afternoon' | 'night';
  hire_date: string;
  profile_image?: string;
  
  // Availability tracking
  is_on_duty?: boolean;
  is_available?: boolean;
  current_task_id?: number;
  last_assigned_at?: string;
  
  // Shift timing
  shift_start_time?: string;
  shift_end_time?: string;
  
  // Workload stats
  tasks_today?: number;
  tasks_completed?: number;
  
  // Clock times
  clock_in_time?: string;
  clock_out_time?: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface DepartmentStats {
  department: string;
  total: number;
  active: number;
  on_leave: number;
  morning_shift: number;
  afternoon_shift: number;
  night_shift: number;
}

export interface StaffStats {
  total_staff: number;
  by_department: {
    [key: string]: number;
  };
  by_status: {
    active: number;
    inactive: number;
    on_leave: number;
  };
  on_duty: number;
  available: number;
}

export interface CreateStaffData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  shift: string;
  hire_date: string;
  status?: string;
  shift_start_time?: string;
  shift_end_time?: string;
  profile_image?: string;
}

export interface UpdateStaffData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  status?: string;
  shift?: string;
  shift_start_time?: string;
  shift_end_time?: string;
}

export interface AssignStaffData {
  staff_id: number;
}

// Query Keys
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (params?: any) => [...staffKeys.lists(), params] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: number) => [...staffKeys.details(), id] as const,
  stats: () => [...staffKeys.all, 'stats'] as const,
  byDepartment: (department: string) => [...staffKeys.all, 'department', department] as const,
  onDuty: () => [...staffKeys.all, 'on-duty'] as const,
  available: () => [...staffKeys.all, 'available'] as const,
};

// Queries

export const useGetStaff = (params?: {
  page?: number;
  page_size?: number;
  department?: string;
  status?: string;
  shift?: string;
}) => {
  return useQuery({
    queryKey: staffKeys.list(params),
    queryFn: async () => {
      const response = await axios.get('/staff', { params });
      // Backend returns { data: { staff: [...], pagination: {...} } }
      return response.data.data?.staff || [] as Staff[];
    },
  });
};

export const useGetStaffById = (id: number) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: async () => {
      const response = await axios.get(`/staff/${id}`);
      return response.data.data as Staff;
    },
    enabled: !!id,
  });
};

export const useGetStaffStats = () => {
  return useQuery({
    queryKey: staffKeys.stats(),
    queryFn: async () => {
      const response = await axios.get('/staff/stats');
      const departmentStats = response.data.data as DepartmentStats[];
      
      // Transform array of department stats into aggregated stats
      const stats: StaffStats = {
        total_staff: departmentStats.reduce((sum, dept) => sum + dept.total, 0),
        by_department: departmentStats.reduce((acc, dept) => {
          acc[dept.department] = dept.total;
          return acc;
        }, {} as { [key: string]: number }),
        by_status: {
          active: departmentStats.reduce((sum, dept) => sum + dept.active, 0),
          inactive: 0, // Not provided by backend
          on_leave: departmentStats.reduce((sum, dept) => sum + dept.on_leave, 0),
        },
        on_duty: 0, // Will be fetched from on-duty endpoint
        available: 0, // Will be fetched from available endpoint
      };
      
      return stats;
    },
  });
};

export const useGetStaffByDepartment = (department: string) => {
  return useQuery({
    queryKey: staffKeys.byDepartment(department),
    queryFn: async () => {
      const response = await axios.get(`/staff/department/${department}`);
      return response.data.data as Staff[];
    },
    enabled: !!department,
  });
};

export const useGetOnDutyStaff = () => {
  return useQuery({
    queryKey: staffKeys.onDuty(),
    queryFn: async () => {
      const response = await axios.get('/staff/on-duty');
      return response.data.data as Staff[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useGetAvailableStaff = () => {
  return useQuery({
    queryKey: staffKeys.available(),
    queryFn: async () => {
      const response = await axios.get('/staff/available');
      return response.data.data as Staff[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Mutations

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffData: CreateStaffData) => {
      const response = await axios.post('/staff', staffData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

export const useUpdateStaff = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateStaffData) => {
      const response = await axios.put(`/staff/${id}`, updateData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/staff/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

export const useClockIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: number) => {
      const response = await axios.post(`/staff/${staffId}/clock-in`);
      return response.data.data;
    },
    onSuccess: (_, staffId) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(staffId) });
      queryClient.invalidateQueries({ queryKey: staffKeys.onDuty() });
      queryClient.invalidateQueries({ queryKey: staffKeys.available() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

export const useClockOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffId: number) => {
      const response = await axios.post(`/staff/${staffId}/clock-out`);
      return response.data.data;
    },
    onSuccess: (_, staffId) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(staffId) });
      queryClient.invalidateQueries({ queryKey: staffKeys.onDuty() });
      queryClient.invalidateQueries({ queryKey: staffKeys.available() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

export const useSetAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ staffId, available }: { staffId: number; available: boolean }) => {
      const response = await axios.put(`/staff/${staffId}/availability`, { available });
      return response.data.data;
    },
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(staffId) });
      queryClient.invalidateQueries({ queryKey: staffKeys.available() });
      queryClient.invalidateQueries({ queryKey: staffKeys.stats() });
    },
  });
};

export const useManualAssignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, staffId }: { requestId: number; staffId: number }) => {
      const response = await axios.post(`/service-requests/${requestId}/assign`, { staff_id: staffId });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate service requests queries to refetch and show updated assignment
      queryClient.invalidateQueries({ queryKey: ['room-service', 'service-requests'] });
      // Invalidate staff queries to update availability
      queryClient.invalidateQueries({ queryKey: staffKeys.available() });
      queryClient.invalidateQueries({ queryKey: staffKeys.onDuty() });
    },
  });
};

export const useAutoAssignStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: number) => {
      const response = await axios.post(`/service-requests/${requestId}/auto-assign`);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate service requests queries to refetch and show updated assignment
      queryClient.invalidateQueries({ queryKey: ['room-service', 'service-requests'] });
      // Invalidate staff queries to update availability
      queryClient.invalidateQueries({ queryKey: staffKeys.available() });
      queryClient.invalidateQueries({ queryKey: staffKeys.onDuty() });
    },
  });
};

