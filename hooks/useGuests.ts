import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';

interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  id_type: string;
  id_number: string;
  join_date: string;
  created_at: string;
  updated_at: string;
}

interface GuestStatistics {
  total_stays: number;
  total_spent: number;
  average_spend: number;
  last_visit: string;
  most_common_room: string;
}

interface ServiceUsageItem {
  type: string;
  label: string;
  count: number;
}

interface GuestPreferences {
  id: number;
  guest_id: number;
  room_floors: string[];
  meal_types: string[];
  room_types: string[];
  special_requests: string[];
  created_at: string;
  updated_at: string;
}

interface GuestAIInsights {
  id: number;
  guest_id: number;
  meal_preference: string;
  room_preference: string;
  service_pattern: string;
  risk_score: 'low' | 'medium' | 'high';
  recommendations: string[];
  complaints: string[];
  created_at: string;
  updated_at: string;
}

interface Reservation {
  id: number;
  booking_id: string;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_price: number;
  paid_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  room?: {
    id: number;
    room_number: string;
    room_type: string;
    floor: number;
    price_per_night: number;
  };
}

interface GuestDetail extends Guest {
  reservations: Reservation[];
  preferences: GuestPreferences;
  ai_insights: GuestAIInsights;
  statistics: GuestStatistics;
  service_usage: ServiceUsageItem[];
}

interface GetGuestsParams {
  page?: number;
  page_size?: number;
  search?: string;
}

interface GetGuestsResponse {
  data: Guest[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

interface CreateGuestData {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  id_type: string;
  id_number: string;
}

// Query Keys
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (filters: GetGuestsParams) => [...guestKeys.lists(), filters] as const,
  details: () => [...guestKeys.all, 'detail'] as const,
  detail: (id: number) => [...guestKeys.details(), id] as const,
  history: (id: number) => [...guestKeys.detail(id), 'history'] as const,
  preferences: (id: number) => [...guestKeys.detail(id), 'preferences'] as const,
  aiInsights: (id: number) => [...guestKeys.detail(id), 'ai-insights'] as const,
};

// Queries
export const useGetGuests = (params: GetGuestsParams = {}) => {
  return useQuery<GetGuestsResponse>({
    queryKey: guestKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/guests', { params });
      return data.data; // Extract the nested data object
    },
  });
};

export const useGetGuestById = (id: number) => {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/guests/${id}`);
      return data.data as GuestDetail;
    },
    enabled: !!id,
  });
};

export const useGetGuestHistory = (id: number) => {
  return useQuery({
    queryKey: guestKeys.history(id),
    queryFn: async () => {
      const { data } = await axios.get(`/guests/${id}/history`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useGetGuestPreferences = (id: number) => {
  return useQuery({
    queryKey: guestKeys.preferences(id),
    queryFn: async () => {
      const { data } = await axios.get(`/guests/${id}/preferences`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useGetGuestAIInsights = (id: number) => {
  return useQuery({
    queryKey: guestKeys.aiInsights(id),
    queryFn: async () => {
      const { data } = await axios.get(`/guests/${id}/ai-insights`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestData: CreateGuestData) => {
      const { data } = await axios.post('/guests', guestData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
  });
};

export const useUpdateGuest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestData: Partial<CreateGuestData>) => {
      const { data } = await axios.put(`/guests/${id}`, guestData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
  });
};

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/guests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
  });
};
