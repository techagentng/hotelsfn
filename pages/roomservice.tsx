import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  Filter,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MapPin,
  Phone,
  UtensilsCrossed,
  Droplet,
  Wrench,
  Star,
  Car,
  HelpCircle,
  Zap,
  ChevronRight,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

type ServiceType = 'room-service' | 'housekeeping' | 'maintenance' | 'special-requests' | 'transportation' | 'general-assistance';
type ServiceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

interface ServiceRequest {
  id: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  priority: 'low' | 'medium' | 'high';
  description: string;
  requestedAt: string;
  assignedTo?: string;
  completedAt?: string;
  notes?: string;
}

const serviceTypeConfig: Record<ServiceType, { icon: React.ReactNode; label: string; color: string; bgColor: string }> = {
  'room-service': {
    icon: <UtensilsCrossed size={20} />,
    label: 'Room Service',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  housekeeping: {
    icon: <Droplet size={20} />,
    label: 'Housekeeping',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  maintenance: {
    icon: <Wrench size={20} />,
    label: 'Maintenance',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  'special-requests': {
    icon: <Star size={20} />,
    label: 'Special Requests',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  transportation: {
    icon: <Car size={20} />,
    label: 'Transportation',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  'general-assistance': {
    icon: <HelpCircle size={20} />,
    label: 'General Assistance',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
};

const statusStyles: Record<ServiceStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<ServiceStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 mr-1" />,
  'in-progress': <Zap className="w-4 h-4 mr-1" />,
  completed: <CheckCircle className="w-4 h-4 mr-1" />,
  cancelled: <AlertCircle className="w-4 h-4 mr-1" />,
};

const mockServiceRequests: ServiceRequest[] = [
  {
    id: 'SR-001',
    roomNumber: '101',
    guestName: 'John Doe',
    guestPhone: '+1 234 567 8900',
    serviceType: 'room-service',
    status: 'pending',
    priority: 'high',
    description: 'Order: 2x Caesar Salad, 1x Grilled Salmon, 1x Bottle of Red Wine',
    requestedAt: '2024-12-05T10:30:00',
    notes: 'Guest prefers no croutons on salad',
  },
  {
    id: 'SR-002',
    roomNumber: '102',
    guestName: 'Jane Smith',
    guestPhone: '+1 234 567 8901',
    serviceType: 'housekeeping',
    status: 'in-progress',
    priority: 'medium',
    description: 'Request: Fresh towels, clean bed sheets, vacuum room',
    requestedAt: '2024-12-05T09:15:00',
    assignedTo: 'Maria Garcia',
  },
  {
    id: 'SR-003',
    roomNumber: '103',
    guestName: 'Robert Johnson',
    guestPhone: '+1 234 567 8902',
    serviceType: 'maintenance',
    status: 'pending',
    priority: 'high',
    description: 'Issue: Air conditioning not working, room temperature too warm',
    requestedAt: '2024-12-05T10:45:00',
    notes: 'Guest reports temperature is 28°C',
  },
  {
    id: 'SR-004',
    roomNumber: '201',
    guestName: 'Sarah Williams',
    guestPhone: '+1 234 567 8903',
    serviceType: 'special-requests',
    status: 'completed',
    priority: 'low',
    description: 'Request: Extra pillows (2), extra blanket',
    requestedAt: '2024-12-05T08:00:00',
    completedAt: '2024-12-05T08:30:00',
    assignedTo: 'John Smith',
  },
  {
    id: 'SR-005',
    roomNumber: '202',
    guestName: 'Michael Brown',
    guestPhone: '+1 234 567 8904',
    serviceType: 'transportation',
    status: 'pending',
    priority: 'high',
    description: 'Request: Airport pickup tomorrow at 6:00 AM, destination: Downtown Hotel',
    requestedAt: '2024-12-05T11:00:00',
    notes: 'Guest has 2 large suitcases',
  },
  {
    id: 'SR-006',
    roomNumber: '203',
    guestName: 'Emily Davis',
    guestPhone: '+1 234 567 8905',
    serviceType: 'general-assistance',
    status: 'in-progress',
    priority: 'medium',
    description: 'Request: WiFi password reset, help connecting to hotel network',
    requestedAt: '2024-12-05T10:20:00',
    assignedTo: 'Support Team',
  },
  {
    id: 'SR-007',
    roomNumber: '301',
    guestName: 'David Wilson',
    guestPhone: '+1 234 567 8906',
    serviceType: 'room-service',
    status: 'completed',
    priority: 'medium',
    description: 'Order: 1x Breakfast set, 1x Coffee, 1x Orange juice',
    requestedAt: '2024-12-05T07:00:00',
    completedAt: '2024-12-05T07:45:00',
    assignedTo: 'Room Service Team',
  },
  {
    id: 'SR-008',
    roomNumber: '302',
    guestName: 'Lisa Anderson',
    guestPhone: '+1 234 567 8907',
    serviceType: 'maintenance',
    status: 'in-progress',
    priority: 'high',
    description: 'Issue: Bathroom sink is leaking, water damage on floor',
    requestedAt: '2024-12-05T10:50:00',
    assignedTo: 'Maintenance Team',
  },
];

export default function RoomService() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const itemsPerPage = 10;

  const filteredRequests = mockServiceRequests.filter(request => {
    const matchesSearch =
      request.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServiceType = serviceTypeFilter === 'all' || request.serviceType === serviceTypeFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesServiceType && matchesStatus;
  });

  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    pageIndex * itemsPerPage,
    (pageIndex + 1) * itemsPerPage
  );

  const pendingCount = mockServiceRequests.filter(r => r.status === 'pending').length;
  const inProgressCount = mockServiceRequests.filter(r => r.status === 'in-progress').length;
  const completedCount = mockServiceRequests.filter(r => r.status === 'completed').length;

  const serviceTypeCounts = {
    'room-service': mockServiceRequests.filter(r => r.serviceType === 'room-service').length,
    housekeeping: mockServiceRequests.filter(r => r.serviceType === 'housekeeping').length,
    maintenance: mockServiceRequests.filter(r => r.serviceType === 'maintenance').length,
    'special-requests': mockServiceRequests.filter(r => r.serviceType === 'special-requests').length,
    transportation: mockServiceRequests.filter(r => r.serviceType === 'transportation').length,
    'general-assistance': mockServiceRequests.filter(r => r.serviceType === 'general-assistance').length,
  };

  const handleViewDetails = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  const closeModal = () => {
    setSelectedRequest(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setServiceTypeFilter('all');
    setStatusFilter('all');
    setPageIndex(0);
  };

  const handleAssignRequest = (request: ServiceRequest) => {
    alert(`Assigning request ${request.id} to staff member`);
  };

  const handleCompleteRequest = (request: ServiceRequest) => {
    alert(`Marking request ${request.id} as completed`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Room Service Management</h1>
              <p className="text-gray-500">Manage guest service requests from all rooms</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Service Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(serviceTypeConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setServiceTypeFilter(serviceTypeFilter === key ? 'all' : (key as ServiceType))}
                className={`p-4 rounded-lg transition-all ${
                  serviceTypeFilter === key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-900 hover:shadow-md'
                }`}
              >
                <div className={`${serviceTypeFilter === key ? 'text-white' : config.color} mb-2`}>
                  {config.icon}
                </div>
                <p className="text-xs font-semibold">{config.label}</p>
                <p className={`text-lg font-bold mt-1 ${serviceTypeFilter === key ? 'text-white' : 'text-gray-900'}`}>
                  {serviceTypeCounts[key as ServiceType]}
                </p>
              </button>
            ))}
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by room, guest name, or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <Filter size={16} className="mr-2" />
                  <span>Filters</span>
                </button>

                {(searchTerm || serviceTypeFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    <X size={16} className="mr-1" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as ServiceStatus | 'all')}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service Requests List */}
          <div className="space-y-3">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => {
                const config = serviceTypeConfig[request.serviceType];
                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border-l-4"
                    style={{ borderLeftColor: config.color.replace('text-', 'rgb(') }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <div className={config.color}>{config.icon}</div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Room {request.roomNumber}</h3>
                            <p className="text-sm text-gray-500">{config.label}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${statusStyles[request.status]}`}>
                            {statusIcons[request.status]}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{request.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User size={16} className="mr-2 text-gray-400" />
                            <span>{request.guestName}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2 text-gray-400" />
                            <span>{request.guestPhone}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            <span>{new Date(request.requestedAt).toLocaleTimeString()}</span>
                          </div>
                          {request.assignedTo && (
                            <div className="flex items-center">
                              <CheckCircle size={16} className="mr-2 text-gray-400" />
                              <span>{request.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDetails(request)}
                        className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No service requests found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col items-center justify-center px-4 py-4 bg-white rounded-xl shadow border-t">
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

      {/* Service Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Service Request #{selectedRequest.id}</h2>
                  <p className="text-gray-500">Room {selectedRequest.roomNumber}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Guest Name</p>
                      <p className="font-medium">{selectedRequest.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {selectedRequest.guestPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Number</p>
                      <p className="font-medium flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {selectedRequest.roomNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Request Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Service Type</p>
                      <div className="flex items-center mt-1">
                        <div className={`p-2 rounded-lg ${serviceTypeConfig[selectedRequest.serviceType].bgColor} mr-2`}>
                          <div className={serviceTypeConfig[selectedRequest.serviceType].color}>
                            {serviceTypeConfig[selectedRequest.serviceType].icon}
                          </div>
                        </div>
                        <p className="font-medium">{serviceTypeConfig[selectedRequest.serviceType].label}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mt-1 ${statusStyles[selectedRequest.status]}`}>
                        {statusIcons[selectedRequest.status]}
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <p className="font-medium capitalize">{selectedRequest.priority}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedRequest.description}</p>
              </div>

              {selectedRequest.notes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Notes</h3>
                  <p className="text-blue-800">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-gray-500">Requested At</p>
                  <p className="font-medium">{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                </div>
                {selectedRequest.completedAt && (
                  <div>
                    <p className="text-gray-500">Completed At</p>
                    <p className="font-medium">{new Date(selectedRequest.completedAt).toLocaleString()}</p>
                  </div>
                )}
                {selectedRequest.assignedTo && (
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{selectedRequest.assignedTo}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={closeModal}
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleAssignRequest(selectedRequest)}
                  >
                    Assign Staff
                  </button>
                )}
                {selectedRequest.status === 'in-progress' && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    onClick={() => handleCompleteRequest(selectedRequest)}
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
