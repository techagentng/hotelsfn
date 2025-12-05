import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';

// Types
export interface ServiceRequest {
  id: number;
  request_number: string;
  room_id: number;
  guest_id: number;
  type: string; // 'housekeeping' | 'maintenance' | 'room_service'
  service_type: string; // 'room-service' | 'housekeeping' | 'maintenance' | 'cleaning' | 'towels' | etc.
  issue_type?: string; // For maintenance: 'electrical' | 'plumbing' | 'air_conditioning' | etc.
  status: 'pending' | 'in_progress' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'medium' | 'high';
  description: string;
  notes?: string;
  preferred_time?: string | null;
  estimated_time?: string | null;
  assigned_to?: string;
  assigned_staff_id?: number | null;
  assigned_at?: string | null;
  completed_at?: string | null;
  completed_by?: string;
  cancellation_reason?: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
  // Nested objects from API
  room?: {
    id: number;
    room_number: string;
    room_type: string;
    floor: number;
    capacity: number;
    price_per_night: number;
    status: string;
    description: string;
    amenities: string;
    bed_type: string;
  };
  guest?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    nationality: string;
    id_type: string;
    id_number: string;
  };
  // Computed/flattened fields for UI compatibility
  room_number?: string;
  guest_name?: string;
  guest_phone?: string;
}

export interface RoomServiceOrder {
  id: number;
  order_id: string;
  reservation_id: number;
  guest_id: number;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  special_notes?: string;
  ordered_at: string;
  delivered_at?: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface HousekeepingRequest {
  id: number;
  reservation_id: number;
  guest_id: number;
  request_type: 'cleaning' | 'linens' | 'schedule';
  description: string;
  schedule_time: 'morning' | 'afternoon' | 'immediate';
  status: 'pending' | 'in-progress' | 'completed';
  assigned_to?: string;
  requested_at: string;
  completed_at?: string;
}

export interface MaintenanceIssue {
  id: number;
  reservation_id: number;
  guest_id: number;
  issue_type: 'ac' | 'tv' | 'wifi' | 'plumbing' | 'lights' | 'door-lock' | 'noise' | 'other';
  description: string;
  status: 'reported' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  reported_at: string;
  resolved_at?: string;
}

export interface CreateServiceRequestData {
  reservation_id: number;
  guest_id: number;
  service_type: ServiceRequest['service_type'];
  priority: ServiceRequest['priority'];
  description: string;
}

export interface UpdateServiceRequestData {
  status?: ServiceRequest['status'];
  assigned_to?: string;
  notes?: string;
}

export interface CreateRoomServiceOrderData {
  reservation_id: number;
  guest_id: number;
  items: {
    menu_item_id: number;
    quantity: number;
  }[];
  special_notes?: string;
}

export interface CreateHousekeepingRequestData {
  reservation_id: number;
  guest_id: number;
  request_type: HousekeepingRequest['request_type'];
  description: string;
  schedule_time: HousekeepingRequest['schedule_time'];
}

export interface CreateMaintenanceIssueData {
  reservation_id: number;
  guest_id: number;
  issue_type: MaintenanceIssue['issue_type'];
  description: string;
}

export interface UpdateMaintenanceIssueData {
  status?: MaintenanceIssue['status'];
  assigned_to?: string;
  notes?: string;
}

// Query Keys
export const roomServiceKeys = {
  all: ['room-service'] as const,
  serviceRequests: () => [...roomServiceKeys.all, 'service-requests'] as const,
  serviceRequest: (id: number) => [...roomServiceKeys.serviceRequests(), id] as const,
  serviceRequestsByStatus: (status: string) => [...roomServiceKeys.serviceRequests(), 'status', status] as const,
  orders: () => [...roomServiceKeys.all, 'orders'] as const,
  order: (id: number) => [...roomServiceKeys.orders(), id] as const,
  housekeeping: () => [...roomServiceKeys.all, 'housekeeping'] as const,
  maintenance: () => [...roomServiceKeys.all, 'maintenance'] as const,
};

// Service Requests Queries

// Helper to normalize service type from API format to frontend format
const normalizeServiceType = (type: string, serviceType: string): string => {
  // If service_type is set and meaningful, use it
  if (serviceType && serviceType !== '') {
    // Convert room-service format
    if (serviceType === 'room-service') return 'room-service';
    // For housekeeping subtypes (cleaning, towels, bedding, etc.), return 'housekeeping'
    if (['cleaning', 'towels', 'bedding', 'amenities', 'turndown'].includes(serviceType)) {
      return 'housekeeping';
    }
    return serviceType;
  }
  // Fall back to type field
  if (type === 'room_service') return 'room-service';
  if (type === 'housekeeping') return 'housekeeping';
  if (type === 'maintenance') return 'maintenance';
  return type || '';
};

// Helper to transform API response and flatten nested objects
const transformServiceRequest = (request: any): ServiceRequest => ({
  ...request,
  // Flatten nested room data
  room_number: request.room?.room_number || '',
  // Flatten nested guest data
  guest_name: request.guest?.name || '',
  guest_phone: request.guest?.phone || '',
  // Normalize status (backend uses in_progress, frontend uses in-progress)
  status: request.status === 'in_progress' ? 'in-progress' : request.status,
  // Normalize service_type for frontend compatibility
  service_type: normalizeServiceType(request.type, request.service_type),
});

export const useGetServiceRequests = (params?: {
  page?: number;
  page_size?: number;
  status?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: [...roomServiceKeys.serviceRequests(), params],
    queryFn: async () => {
      const response = await axios.get('/service-requests', { params });
      // Backend returns { data: { data: [...], pagination: {...} } }
      const rawData = response.data.data?.data || response.data.data || [];
      return rawData.map(transformServiceRequest) as ServiceRequest[];
    },
  });
};

