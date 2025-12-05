import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';

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
}

interface GetReservationsParams {
  page?: number;
  page_size?: number;
  status?: string;
}

interface CreateReservationData {
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
}

export interface DashboardStats {
  new_bookings_today: number;
  scheduled_bookings: number;
  check_ins_today: number;
  check_outs_today: number;
  pending_check_ins: number;
  pending_check_outs: number;
  total_rooms: number;
  available_rooms_today: number;
  occupied_rooms_today: number;
  sold_out_rooms_today: number;
  fraud_score: number;
  user_count: number;
  total_guests: number;
}

// Query Keys
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (filters: GetReservationsParams) => [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  byGuest: (guestId: number) => [...reservationKeys.all, 'guest', guestId] as const,
  byRoom: (roomId: number) => [...reservationKeys.all, 'room', roomId] as const,
  dashboard: () => [...reservationKeys.all, 'dashboard'] as const,
};

// Queries
export const useGetReservations = (params: GetReservationsParams = {}) => {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: async () => {
      const { data } = await axios.get('/reservations', { params });
      return data;
    },
  });
};

export const useGetReservationById = (id: number) => {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: async () => {
      const { data } = await axios.get(`/reservations/${id}`);
      return data.data as Reservation;
    },
    enabled: !!id,
  });
};

export const useGetReservationsByGuest = (guestId: number) => {
  return useQuery({
    queryKey: reservationKeys.byGuest(guestId),
    queryFn: async () => {
      const { data } = await axios.get(`/reservations/guest/${guestId}`);
      return data.data;
    },
    enabled: !!guestId,
  });
};

export const useGetReservationsByRoom = (roomId: number) => {
  return useQuery({
    queryKey: reservationKeys.byRoom(roomId),
    queryFn: async () => {
      const { data } = await axios.get(`/reservations/room/${roomId}`);
      return data.data;
    },
    enabled: !!roomId,
  });
};

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: reservationKeys.dashboard(),
    queryFn: async () => {
      const { data } = await axios.get('/reservations/dashboard');
      return data.data as DashboardStats;
    },
  });
};

// Mutations
export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationData: CreateReservationData) => {
      const { data } = await axios.post('/reservations', reservationData);
      return data.data;
    },
    onSuccess: (newReservation) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byGuest(newReservation.guest_id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byRoom(newReservation.room_id) });
    },
  });
};

export const useUpdateReservation = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reservationData: Partial<CreateReservationData>) => {
      const { data } = await axios.put(`/reservations/${id}`, reservationData);
      return data.data;
    },
    onSuccess: (updatedReservation) => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.byGuest(updatedReservation.guest_id) });
    },
  });
};

export const useUpdateReservationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await axios.put(`/reservations/${id}/status`, { status });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.dashboard() });
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, cancellation_reason, refund_amount }: { 
      id: number; 
      cancellation_reason: string;
      refund_amount?: number;
    }) => {
      const { data } = await axios.put(`/reservations/${id}/cancel`, { 
        cancellation_reason,
        refund_amount 
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.dashboard() });
    },
  });
};

export const useCheckinReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actual_check_in_time, room_key_issued, payment_verified, id_verified, deposit_collected, notes }: { 
      id: number; 
      actual_check_in_time?: string;
      room_key_issued?: boolean;
      payment_verified?: boolean;
      id_verified?: boolean;
      deposit_collected?: number;
      notes?: string;
    }) => {
      const { data } = await axios.post(`/reservations/${id}/checkin`, { 
        actual_check_in_time,
        room_key_issued,
        payment_verified,
        id_verified,
        deposit_collected,
        notes 
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.dashboard() });
    },
  });
};

export const useCheckoutReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, additional_charges, notes }: { 
      id: number; 
      additional_charges?: number;
      notes?: string;
    }) => {
      const { data } = await axios.post(`/reservations/${id}/checkout`, { 
        additional_charges,
        notes 
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reservationKeys.dashboard() });
    },
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/reservations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
  });
};
