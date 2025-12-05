import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  Filter,
  X,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Key,
  Calendar,
  Users,
  DollarSign,
  FileText,
  QrCode,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

type CheckinStatus = 'pending' | 'checked-in' | 'completed' | 'no-show';

interface CheckinGuest {
  id: string;
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  status: CheckinStatus;
  guestCount: number;
  totalPrice: number;
  specialRequests?: string;
  idVerified: boolean;
  keyIssued: boolean;
  documentsSigned: boolean;
  notes?: string;
}

const statusStyles: Record<CheckinStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'checked-in': 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  'no-show': 'bg-red-100 text-red-800',
};

const statusIcons: Record<CheckinStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 mr-1" />,
  'checked-in': <CheckCircle className="w-4 h-4 mr-1" />,
  completed: <CheckCircle className="w-4 h-4 mr-1" />,
  'no-show': <AlertCircle className="w-4 h-4 mr-1" />,
};

const statusLabels: Record<CheckinStatus, string> = {
  pending: 'Pending',
  'checked-in': 'Checked In',
  completed: 'Completed',
  'no-show': 'No Show',
};

const mockCheckIns: CheckinGuest[] = [
  {
    id: 'CI-001',
    bookingId: 'BK-1001',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '+1 234 567 8900',
    roomNumber: '101',
    roomType: 'Standard',
    checkInDate: '2024-12-04',
    checkOutDate: '2024-12-08',
    status: 'checked-in',
    guestCount: 2,
    totalPrice: 400,
    specialRequests: 'High floor preferred',
    idVerified: true,
    keyIssued: true,
    documentsSigned: true,
  },
  {
    id: 'CI-002',
    bookingId: 'BK-1002',
    guestName: 'Jane Smith',
    guestEmail: 'jane@example.com',
    guestPhone: '+1 234 567 8901',
    roomNumber: '102',
    roomType: 'Deluxe',
    checkInDate: '2024-12-04',
    checkOutDate: '2024-12-06',
    status: 'pending',
    guestCount: 1,
    totalPrice: 300,
    idVerified: false,
    keyIssued: false,
    documentsSigned: false,
  },
  {
    id: 'CI-003',
    bookingId: 'BK-1003',
    guestName: 'Robert Johnson',
    guestEmail: 'robert@example.com',
    guestPhone: '+1 234 567 8902',
    roomNumber: '103',
    roomType: 'Suite',
    checkInDate: '2024-12-04',
    checkOutDate: '2024-12-10',
    status: 'checked-in',
    guestCount: 4,
    totalPrice: 1000,
    specialRequests: 'Late checkout requested',
    idVerified: true,
    keyIssued: true,
    documentsSigned: true,
    notes: 'VIP guest - complimentary upgrade provided',
  },
  {
    id: 'CI-004',
    bookingId: 'BK-1004',
    guestName: 'Sarah Williams',
    guestEmail: 'sarah@example.com',
    guestPhone: '+1 234 567 8903',
    roomNumber: '201',
    roomType: 'Standard',
    checkInDate: '2024-12-04',
    checkOutDate: '2024-12-05',
    status: 'pending',
    guestCount: 1,
    totalPrice: 100,
    idVerified: false,
    keyIssued: false,
    documentsSigned: false,
  },
  {
    id: 'CI-005',
    bookingId: 'BK-1005',
    guestName: 'Michael Brown',
    guestEmail: 'michael@example.com',
    guestPhone: '+1 234 567 8904',
    roomNumber: '202',
    roomType: 'Deluxe',
    checkInDate: '2024-12-03',
    checkOutDate: '2024-12-04',
    status: 'completed',
    guestCount: 2,
    totalPrice: 300,
    idVerified: true,
    keyIssued: true,
    documentsSigned: true,
  },
  {
    id: 'CI-006',
    bookingId: 'BK-1006',
    guestName: 'Emily Davis',
    guestEmail: 'emily@example.com',
    guestPhone: '+1 234 567 8905',
    roomNumber: '203',
    roomType: 'Suite',
    checkInDate: '2024-12-04',
    checkOutDate: '2024-12-07',
    status: 'no-show',
    guestCount: 3,
    totalPrice: 750,
    idVerified: false,
    keyIssued: false,
    documentsSigned: false,
    notes: 'Guest did not arrive - no cancellation notice',
  },
];

