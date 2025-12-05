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

// Query Keys
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (filters: GetReservationsParams) => [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: number) => [...reservationKeys.details(), id] as const,
  byGuest: (guestId: number) => [...reservationKeys.all, 'guest', guestId] as const,
  byRoom: (roomId: number) => [...reservationKeys.all, 'room', roomId] as const,
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
