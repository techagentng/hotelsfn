import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGetGuests, useGetGuestById, useCreateGuest, useGetGuestHistory, useGetGuestPreferences, useGetGuestAIInsights } from '../hooks/useGuests';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  X,
  User,
  Mail,
  Phone,
  CreditCard,
  Globe,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  MapPin,
  UtensilsCrossed,
  Droplet,
  Wrench,
  Car,
  HelpCircle,
  Zap,
  BarChart3,
  ChevronRight,
  FileText,
  Heart,
  Plus,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface Reservation {
  id: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: 'completed' | 'cancelled' | 'no-show';
  nights: number;
}

interface ServiceUsage {
  type: 'room-service' | 'housekeeping' | 'maintenance' | 'special-requests' | 'transportation' | 'general-assistance';
  count: number;
  label: string;
}

interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  idNumber: string;
  idType: string;
  joinDate: string;
  profileImage?: string;
  reservations: Reservation[];
  serviceUsage: ServiceUsage[];
  preferences: {
    roomFloor: string[];
    mealType: string[];
    roomType: string[];
    specialRequests: string[];
  };
  statistics: {
    totalStays: number;
    totalSpent: number;
    averageSpend: number;
    lastVisit: string;
    mostCommonRoom: string;
  };
  ai_insights: {
    mealPreference: string;
    roomPreference: string;
    servicePattern: string;
    riskScore: 'low' | 'medium' | 'high';
    recommendations: string[];
    complaints: string[];
  };
}

