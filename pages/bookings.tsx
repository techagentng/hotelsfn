import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Search, Filter, X, Calendar, User, Home, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useGetReservations, useUpdateReservationStatus, useCancelReservation } from '../hooks/useReservations';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

// Consistent date formatting to avoid hydration errors
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out';

interface Booking {
  id: string;
  reservationId?: number;
  guestName: string;
  guestEmail: string;
  room: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  total: number;
  guestCount: number;
  specialRequests?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  'checked-in': 'bg-blue-100 text-blue-800',
  'checked-out': 'bg-gray-100 text-gray-800',
};

const statusIcons: Record<BookingStatus, React.ReactNode> = {
  confirmed: <CheckCircle className="w-4 h-4 mr-1" />,
  pending: <Clock className="w-4 h-4 mr-1" />,
  cancelled: <XCircle className="w-4 h-4 mr-1" />,
  'checked-in': <CheckCircle className="w-4 h-4 mr-1" />,
  'checked-out': <CheckCircle className="w-4 h-4 mr-1" />,
};

const statusLabels: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
};

const mockBookings: Booking[] = [
  {
    id: 'BK-1001',
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    room: 'Deluxe 201',
    roomType: 'Deluxe',
    checkIn: '2024-12-15',
    checkOut: '2024-12-20',
    status: 'confirmed',
    total: 1200,
    guestCount: 2,
    specialRequests: 'Early check-in requested',
  },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `BK-${1002 + i}`,
    guestName: `Guest ${i + 1}`,
    guestEmail: `guest${i + 1}@example.com`,
    room: `Room ${200 + i}`,
    roomType: i % 3 === 0 ? 'Deluxe' : i % 2 === 0 ? 'Suite' : 'Standard',
    checkIn: `2024-12-${15 + (i % 5)}`,
    checkOut: `2024-12-${18 + (i % 5)}`,
    status: ['confirmed', 'pending', 'cancelled'][i % 3] as BookingStatus,
    total: 800 + (i * 100),
    guestCount: (i % 3) + 1,
    specialRequests: i % 2 === 0 ? 'Late check-out requested' : '',
  })),
];

