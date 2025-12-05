import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';

interface ServiceRequest {
  id: number;
  reservation_id: number;
  guest_id: number;
  service_type: string;
  status: string;
  priority: string;
  description: string;
  notes: string;
  assigned_to: string;
  requested_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface GetServiceRequestsParams {
  page?: number;
  page_size?: number;
  status?: string;
}

interface CreateServiceRequestData {
  reservation_id: number;
  guest_id: number;
  service_type: string;
  priority: string;
  description: string;
}

interface UpdateServiceRequestData {
  status?: string;
  assigned_to?: string;
  notes?: string;
}

// Query Keys
export const serviceRequestKeys = {
  all: ['service-requests'] as const,
  lists: () => [...serviceRequestKeys.all, 'list'] as const,
  list: (filters: GetServiceRequestsParams) => [...serviceRequestKeys.lists(), filters] as const,
  details: () => [...serviceRequestKeys.all, 'detail'] as const,
  detail: (id: number) => [...serviceRequestKeys.details(), id] as const,
  byReservation: (reservationId: number) => [...serviceRequestKeys.all, 'reservation', reservationId] as const,
  byGuest: (guestId: number) => [...serviceRequestKeys.all, 'guest', guestId] as const,
  byStatus: (status: string) => [...serviceRequestKeys.all, 'status', status] as const,
};

// Queries
export const useGetServiceRequests = (params: GetServiceRequestsParams = {}) => {
  return useQuery({
    queryKey: serviceRequestKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get(`/service-requests`, { params });
      return data;
    },
  });
};

export const useGetServiceRequestById = (id: number) => {
  return useQuery({
    queryKey: serviceRequestKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/service-requests/${id}`);
      return data.data as ServiceRequest;
    },
    enabled: !!id,
  });
};

export const useGetServiceRequestsByReservation = (reservationId: number) => {
  return useQuery({
    queryKey: serviceRequestKeys.byReservation(reservationId),
    queryFn: async () => {
      const { data } = await axios.get(`/service-requests/reservation/${reservationId}`);
      return data.data;
    },
    enabled: !!reservationId,
  });
};

export const useGetServiceRequestsByGuest = (guestId: number) => {
  return useQuery({
    queryKey: serviceRequestKeys.byGuest(guestId),
    queryFn: async () => {
      const { data } = await axios.get(`/service-requests/guest/${guestId}`);
      return data.data;
    },
    enabled: !!guestId,
  });
};

export const useGetServiceRequestsByStatus = (status: string) => {
  return useQuery({
    queryKey: serviceRequestKeys.byStatus(status),
    queryFn: async () => {
      const { data } = await axios.get(`/service-requests/status/${status}`);
      return data.data;
    },
    enabled: !!status,
  });
};

// Mutations
export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: CreateServiceRequestData) => {
      const { data } = await axios.post(`/service-requests`, requestData);
      return data.data;
    },
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.byReservation(newRequest.reservation_id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.byGuest(newRequest.guest_id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.byStatus(newRequest.status) });
    },
  });
};

export const useUpdateServiceRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: UpdateServiceRequestData) => {
      const { data } = await axios.put(`/service-requests/${id}`, requestData);
      return data.data;
    },
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.byReservation(updatedRequest.reservation_id) });
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.byStatus(updatedRequest.status) });
    },
  });
};

export const useDeleteServiceRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/service-requests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRequestKeys.lists() });
    },
  });
};
