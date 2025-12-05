import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import {
  GuestRoomInfo,
  MenuItem,
  MenuCategory,
  PlaceOrderRequest,
  OrderStatusResponse,
  HousekeepingRequest,
  MaintenanceRequest,
  ServiceRequest,
  HotelInfo,
  ExpressCheckoutRequest,
  ExpressCheckoutResponse,
} from '../types/tablet';

// Query Keys
export const tabletKeys = {
  all: ['tablet'] as const,
  guestInfo: (roomNumber: string) => [...tabletKeys.all, 'guest', roomNumber] as const,
  menu: () => [...tabletKeys.all, 'menu'] as const,
  menuByCategory: (category: string) => [...tabletKeys.menu(), category] as const,
  categories: () => [...tabletKeys.all, 'categories'] as const,
  activeOrders: (guestId: number) => [...tabletKeys.all, 'orders', 'active', guestId] as const,
  orderStatus: (orderId: number) => [...tabletKeys.all, 'orders', 'status', orderId] as const,
  services: (guestId: number) => [...tabletKeys.all, 'services', guestId] as const,
  hotelInfo: () => [...tabletKeys.all, 'hotel-info'] as const,
};

// Get guest room information
export const useGetGuestInfo = (roomNumber: string) => {
  return useQuery({
    queryKey: tabletKeys.guestInfo(roomNumber),
    queryFn: async () => {
      const { data } = await axios.get(`/tablet/room/${roomNumber}/guest`);
      return data.data as GuestRoomInfo;
    },
    enabled: !!roomNumber,
  });
};

// Get menu items
export const useGetMenu = (category?: string) => {
  return useQuery({
    queryKey: category ? tabletKeys.menuByCategory(category) : tabletKeys.menu(),
    queryFn: async () => {
      const { data } = await axios.get('/room-service/menu', {
        params: category ? { category, available: true } : { available: true },
      });
      return data.data as MenuItem[];
    },
  });
};

// Get menu categories
export const useGetMenuCategories = () => {
  return useQuery({
    queryKey: tabletKeys.categories(),
    queryFn: async () => {
      const { data } = await axios.get('/room-service/menu/categories');
      return data.data as MenuCategory[];
    },
  });
};

// Get active orders
export const useGetActiveOrders = (guestId: number) => {
  return useQuery({
    queryKey: tabletKeys.activeOrders(guestId),
    queryFn: async () => {
      const { data } = await axios.get(`/room-service/orders/guest/${guestId}/active`);
      return data.data;
    },
    enabled: !!guestId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Get order status
export const useGetOrderStatus = (orderId: number) => {
  return useQuery({
    queryKey: tabletKeys.orderStatus(orderId),
    queryFn: async () => {
      const { data } = await axios.get(`/room-service/orders/${orderId}/status`);
      return data.data as OrderStatusResponse;
    },
    enabled: !!orderId,
    refetchInterval: 15000, // Refresh every 15 seconds for real-time tracking
  });
};

// Get service requests
export const useGetServiceRequests = (guestId: number) => {
  return useQuery({
    queryKey: tabletKeys.services(guestId),
    queryFn: async () => {
      const { data } = await axios.get(`/services/guest/${guestId}`);
      return data.data as ServiceRequest[];
    },
    enabled: !!guestId,
  });
};

// Get hotel information
export const useGetHotelInfo = () => {
  return useQuery({
    queryKey: tabletKeys.hotelInfo(),
    queryFn: async () => {
      const { data } = await axios.get('/hotel/info');
      return data.data as HotelInfo;
    },
  });
};

// Place order
export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: PlaceOrderRequest) => {
      const { data } = await axios.post('/room-service/orders', orderData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: tabletKeys.activeOrders(variables.guest_id) 
      });
    },
  });
};

// Request housekeeping
export const useRequestHousekeeping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: HousekeepingRequest) => {
      const { data } = await axios.post('/services/housekeeping', requestData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: tabletKeys.services(variables.guest_id) 
      });
    },
  });
};

// Request maintenance
export const useRequestMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestData: MaintenanceRequest) => {
      const { data } = await axios.post('/services/maintenance', requestData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: tabletKeys.services(variables.guest_id) 
      });
    },
  });
};

// Express checkout
export const useExpressCheckout = (reservationId: number) => {
  return useMutation({
    mutationFn: async (checkoutData: ExpressCheckoutRequest) => {
      const { data } = await axios.post(
        `/reservations/${reservationId}/checkout/express`,
        checkoutData
      );
      return data.data as ExpressCheckoutResponse;
    },
  });
};

// Export types for use in components
export type { GuestRoomInfo, MenuItem, MenuCategory, ServiceRequest, HotelInfo };
