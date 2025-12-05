// In-Room Tablet Types

export interface GuestRoomInfo {
  guest: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  reservation: {
    id: number;
    confirmation_number: string;
    check_in_date: string;
    check_out_date: string;
    number_of_nights: number;
  };
  room: {
    id: number;
    room_number: string;
    room_type: string;
    floor: number;
  };
  is_checked_in: boolean;
}

export interface MenuCategory {
  name: string;
  items_count: number;
  icon: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  preparation_time: number;
  available: boolean;
  image_url?: string;
  allergens?: string[];
  dietary_info?: string[];
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
  subtotal: number;
}

export interface PlaceOrderRequest {
  room_id: number;
  guest_id: number;
  items: {
    menu_item_id: number;
    quantity: number;
    special_instructions?: string;
  }[];
  special_requests?: string;
  priority?: 'normal' | 'high' | 'urgent';
}

export interface OrderStatusResponse {
  id: number;
  order_number: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered';
  status_history: {
    status: string;
    timestamp: string;
    updated_by?: string;
  }[];
  estimated_delivery_time: string;
  current_step: number;
  total_steps: number;
}

export type HousekeepingServiceType = 'cleaning' | 'towels' | 'amenities' | 'bedding' | 'turndown';
export type MaintenanceIssueType = 'air_conditioning' | 'plumbing' | 'electrical' | 'appliances' | 'furniture' | 'other';
export type ServicePriority = 'normal' | 'high' | 'urgent';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface HousekeepingRequest {
  room_id: number;
  guest_id: number;
  service_type: HousekeepingServiceType;
  priority: ServicePriority;
  notes?: string;
  preferred_time?: string;
}

export interface MaintenanceRequest {
  room_id: number;
  guest_id: number;
  issue_type: MaintenanceIssueType;
  priority: ServicePriority;
  description: string;
  preferred_time?: string;
}

export interface ServiceRequest {
  id: number;
  request_number: string;
  type: 'housekeeping' | 'maintenance';
  service_type?: string;
  issue_type?: string;
  status: ServiceStatus;
  priority?: string;
  requested_at: string;
  estimated_time?: string;
  notes?: string;
  description?: string;
}

export interface HotelFacility {
  name: string;
  hours: string;
  location: string;
  icon: string;
}

export interface DiningOption {
  name: string;
  cuisine?: string;
  type?: string;
  hours: string;
  location: string;
}

export interface HotelInfo {
  name: string;
  description: string;
  facilities: HotelFacility[];
  dining: DiningOption[];
  contact: {
    reception: string;
    room_service: string;
    concierge: string;
    emergency: string;
  };
  wifi: {
    network: string;
    password: string;
  };
}

export interface ExpressCheckoutRequest {
  guest_id: number;
  email_receipt: boolean;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface ExpressCheckoutResponse {
  reservation_id: number;
  checkout_status: string;
  total_charges: number;
  additional_charges: number;
  final_total: number;
  receipt_sent: boolean;
  estimated_processing_time: string;
}
