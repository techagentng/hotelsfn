import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Search, Filter, X, Plus, Wifi, Users, DollarSign, AlertCircle, CheckCircle, Home, Save, Bed } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useGetRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, type Room as APIRoom, type CreateRoomData } from '../hooks/useRooms';
import { toast } from 'react-hot-toast';

type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning';

const statusStyles: Record<RoomStatus, string> = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-red-100 text-red-800',
  cleaning: 'bg-yellow-100 text-yellow-800',
};

const statusIcons: Record<RoomStatus, React.ReactNode> = {
  available: <CheckCircle className="w-4 h-4 mr-1" />,
  occupied: <AlertCircle className="w-4 h-4 mr-1" />,
  maintenance: <AlertCircle className="w-4 h-4 mr-1" />,
  cleaning: <AlertCircle className="w-4 h-4 mr-1" />,
};

const statusLabels: Record<RoomStatus, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
};


export default function Rooms() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RoomStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [pageIndex, setPageIndex] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<APIRoom | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<APIRoom | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 9;

  // Fetch rooms from backend
  const { data: roomsData, isLoading, error } = useGetRooms({
    page: pageIndex,
    page_size: itemsPerPage,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom(editingRoom?.id || 0);
  const deleteRoom = useDeleteRoom();

  const [roomForm, setRoomForm] = useState<CreateRoomData>({
    room_number: '',
    room_type: 'Standard',
    floor: 1,
    max_occupancy: 2,
    price_per_night: 100,
    bed_type: 'Queen',
    description: '',
  });

  // Extract rooms and metadata from API response
  const rooms = roomsData?.data?.data || [];
  const meta = roomsData?.data?.meta;
  const pageCount = meta?.total_pages || 1;

  // Client-side filtering for search and type
  const filteredRooms = rooms.filter((room: APIRoom) => {
    const matchesSearch =
      room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleViewDetails = (room: APIRoom) => {
    setSelectedRoom(room);
  };

  const closeModal = () => {
    setSelectedRoom(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPageIndex(1);
  };

  const roomTypes = ['Standard', 'Deluxe', 'Suite'];
  const availableCount = rooms.filter((r: APIRoom) => r.status === 'available').length;
  const occupiedCount = rooms.filter((r: APIRoom) => r.status === 'occupied').length;
  const maintenanceCount = rooms.filter((r: APIRoom) => r.status === 'maintenance').length;
  const totalRooms = meta?.total || rooms.length;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Rooms</h1>
              <p className="text-gray-500">Manage all your hotel rooms</p>
            </div>
            <button
              onClick={() => {
                setEditingRoom(null);
                setRoomForm({
                  room_number: '',
                  room_type: 'Standard',
                  floor: 1,
                  max_occupancy: 2,
                  price_per_night: 100,
                  bed_type: 'Queen',
                  description: '',
                });
                setShowCreateModal(true);
              }}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <Plus size={18} className="mr-2" />
              <span>+ New Room</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Rooms</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRooms}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available</p>
                  <p className="text-3xl font-bold text-green-600">{availableCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Occupied</p>
                  <p className="text-3xl font-bold text-blue-600">{occupiedCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Maintenance</p>
                  <p className="text-3xl font-bold text-red-600">{maintenanceCount}</p>
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
                  placeholder="Search rooms..."
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

                {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as RoomStatus | 'all')}
                    >
                      <option value="all">All Statuses</option>
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                <p className="text-red-500">Failed to load rooms</p>
              </div>
            ) : filteredRooms.length > 0 ? (
              filteredRooms.map((room: APIRoom) => (
                <div key={room.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-32 flex items-center justify-center">
                    <Home className="w-16 h-16 text-white opacity-80" />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Room {room.room_number}</h3>
                        <p className="text-sm text-gray-500">{room.room_type}</p>
                      </div>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[room.status as RoomStatus]}`}>
                        {statusIcons[room.status as RoomStatus]}
                        {statusLabels[room.status as RoomStatus]}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Users size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm">Capacity: {room.capacity} guests</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm">${room.price_per_night}/night</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Bed size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm">{room.bed_type} Bed • Floor {room.floor}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Description</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{room.description || 'No description available'}</p>
                    </div>

                    <button
                      onClick={() => handleViewDetails(room)}
                      className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No rooms found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col items-center justify-center px-4 py-4 bg-white rounded-xl shadow border-t">
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
                Page {pageIndex} of {pageCount} • Total: {meta?.total || 0} rooms
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Room {selectedRoom.room_number}</h2>
                  <p className="text-gray-500">{selectedRoom.room_type} • Floor {selectedRoom.floor}</p>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Room Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Room Number</p>
                      <p className="font-medium">{selectedRoom.room_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">{selectedRoom.room_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-medium">{selectedRoom.capacity} guests</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price per Night</p>
                      <p className="font-medium text-indigo-600">${selectedRoom.price_per_night}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bed Type</p>
                      <p className="font-medium">{selectedRoom.bed_type}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Maintenance</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[selectedRoom.status as RoomStatus]}`}>
                        {statusIcons[selectedRoom.status as RoomStatus]}
                        {statusLabels[selectedRoom.status as RoomStatus]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{new Date(selectedRoom.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{new Date(selectedRoom.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700">{selectedRoom.description || 'No description available'}</p>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingRoom(selectedRoom);
                    setRoomForm({
                      room_number: selectedRoom.room_number,
                      room_type: selectedRoom.room_type,
                      floor: selectedRoom.floor,
                      max_occupancy: selectedRoom.capacity,
                      price_per_night: selectedRoom.price_per_night,
                      bed_type: selectedRoom.bed_type,
                      description: selectedRoom.description,
                    });
                    setShowCreateModal(true);
                    setSelectedRoom(null);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingRoom ? 'Edit Room' : 'Create New Room'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (editingRoom) {
                    await updateRoom.mutateAsync(roomForm);
                    toast.success('Room updated successfully!');
                  } else {
                    await createRoom.mutateAsync(roomForm);
                    toast.success('Room created successfully!');
                  }
                  setShowCreateModal(false);
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to save room');
                }
              }}
              className="p-6 space-y-6"
            >
              {/* Room Number & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="room_number"
                    required
                    value={roomForm.room_number}
                    onChange={(e) => setRoomForm({ ...roomForm, room_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="e.g., 101"
                  />
                </div>

                <div>
                  <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="room_type"
                    required
                    value={roomForm.room_type}
                    onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential">Presidential</option>
                  </select>
                </div>
              </div>

              {/* Floor & Occupancy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="floor"
                    required
                    min="1"
                    max="50"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="max_occupancy" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    Max Occupancy <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    id="max_occupancy"
                    required
                    min="1"
                    max="10"
                    value={roomForm.max_occupancy}
                    onChange={(e) => setRoomForm({ ...roomForm, max_occupancy: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Price & Bed Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="mr-1 h-4 w-4" />
                    Price Per Night <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    id="price_per_night"
                    required
                    min="0"
                    step="0.01"
                    value={roomForm.price_per_night}
                    onChange={(e) => setRoomForm({ ...roomForm, price_per_night: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                    placeholder="100.00"
                  />
                </div>

                <div>
                  <label htmlFor="bed_type" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Bed className="mr-1 h-4 w-4" />
                    Bed Type <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="bed_type"
                    required
                    value={roomForm.bed_type}
                    onChange={(e) => setRoomForm({ ...roomForm, bed_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Single">Single</option>
                    <option value="Twin">Twin</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                    <option value="Double">Double</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  required
                  rows={4}
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Enter room description, amenities, and features..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  disabled={createRoom.isPending || updateRoom.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  disabled={createRoom.isPending || updateRoom.isPending}
                >
                  {createRoom.isPending || updateRoom.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingRoom ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingRoom ? 'Update Room' : 'Create Room'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