const mockGuestProfiles: GuestProfile[] = [
  {
    id: 'G-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    nationality: 'United States',
    idNumber: 'US123456789',
    idType: 'Passport',
    joinDate: '2023-01-15',
    reservations: [
      {
        id: 'BK-1001',
        roomNumber: '101',
        roomType: 'Standard',
        checkIn: '2024-12-01',
        checkOut: '2024-12-05',
        totalPrice: 400,
        status: 'completed',
        nights: 4,
      },
      {
        id: 'BK-1002',
        roomNumber: '102',
        roomType: 'Deluxe',
        checkIn: '2024-11-10',
        checkOut: '2024-11-15',
        totalPrice: 750,
        status: 'completed',
        nights: 5,
      },
      {
        id: 'BK-1003',
        roomNumber: '103',
        roomType: 'Standard',
        checkIn: '2024-10-01',
        checkOut: '2024-10-03',
        totalPrice: 200,
        status: 'completed',
        nights: 2,
      },
    ],
    serviceUsage: [
      { type: 'room-service', count: 12, label: 'Room Service' },
      { type: 'housekeeping', count: 8, label: 'Housekeeping' },
      { type: 'maintenance', count: 2, label: 'Maintenance' },
      { type: 'special-requests', count: 5, label: 'Special Requests' },
      { type: 'transportation', count: 3, label: 'Transportation' },
      { type: 'general-assistance', count: 1, label: 'General Assistance' },
    ],
    preferences: {
      roomFloor: ['1st Floor', '2nd Floor'],
      mealType: ['Vegetarian', 'Vegan'],
      roomType: ['Standard', 'Deluxe'],
      specialRequests: ['Extra pillows', 'Late checkout', 'High floor'],
    },
    statistics: {
      totalStays: 3,
      totalSpent: 1350,
      averageSpend: 450,
      lastVisit: '2024-12-05',
      mostCommonRoom: '101',
    },
    ai_insights: {
      mealPreference: 'Usually orders vegetarian meals, prefers Mediterranean cuisine',
      roomPreference: 'Prefers rooms on 1st or 2nd floor, dislikes high floors',
      servicePattern: 'Frequently uses room service and housekeeping, rarely requests maintenance',
      riskScore: 'low',
      recommendations: [
        'Offer vegetarian menu options at check-in',
        'Prioritize ground/low floor room assignments',
        'Suggest premium room service packages',
      ],
      complaints: [],
    },
  },
  {
    id: 'G-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 234 567 8901',
    nationality: 'Canada',
    idNumber: 'CA987654321',
    idType: 'Passport',
    joinDate: '2023-06-20',
    reservations: [
      {
        id: 'BK-2001',
        roomNumber: '201',
        roomType: 'Suite',
        checkIn: '2024-12-02',
        checkOut: '2024-12-08',
        totalPrice: 1500,
        status: 'completed',
        nights: 6,
      },
      {
        id: 'BK-2002',
        roomNumber: '202',
        roomType: 'Deluxe',
        checkIn: '2024-09-15',
        checkOut: '2024-09-20',
        totalPrice: 750,
        status: 'completed',
        nights: 5,
      },
    ],
    serviceUsage: [
      { type: 'room-service', count: 18, label: 'Room Service' },
      { type: 'housekeeping', count: 6, label: 'Housekeeping' },
      { type: 'maintenance', count: 1, label: 'Maintenance' },
      { type: 'special-requests', count: 8, label: 'Special Requests' },
      { type: 'transportation', count: 4, label: 'Transportation' },
      { type: 'general-assistance', count: 2, label: 'General Assistance' },
    ],
    preferences: {
      roomFloor: ['High Floor', '3rd Floor and above'],
      mealType: ['Seafood', 'Fine Dining'],
      roomType: ['Suite', 'Deluxe'],
      specialRequests: ['Spa services', 'Concierge', 'Early breakfast'],
    },
    statistics: {
      totalStays: 2,
      totalSpent: 2250,
      averageSpend: 1125,
      lastVisit: '2024-12-08',
      mostCommonRoom: '201',
    },
    ai_insights: {
      mealPreference: 'Prefers fine dining and seafood, high-end restaurant recommendations',
      roomPreference: 'Strongly prefers high-floor suites with premium amenities',
      servicePattern: 'Heavy room service user, frequently requests concierge and spa services',
      riskScore: 'low',
      recommendations: [
        'Offer suite upgrades automatically',
        'Provide premium dining packages',
        'Arrange spa and concierge services proactively',
      ],
      complaints: [],
    },
  },
  {
    id: 'G-003',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '+1 234 567 8902',
    nationality: 'United Kingdom',
    idNumber: 'GB456789012',
    idType: 'Passport',
    joinDate: '2024-03-10',
    reservations: [
      {
        id: 'BK-3001',
        roomNumber: '301',
        roomType: 'Standard',
        checkIn: '2024-11-20',
        checkOut: '2024-11-22',
        totalPrice: 200,
        status: 'completed',
        nights: 2,
      },
      {
        id: 'BK-3002',
        roomNumber: '302',
        roomType: 'Standard',
        checkIn: '2024-08-10',
        checkOut: '2024-08-12',
        totalPrice: 200,
        status: 'cancelled',
        nights: 2,
      },
    ],
    serviceUsage: [
      { type: 'room-service', count: 3, label: 'Room Service' },
      { type: 'housekeeping', count: 2, label: 'Housekeeping' },
      { type: 'maintenance', count: 4, label: 'Maintenance' },
      { type: 'special-requests', count: 1, label: 'Special Requests' },
      { type: 'transportation', count: 1, label: 'Transportation' },
      { type: 'general-assistance', count: 3, label: 'General Assistance' },
    ],
    preferences: {
      roomFloor: ['Ground Floor'],
      mealType: ['Traditional', 'British'],
      roomType: ['Standard'],
      specialRequests: ['Quiet room', 'No disturbance'],
    },
    statistics: {
      totalStays: 2,
      totalSpent: 400,
      averageSpend: 200,
      lastVisit: '2024-11-22',
      mostCommonRoom: '301',
    },
    ai_insights: {
      mealPreference: 'Prefers traditional British cuisine, minimal special requests',
      roomPreference: 'Prefers ground floor, quiet rooms away from main areas',
      servicePattern: 'Low service usage, higher maintenance requests, may indicate issues',
      riskScore: 'medium',
      recommendations: [
        'Ensure room quality and maintenance before check-in',
        'Assign quiet ground floor rooms',
        'Provide maintenance contact information upfront',
      ],
      complaints: ['Previous stay had AC issues', 'Requested room change once'],
    },
  },
];