export const useGetServiceRequest = (id: number) => {
  return useQuery({
    queryKey: roomServiceKeys.serviceRequest(id),
    queryFn: async () => {
      const response = await axios.get(`/service-requests/${id}`);
      return transformServiceRequest(response.data.data) as ServiceRequest;
    },
    enabled: !!id,
  });
};

export const useGetServiceRequestsByStatus = (status: string) => {
  return useQuery({
    queryKey: roomServiceKeys.serviceRequestsByStatus(status),
    queryFn: async () => {
      const response = await axios.get(`/service-requests`, { params: { status } });
      const rawData = response.data.data?.data || response.data.data || [];
      return rawData.map(transformServiceRequest) as ServiceRequest[];
    },
    enabled: !!status,
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: CreateServiceRequestData) => {
      const response = await axios.post('/service-requests', requestData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.serviceRequests() });
    },
  });
};

export const useUpdateServiceRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateServiceRequestData) => {
      const response = await axios.put(`/service-requests/${id}`, updateData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.serviceRequests() });
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.serviceRequest(id) });
    },
  });
};

// Room Service Orders Queries

export const useGetRoomServiceOrders = (params?: {
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [...roomServiceKeys.orders(), params],
    queryFn: async () => {
      const response = await axios.get('/room-service/orders', { params });
      return response.data.data?.data || response.data.data as RoomServiceOrder[];
    },
  });
};

export const useCreateRoomServiceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: CreateRoomServiceOrderData) => {
      const response = await axios.post('/room-service/orders', orderData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.orders() });
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.serviceRequests() });
    },
  });
};

export const useUpdateRoomServiceOrderStatus = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      const response = await axios.put(`/room-service/orders/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.orders() });
    },
  });
};

// Housekeeping Requests Queries

export const useGetHousekeepingRequests = (params?: {
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [...roomServiceKeys.housekeeping(), params],
    queryFn: async () => {
      const response = await axios.get('/service-requests', { params: { ...params, type: 'housekeeping' } });
      return response.data.data?.data || response.data.data as HousekeepingRequest[];
    },
  });
};

export const useCreateHousekeepingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: CreateHousekeepingRequestData) => {
      const response = await axios.post('/services/housekeeping', requestData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.housekeeping() });
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.serviceRequests() });
    },
  });
};

// Maintenance Issues Queries

export const useGetMaintenanceIssues = (params?: {
  page?: number;
  page_size?: number;
}) => {
  return useQuery({
    queryKey: [...roomServiceKeys.maintenance(), params],
    queryFn: async () => {
      const response = await axios.get('/service-requests', { params: { ...params, type: 'maintenance' } });
      return response.data.data?.data || response.data.data as MaintenanceIssue[];
    },
  });
};

export const useCreateMaintenanceIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueData: CreateMaintenanceIssueData) => {
      const response = await axios.post('/services/maintenance', issueData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.maintenance() });
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.serviceRequests() });
    },
  });
};

export const useUpdateMaintenanceIssue = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateMaintenanceIssueData) => {
      const response = await axios.put(`/service-requests/${id}`, updateData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomServiceKeys.maintenance() });
    },
  });
};
