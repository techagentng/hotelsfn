import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';

export interface Room {
  id: number;
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  status: string;
  bed_type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface GetRoomsParams {
  page?: number;
  page_size?: number;
  status?: string;
}

interface GetAvailableRoomsParams {
  check_in: string;
  check_out: string;
  room_type?: string;
}

export interface CreateRoomData {
  room_number: string;
  room_type: string;
  floor: number;
  max_occupancy: number;
  price_per_night: number;
  bed_type: string;
  description: string;
}

// Query Keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters: GetRoomsParams) => [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: number) => [...roomKeys.details(), id] as const,
  available: (params: GetAvailableRoomsParams) => [...roomKeys.all, 'available', params] as const,
};

// Queries
export const useGetRooms = (params: GetRoomsParams = {}) => {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/rooms', { params });
      return data;
    },
  });
};

export const useGetRoomById = (id: number) => {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/rooms/${id}`);
      return data.data as Room;
    },
    enabled: !!id,
  });
};

export const useGetAvailableRooms = (params: GetAvailableRoomsParams) => {
  return useQuery({
    queryKey: roomKeys.available(params),
    queryFn: async () => {
      const { data } = await axios.get('/rooms/available', { params });
      return data.data;
    },
    enabled: !!params.check_in && !!params.check_out,
  });
};

// Mutations
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData: CreateRoomData) => {
      const { data } = await axios.post('/rooms', roomData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useUpdateRoom = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomData: Partial<CreateRoomData>) => {
      const { data } = await axios.put(`/rooms/${id}`, roomData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useUpdateRoomStatus = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      const { data } = await axios.put(`/rooms/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
};