export default function GuestHistory() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const itemsPerPage = 10;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    idType: 'Passport',
    idNumber: '',
  });

  // Fetch guests with pagination
  const { data: guestsData, isLoading, error, refetch } = useGetGuests({
    page: pageIndex + 1,
    page_size: itemsPerPage,
    search: searchTerm,
  });

  // Fetch selected guest details
  const { data: selectedGuest, isLoading: guestLoading } = useGetGuestById(selectedGuestId || 0);
  const { data: guestHistory } = useGetGuestHistory(selectedGuestId || 0);
  const { data: guestPreferences } = useGetGuestPreferences(selectedGuestId || 0);
  const { data: guestAIInsights } = useGetGuestAIInsights(selectedGuestId || 0);

  // Create guest mutation
  const { mutate: createGuest, isPending: isCreating } = useCreateGuest();

  // Extract guests and pagination from API response
  const guests = guestsData?.data || [];
  const totalGuests = guestsData?.meta?.total || 0;
  const pageCount = guestsData?.meta?.total_pages || 1;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageIndex(0);
      refetch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleViewProfile = (guestId: number) => {
    setSelectedGuestId(guestId);
  };

  const closeModal = () => {
    setSelectedGuestId(null);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      nationality: '',
      idType: 'Passport',
      idNumber: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    
    createGuest(
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        id_type: formData.idType,
        id_number: formData.idNumber,
      },
      {
        onSuccess: () => {
          toast.success('Guest created successfully!');
          closeCreateModal();
          refetch();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.error || 'Failed to create guest');
        },
      }
    );
  };

  const getRiskScoreColor = (score: 'low' | 'medium' | 'high') => {
    switch (score) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Guest History & Profiles</h1>
              <p className="text-gray-500">View guest profiles, reservations, and AI insights</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              <span>New Guest</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by guest name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Guest List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading guests...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500">Error loading guests. Please try again.</p>
              </div>
            ) : guests.length > 0 ? (
              guests.map((guest: any) => (
                <div
                  key={guest.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{guest.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Mail size={14} className="mr-1 text-gray-400" />
                            <span>{guest.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone size={14} className="mr-1 text-gray-400" />
                            <span>{guest.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            <span>Member since {new Date(guest.join_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Globe size={14} className="mr-1 text-gray-400" />
                            <span>{guest.nationality}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewProfile(guest.id)}
                      className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No guests found matching your search</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col items-center justify-center px-4 py-4 bg-white rounded-xl shadow">
              <div className="flex gap-2">
                <button
                  onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                  disabled={pageIndex === 0}
                  className="w-10 h-10 rounded-full border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  &lt;
                </button>

                {Array.from({ length: pageCount }, (_, i) => i).map(page => (
                  <button
                    key={page}
                    onClick={() => setPageIndex(page)}
                    className={`w-10 h-10 rounded-full text-sm ${
                      page === pageIndex
                        ? 'bg-gray-200 text-black'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPageIndex(prev => Math.min(pageCount - 1, prev + 1))}
                  disabled={pageIndex === pageCount - 1}
                  className="w-10 h-10 rounded-full border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Page {pageIndex + 1} of {pageCount}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Create Guest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Create New Guest</h2>
                  <p className="text-gray-500 mt-1">Add a new guest to the system</p>
                </div>
                <button
                  onClick={closeCreateModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateGuest}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter guest name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="guest@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality *
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="nationality"
                        required
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="United States"
                      />
                    </div>
                  </div>

                  {/* ID Type and Number */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Type *
                      </label>
                      <select
                        name="idType"
                        required
                        value={formData.idType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="National ID">National ID</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Number *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          name="idNumber"
                          required
                          value={formData.idNumber}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="ID123456789"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Guest'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Guest Profile Modal */}
      {selectedGuestId && selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedGuest.name}</h2>
                    <p className="text-gray-500">Member since {new Date(selectedGuest.join_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center mt-1">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    {selectedGuest.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center mt-1">
                    <Phone size={16} className="mr-2 text-gray-400" />
                    {selectedGuest.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium flex items-center mt-1">
                    <Globe size={16} className="mr-2 text-gray-400" />
                    {selectedGuest.nationality}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{selectedGuest.id_type}</p>
                  <p className="font-medium flex items-center mt-1">
                    <CreditCard size={16} className="mr-2 text-gray-400" />
                    {selectedGuest.id_number}
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Stays</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedGuest.statistics?.total_stays || selectedGuest.reservations?.length || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">${selectedGuest.statistics?.total_spent || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Spend</p>
                  <p className="text-2xl font-bold text-purple-600">${selectedGuest.statistics?.average_spend || 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Last Visit</p>
                  <p className="text-lg font-bold text-orange-600">{selectedGuest.statistics?.last_visit ? new Date(selectedGuest.statistics.last_visit).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Reservation Timeline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservation Timeline</h3>
                <div className="space-y-2">
                  {(selectedGuest.reservations && selectedGuest.reservations.length > 0) ? selectedGuest.reservations.map((reservation, idx) => (
                    <div key={reservation.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Room {reservation.room?.room_number || 'N/A'} ({reservation.room?.room_type || 'N/A'})
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(reservation.check_in_date).toLocaleDateString()} - {new Date(reservation.check_out_date).toLocaleDateString()} ({reservation.nights} nights)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₦{reservation.total_price}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          reservation.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : reservation.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No reservations found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences Panel */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Room Floor Preference</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedGuest.preferences?.room_floors && selectedGuest.preferences.room_floors.length > 0) ? selectedGuest.preferences.room_floors.map((floor, idx) => (
                        <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                          {floor}
                        </span>
                      )) : <span className="text-sm text-gray-500">No preference set</span>}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Meal Type Preference</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedGuest.preferences?.meal_types && selectedGuest.preferences.meal_types.length > 0) ? selectedGuest.preferences.meal_types.map((meal, idx) => (
                        <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          {meal}
                        </span>
                      )) : <span className="text-sm text-gray-500">No preference set</span>}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Room Type Preference</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedGuest.preferences?.room_types && selectedGuest.preferences.room_types.length > 0) ? selectedGuest.preferences.room_types.map((type, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {type}
                        </span>
                      )) : <span className="text-sm text-gray-500">No preference set</span>}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Special Requests</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedGuest.preferences?.special_requests && selectedGuest.preferences.special_requests.length > 0) ? selectedGuest.preferences.special_requests.map((req, idx) => (
                        <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                          {req}
                        </span>
                      )) : <span className="text-sm text-gray-500">No special requests</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Pattern Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Pattern Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(selectedGuest.service_usage && selectedGuest.service_usage.length > 0) ? selectedGuest.service_usage.map((service, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{service.label}</p>
                      <p className="text-2xl font-bold text-indigo-600">{service.count}</p>
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No service usage data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {selectedGuest.ai_insights?.recommendations && selectedGuest.ai_insights.recommendations.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {selectedGuest.ai_insights?.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start text-sm text-green-800">
                        <CheckCircle size={16} className="mr-2 flex-shrink-0 mt-0.5 text-green-600" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Complaints */}
              {selectedGuest.ai_insights?.complaints && selectedGuest.ai_insights.complaints.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-3">Complaints & Notes</h3>
                  <ul className="space-y-2">
                    {selectedGuest.ai_insights?.complaints?.map((complaint, idx) => (
                      <li key={idx} className="flex items-start text-sm text-red-800">
                        <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5 text-red-600" />
                        {complaint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
