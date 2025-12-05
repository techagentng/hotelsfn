import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
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
  UserPlus,
  UserCheck,
  UserX,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import {
  useGetServiceRequests,
  useUpdateServiceRequest,
  type ServiceRequest as APIServiceRequest,
} from '../hooks/useRoomService';
import {
  useGetAvailableStaff,
  useManualAssignStaff,
  useAutoAssignStaff,
  type Staff,
} from '../hooks/useStaff';

type ServiceType = 'room-service' | 'housekeeping' | 'maintenance' | 'special-requests' | 'transportation' | 'general-assistance';
type ServiceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

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


export default function RoomService() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ServiceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<APIServiceRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const itemsPerPage = 10;

  // Fetch service requests from API
  const { data: serviceRequests = [], isLoading } = useGetServiceRequests({
    page: pageIndex + 1,
    page_size: 100, // Fetch more for client-side filtering
  });

  // Fetch available staff
  const { data: availableStaff = [] } = useGetAvailableStaff();

  // Staff assignment mutations
  const manualAssign = useManualAssignStaff();
  const autoAssign = useAutoAssignStaff();
  
  // Track which requests have been auto-assigned to prevent duplicate assignments
  const assignedRequestsRef = useRef<Set<number>>(new Set());

  // Auto-assign staff to pending unassigned requests
  useEffect(() => {
    const pendingUnassigned = serviceRequests.filter(
      request => request.status === 'pending' && !request.assigned_to && !assignedRequestsRef.current.has(request.id)
    );

    pendingUnassigned.forEach(async (request) => {
      // Mark as being processed to prevent retries
      assignedRequestsRef.current.add(request.id);
      
      try {
        await autoAssign.mutateAsync(request.id);
        toast.success(`Staff auto-assigned to ${serviceTypeConfig[request.service_type]?.label || 'service request'} for Room ${request.room_number}`);
      } catch (error: any) {
        console.error('Auto-assign failed for request', request.id, ':', error);
        
        // For 404 errors, keep it marked as processed to prevent infinite loop
        // The endpoint doesn't exist, so retrying won't help
        if (error.response?.status === 404) {
          toast.error('Auto-assign endpoint not found. Please restart the backend server.', {
            duration: 5000,
            id: 'auto-assign-404', // Prevent duplicate toasts
          });
        } else {
          // For other errors, remove from tracking so it can be retried
          assignedRequestsRef.current.delete(request.id);
          toast.error(error.response?.data?.error || 'Failed to auto-assign staff');
        }
      }
    });
  }, [serviceRequests, autoAssign]);

  const filteredRequests = useMemo(() => serviceRequests.filter(request => {
    const matchesSearch =
      (request.room_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (request.guest_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesServiceType = serviceTypeFilter === 'all' || request.service_type === serviceTypeFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesServiceType && matchesStatus;
  }), [serviceRequests, searchTerm, serviceTypeFilter, statusFilter]);

  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    pageIndex * itemsPerPage,
    (pageIndex + 1) * itemsPerPage
  );

  const pendingCount = useMemo(() => serviceRequests.filter(r => r.status === 'pending').length, [serviceRequests]);
  const inProgressCount = useMemo(() => serviceRequests.filter(r => r.status === 'in-progress').length, [serviceRequests]);
  const completedCount = useMemo(() => serviceRequests.filter(r => r.status === 'completed').length, [serviceRequests]);

  const serviceTypeCounts = useMemo(() => ({
    'room-service': serviceRequests.filter(r => r.service_type === 'room-service').length,
    housekeeping: serviceRequests.filter(r => r.service_type === 'housekeeping').length,
    maintenance: serviceRequests.filter(r => r.service_type === 'maintenance').length,
    'special-requests': serviceRequests.filter(r => r.service_type === 'special-requests').length,
    transportation: serviceRequests.filter(r => r.service_type === 'transportation').length,
    'general-assistance': serviceRequests.filter(r => r.service_type === 'general-assistance').length,
  }), [serviceRequests]);

  const handleViewDetails = (request: APIServiceRequest) => {
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

  const updateRequest = useUpdateServiceRequest(selectedRequest?.id || 0);


  const handleAssignRequest = async (request: APIServiceRequest, staffName: string) => {
    try {
      await updateRequest.mutateAsync({
        status: 'in-progress',
        assigned_to: staffName,
      });
      toast.success('Request assigned successfully');
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to assign request');
    }
  };

  const handleCompleteRequest = async (request: APIServiceRequest) => {
    try {
      await updateRequest.mutateAsync({
        status: 'completed',
      });
      toast.success('Request marked as completed');
      setSelectedRequest(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete request');
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
            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Loading service requests...</p>
              </div>
            ) : paginatedRequests.length > 0 ? (
              paginatedRequests.map((request) => {
                const config = serviceTypeConfig[request.service_type] || serviceTypeConfig['general-assistance'];
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
                            <h3 className="text-lg font-semibold text-gray-900">Room {request.room_number || 'N/A'}</h3>
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
                            <span>{request.guest_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2 text-gray-400" />
                            <span>{request.guest_phone || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-gray-400" />
                            <span>{new Date(request.requested_at).toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center">
                            {request.assigned_to ? (
                              <>
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2">
                                  <span className="text-xs font-semibold text-white">
                                    {request.assigned_to.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </span>
                                </div>
                                <span className="font-medium text-green-600">{request.assigned_to}</span>
                              </>
                            ) : (
                              <>
                                <UserX size={16} className="mr-2 text-orange-400" />
                                <span className="text-orange-500 font-medium">Unassigned</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronRight size={20} className="text-gray-400" />
                        </button>
                      </div>
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
                  <p className="text-gray-500">Room {selectedRequest.room_number || 'N/A'}</p>
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
                      <p className="font-medium">{selectedRequest.guest_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {selectedRequest.guest_phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Room Number</p>
                      <p className="font-medium flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {selectedRequest.room_number || 'N/A'}
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
                        <div className={`p-2 rounded-lg ${(serviceTypeConfig[selectedRequest.service_type] || serviceTypeConfig['general-assistance']).bgColor} mr-2`}>
                          <div className={(serviceTypeConfig[selectedRequest.service_type] || serviceTypeConfig['general-assistance']).color}>
                            {(serviceTypeConfig[selectedRequest.service_type] || serviceTypeConfig['general-assistance']).icon}
                          </div>
                        </div>
                        <p className="font-medium">{(serviceTypeConfig[selectedRequest.service_type] || serviceTypeConfig['general-assistance']).label}</p>
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
                  <p className="font-medium">{new Date(selectedRequest.requested_at).toLocaleString()}</p>
                </div>
                {selectedRequest.completed_at && (
                  <div>
                    <p className="text-gray-500">Completed At</p>
                    <p className="font-medium">{new Date(selectedRequest.completed_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedRequest.assigned_to && (
                  <div>
                    <p className="text-gray-500">Assigned To</p>
                    <p className="font-medium">{selectedRequest.assigned_to}</p>
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => handleAssignRequest(selectedRequest, 'Staff Member')}
                    disabled={updateRequest.isPending}
                  >
                    {updateRequest.isPending ? 'Assigning...' : 'Assign Staff'}
                  </button>
                )}
                {selectedRequest.status === 'in-progress' && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    onClick={() => handleCompleteRequest(selectedRequest)}
                    disabled={updateRequest.isPending}
                  >
                    {updateRequest.isPending ? 'Completing...' : 'Mark Complete'}
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