export default function CheckIn() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CheckinStatus | 'all'>('all');
  const [selectedGuest, setSelectedGuest] = useState<CheckinGuest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const itemsPerPage = 10;
  const [showManualCheckin, setShowManualCheckin] = useState(false);
  const [manualCheckinStep, setManualCheckinStep] = useState<'search' | 'verify' | 'complete'>('search');
  const [manualFormData, setManualFormData] = useState({
    bookingId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomNumber: '',
    idVerified: false,
    keyIssued: false,
    documentsSigned: false,
    notes: '',
  });

  const filteredGuests = mockCheckIns.filter(guest => {
    const matchesSearch =
      guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.bookingId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pageCount = Math.ceil(filteredGuests.length / itemsPerPage);
  const paginatedGuests = filteredGuests.slice(
    pageIndex * itemsPerPage,
    (pageIndex + 1) * itemsPerPage
  );

  const pendingCount = mockCheckIns.filter(g => g.status === 'pending').length;
  const checkedInCount = mockCheckIns.filter(g => g.status === 'checked-in').length;
  const completedCount = mockCheckIns.filter(g => g.status === 'completed').length;
  const noShowCount = mockCheckIns.filter(g => g.status === 'no-show').length;

  const handleViewDetails = (guest: CheckinGuest) => {
    setSelectedGuest(guest);
  };

  const closeModal = () => {
    setSelectedGuest(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPageIndex(0);
  };

  const handleCompleteCheckin = (guest: CheckinGuest) => {
    alert(`Check-in completed for ${guest.guestName}`);
  };

  const handleMarkNoShow = (guest: CheckinGuest) => {
    alert(`${guest.guestName} marked as no-show`);
  };

  const closeManualCheckin = () => {
    setShowManualCheckin(false);
    setManualCheckinStep('search');
    setManualFormData({
      bookingId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      roomNumber: '',
      idVerified: false,
      keyIssued: false,
      documentsSigned: false,
      notes: '',
    });
  };

  const handleSearchBooking = () => {
    if (manualFormData.bookingId.trim()) {
      setManualCheckinStep('verify');
    }
  };

  const handleCompleteManualCheckin = () => {
    alert(`Manual check-in completed for ${manualFormData.guestName}`);
    closeManualCheckin();
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Check-In Management</h1>
              <p className="text-gray-500">Manage guest arrivals and check-in process</p>
            </div>
            <button
              onClick={() => setShowManualCheckin(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Plus size={18} className="mr-2" />
              <span>+ Manual Check-In</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Check-In</p>
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
                  <p className="text-gray-500 text-sm">Checked In</p>
                  <p className="text-3xl font-bold text-green-600">{checkedInCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{completedCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">No Show</p>
                  <p className="text-3xl font-bold text-red-600">{noShowCount}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search guests..."
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

                {(searchTerm || statusFilter !== 'all') && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as CheckinStatus | 'all')}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="checked-in">Checked In</option>
                  <option value="completed">Completed</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
            )}
          </div>

          {/* Check-In List */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedGuests.length > 0 ? (
                    paginatedGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{guest.guestName}</div>
                              <div className="text-sm text-gray-500">{guest.guestEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {guest.bookingId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guest.roomNumber}</div>
                          <div className="text-sm text-gray-500">{guest.roomType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(guest.checkInDate).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{guest.guestCount} guest{guest.guestCount > 1 ? 's' : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[guest.status]}`}>
                            {statusIcons[guest.status]}
                            {statusLabels[guest.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {guest.idVerified ? (
                              <div className="flex items-center text-green-600 text-xs font-semibold">
                                <CheckCircle size={14} className="mr-1" />
                                ID
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400 text-xs font-semibold">
                                <AlertCircle size={14} className="mr-1" />
                                ID
                              </div>
                            )}
                            {guest.keyIssued ? (
                              <div className="flex items-center text-green-600 text-xs font-semibold">
                                <CheckCircle size={14} className="mr-1" />
                                Key
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-400 text-xs font-semibold">
                                <AlertCircle size={14} className="mr-1" />
                                Key
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(guest)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            View
                          </button>
                          {guest.status === 'pending' && (
                            <button
                              onClick={() => handleCompleteCheckin(guest)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Check In
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No guests found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex flex-col items-center justify-center px-4 py-4 bg-white border-t">
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
        </div>
      </main>

      {/* Manual Check-In Modal */}
      {showManualCheckin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Manual Check-In</h2>
                  <p className="text-gray-500">
                    {manualCheckinStep === 'search' && 'Search for booking'}
                    {manualCheckinStep === 'verify' && 'Verify guest information'}
                    {manualCheckinStep === 'complete' && 'Complete check-in'}
                  </p>
                </div>
                <button
                  onClick={closeManualCheckin}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8 flex items-center justify-between">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${manualCheckinStep === 'search' || manualCheckinStep === 'verify' || manualCheckinStep === 'complete' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <span className="font-semibold">1</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${manualCheckinStep === 'verify' || manualCheckinStep === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${manualCheckinStep === 'verify' || manualCheckinStep === 'complete' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <span className="font-semibold">2</span>
                </div>
                <div className={`flex-1 h-1 mx-2 ${manualCheckinStep === 'complete' ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${manualCheckinStep === 'complete' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <span className="font-semibold">3</span>
                </div>
              </div>

              {/* Step 1: Search */}
              {manualCheckinStep === 'search' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Booking ID</label>
                    <input
                      type="text"
                      placeholder="Enter booking ID (e.g., BK-1001)"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={manualFormData.bookingId}
                      onChange={(e) => setManualFormData({...manualFormData, bookingId: e.target.value})}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Or search by guest name or email</p>
                </div>
              )}

              {/* Step 2: Verify */}
              {manualCheckinStep === 'verify' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name</label>
                      <input
                        type="text"
                        placeholder="Guest name"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={manualFormData.guestName}
                        onChange={(e) => setManualFormData({...manualFormData, guestName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        placeholder="Guest email"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={manualFormData.guestEmail}
                        onChange={(e) => setManualFormData({...manualFormData, guestEmail: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        placeholder="Guest phone"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={manualFormData.guestPhone}
                        onChange={(e) => setManualFormData({...manualFormData, guestPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                      <input
                        type="text"
                        placeholder="Room number"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={manualFormData.roomNumber}
                        onChange={(e) => setManualFormData({...manualFormData, roomNumber: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-gray-900">Verification Checklist</h3>
                    
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualFormData.idVerified}
                        onChange={(e) => setManualFormData({...manualFormData, idVerified: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">ID Verified</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualFormData.keyIssued}
                        onChange={(e) => setManualFormData({...manualFormData, keyIssued: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center">
                        <Key size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Key Issued</span>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={manualFormData.documentsSigned}
                        onChange={(e) => setManualFormData({...manualFormData, documentsSigned: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex items-center">
                        <FileText size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Documents Signed</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Complete */}
              {manualCheckinStep === 'complete' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-900">Check-In Summary</h3>
                        <div className="mt-2 space-y-1 text-sm text-green-800">
                          <p><span className="font-medium">Guest:</span> {manualFormData.guestName}</p>
                          <p><span className="font-medium">Room:</span> {manualFormData.roomNumber}</p>
                          <p><span className="font-medium">Email:</span> {manualFormData.guestEmail}</p>
                          <p><span className="font-medium">Phone:</span> {manualFormData.guestPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Verification Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800">ID Verified</span>
                        {manualFormData.idVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800">Key Issued</span>
                        {manualFormData.keyIssued ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800">Documents Signed</span>
                        {manualFormData.documentsSigned ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                    <textarea
                      placeholder="Any special notes or requests..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      value={manualFormData.notes}
                      onChange={(e) => setManualFormData({...manualFormData, notes: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={closeManualCheckin}
                >
                  Cancel
                </button>

                {manualCheckinStep === 'search' && (
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSearchBooking}
                    disabled={!manualFormData.bookingId.trim()}
                  >
                    Search Booking
                  </button>
                )}

                {manualCheckinStep === 'verify' && (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setManualCheckinStep('search')}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setManualCheckinStep('complete')}
                    >
                      Continue
                    </button>
                  </>
                )}

                {manualCheckinStep === 'complete' && (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setManualCheckinStep('verify')}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      onClick={handleCompleteManualCheckin}
                    >
                      Complete Check-In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Details Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedGuest.guestName}</h2>
                  <p className="text-gray-500">Booking ID: {selectedGuest.bookingId}</p>
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
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium flex items-center">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {selectedGuest.guestEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium flex items-center">
                        <Phone size={16} className="mr-2 text-gray-400" />
                        {selectedGuest.guestPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Number of Guests</p>
                      <p className="font-medium flex items-center">
                        <Users size={16} className="mr-2 text-gray-400" />
                        {selectedGuest.guestCount}
                      </p>
                    </div>
                    {selectedGuest.specialRequests && (
                      <div>
                        <p className="text-sm text-gray-500">Special Requests</p>
                        <p className="font-medium">{selectedGuest.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Room & Stay Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        {selectedGuest.roomNumber} - {selectedGuest.roomType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-In Date</p>
                      <p className="font-medium flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {new Date(selectedGuest.checkInDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-Out Date</p>
                      <p className="font-medium flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {new Date(selectedGuest.checkOutDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="font-medium flex items-center text-indigo-600">
                        <DollarSign size={16} className="mr-2" />
                        ${selectedGuest.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Check-In Verification</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      <span className="text-sm font-medium">ID Verified</span>
                    </div>
                    {selectedGuest.idVerified ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Key size={16} className="mr-2 text-gray-400" />
                      <span className="text-sm font-medium">Key Issued</span>
                    </div>
                    {selectedGuest.keyIssued ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      <span className="text-sm font-medium">Documents Signed</span>
                    </div>
                    {selectedGuest.documentsSigned ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {selectedGuest.notes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Notes:</span> {selectedGuest.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={closeModal}
                >
                  Close
                </button>
                {selectedGuest.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      onClick={() => handleMarkNoShow(selectedGuest)}
                    >
                      Mark No Show
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleCompleteCheckin(selectedGuest)}
                    >
                      Complete Check-In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