export default function Bookings() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [pageIndex, setPageIndex] = useState(1);
  const itemsPerPage = 10;

  // Fetch reservations from backend
  const { data: reservationsData, isLoading } = useGetReservations({
    page: pageIndex,
    page_size: itemsPerPage,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Mutation hooks
  const updateStatus = useUpdateReservationStatus();
  const cancelReservation = useCancelReservation();

  // Extract reservations from API response
  const apiReservations = reservationsData?.data?.data || [];
  
  // Map API data to Booking interface (keep reservation ID for mutations)
  const bookings: Booking[] = apiReservations.map((res: any) => ({
    id: res.confirmation_number || `BK-${res.id}`,
    reservationId: res.id, // Keep the numeric ID for API calls
    guestName: res.guest_name || 'Unknown Guest',
    guestEmail: res.guest_email || '',
    room: res.room_number || 'N/A',
    roomType: res.room_type || 'Standard',
    checkIn: res.check_in_date,
    checkOut: res.check_out_date,
    status: res.status as BookingStatus,
    total: res.total_amount || 0,
    guestCount: res.number_of_guests || 1,
    specialRequests: res.special_requests || '',
  }));

  const calculateNights = (checkIn: string, checkOut: string) => {
    return Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDateRange = 
      (!dateRange.start || booking.checkIn >= dateRange.start) &&
      (!dateRange.end || booking.checkOut <= dateRange.end);
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Use backend pagination
  const meta = reservationsData?.data?.meta;
  const pageCount = meta?.total_pages || 1;
  const paginatedBookings = filteredBookings;

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setPageIndex(1);
  };

  const handleConfirmBooking = async () => {
    if (!selectedBooking?.reservationId) return;
    
    try {
      await updateStatus.mutateAsync({
        id: selectedBooking.reservationId,
        status: 'confirmed'
      });
      toast.success('Booking confirmed successfully');
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to confirm booking');
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking?.reservationId) return;
    
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    
    try {
      await cancelReservation.mutateAsync({
        id: selectedBooking.reservationId,
        cancellation_reason: reason,
        refund_amount: 0
      });
      toast.success('Booking cancelled successfully');
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel booking');
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
              <h1 className="text-2xl font-bold">Bookings</h1>
              <p className="text-gray-500">Manage all your hotel bookings in one place</p>
            </div>
            <button 
              onClick={() => router.push('/bookings/new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span>+ New Booking</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search bookings..."
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
                
                {(searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end) && (
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'all')}
                    >
                      <option value="all">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in After</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Before</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                              <div className="text-sm text-gray-500">{booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.room}</div>
                          <div className="text-sm text-gray-500">{booking.roomType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {calculateNights(booking.checkIn, booking.checkOut)} nights
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${booking.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[booking.status]}`}>
                            {statusIcons[booking.status]}
                            {statusLabels[booking.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No bookings found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-center px-4 py-4 bg-white border-t">
              <div className="flex gap-2">
                <button
                  onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
                  disabled={pageIndex === 1}
                  className="w-10 h-10 rounded-full border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  &lt;
                </button>

                {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPageIndex(page)}
                    className={`w-10 h-10 rounded-full text-sm ${
                      page === pageIndex
                        ? 'bg-gray-200 text-black'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setPageIndex(prev => Math.min(pageCount, prev + 1))}
                  disabled={pageIndex === pageCount}
                  className="w-10 h-10 rounded-full border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Page {pageIndex} of {pageCount}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Booking Details</h2>
                  <p className="text-gray-500">{selectedBooking.id}</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Guest Name</p>
                      <p className="font-medium">{selectedBooking.guestName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guest Email</p>
                      <p className="font-medium">{selectedBooking.guestEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-medium">{selectedBooking.guestCount} {selectedBooking.guestCount > 1 ? 'guests' : 'guest'}</p>
                    </div>
                    {selectedBooking.specialRequests && (
                      <div>
                        <p className="text-sm text-gray-500">Special Requests</p>
                        <p className="font-medium">{selectedBooking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Room</p>
                      <p className="font-medium">{selectedBooking.room} - {selectedBooking.roomType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Stay</p>
                      <p className="font-medium">
                        {calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)} nights • ${selectedBooking.total.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[selectedBooking.status]}`}>
                        {statusIcons[selectedBooking.status]}
                        {statusLabels[selectedBooking.status]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="mt-6 border-t pt-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="mb-2 p-4 bg-white inline-block rounded-lg shadow-sm">
                      <QRCodeSVG
                        value={JSON.stringify({
                          bookingId: selectedBooking.id,
                          guestName: selectedBooking.guestName,
                          room: selectedBooking.room,
                          checkIn: selectedBooking.checkIn,
                          checkOut: selectedBooking.checkOut,
                          total: selectedBooking.total
                        })}
                        size={150}
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-2">{selectedBooking.id}</p>
                    <p className="text-xs text-gray-400 mt-1">Scan for booking details</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    // Generate receipt content
                    const receiptContent = `
===========================================
           HOTEL BOOKING RECEIPT
===========================================

Booking ID: ${selectedBooking.id}
Date: ${new Date().toLocaleDateString()}

-------------------------------------------
GUEST INFORMATION
-------------------------------------------
Name: ${selectedBooking.guestName}
Email: ${selectedBooking.guestEmail}
Guests: ${selectedBooking.guestCount}

-------------------------------------------
BOOKING DETAILS
-------------------------------------------
Room: ${selectedBooking.room} - ${selectedBooking.roomType}
Check-in: ${new Date(selectedBooking.checkIn).toLocaleDateString()}
Check-out: ${new Date(selectedBooking.checkOut).toLocaleDateString()}
Nights: ${calculateNights(selectedBooking.checkIn, selectedBooking.checkOut)}
Status: ${statusLabels[selectedBooking.status]}

${selectedBooking.specialRequests ? `Special Requests: ${selectedBooking.specialRequests}\n` : ''}
-------------------------------------------
TOTAL AMOUNT: $${selectedBooking.total.toFixed(2)}
-------------------------------------------

Thank you for choosing our hotel!

===========================================
                    `.trim();

                    // Create blob and download
                    const blob = new Blob([receiptContent], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `receipt-${selectedBooking.id}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    toast.success('Receipt downloaded!');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50"
                >
                  <Download size={16} className="mr-2" />
                  Download Receipt
                </button>
                
                <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={handleRejectBooking}
                      disabled={cancelReservation.isPending}
                      className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancelReservation.isPending ? 'Cancelling...' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBooking}
                      disabled={updateStatus.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {updateStatus.isPending ? 'Confirming...' : 'Confirm'}
                    </button>
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
