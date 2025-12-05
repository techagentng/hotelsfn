import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

interface DashboardStats {
  total_guests: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  maintenance_rooms: number;
  cleaning_rooms: number;
  pending_check_ins: number;
  pending_check_outs: number;
  pending_service_requests: number;
  today_revenue: number;
  month_revenue: number;
  occupancy_rate: number;
}

interface RoomStatusSummary {
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
}

interface ServiceRequestSummary {
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

interface RevenueStats {
  today_revenue: number;
  today_orders: number;
  week_revenue: number;
  month_revenue: number;
  average_daily_revenue: number;
  top_service: string;
  top_service_revenue: number;
}

// Query Keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  roomStatus: () => [...dashboardKeys.all, 'room-status'] as const,
  serviceRequests: () => [...dashboardKeys.all, 'service-requests'] as const,
  revenue: () => [...dashboardKeys.all, 'revenue'] as const,
};

// Queries
export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: async () => {
      const { data } = await axios.get(`/dashboard/stats`);
      return data.data as DashboardStats;
    },
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useGetRoomStatusSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.roomStatus(),
    queryFn: async () => {
      const { data } = await axios.get(`/dashboard/room-status`);
      return data.data as RoomStatusSummary;
    },
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useGetServiceRequestsSummary = () => {
  return useQuery({
    queryKey: dashboardKeys.serviceRequests(),
    queryFn: async () => {
      const { data } = await axios.get(`/dashboard/service-requests-summary`);
      return data.data as ServiceRequestSummary;
    },
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

export const useGetRevenueStats = () => {
  return useQuery({
    queryKey: dashboardKeys.revenue(),
    queryFn: async () => {
      const { data } = await axios.get(`/dashboard/revenue`);
      return data.data as RevenueStats;
    },
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};
