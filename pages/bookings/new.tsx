import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Calendar as CalendarIcon, User, Users, Home, X, Loader2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const roomTypes = [
  { id: 'standard', name: 'Standard', price: 100 },
  { id: 'deluxe', name: 'Deluxe', price: 150 },
  { id: 'suite', name: 'Suite', price: 250 },
];

export default function NewBooking() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Array<{ id: string; number: string; type: string }>>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  const getDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    roomType: '',
    roomId: '',
    checkIn: getDateString(new Date()),
    checkOut: getDateString(tomorrow),
    guestCount: 1,
    specialRequests: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check room availability when dates or room type changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.roomType || !formData.checkIn || !formData.checkOut) return;
      
      setCheckingAvailability(true);
      try {
        const response = await fetch('/api/rooms/availability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomType: formData.roomType,
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
          }),
        });
        
        if (!response.ok) throw new Error('Failed to check availability');
        
        const data = await response.json();
        setAvailableRooms(data.availableRooms || []);
        
        // Auto-select first available room if none selected
        if (data.availableRooms?.length > 0 && !formData.roomId) {
          setFormData(prev => ({ ...prev, roomId: data.availableRooms[0].id }));
        }
      } catch (err) {
        console.error('Error checking availability:', err);
        setError('Failed to check room availability');
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timer = setTimeout(() => {
      checkAvailability();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [formData.roomType, formData.checkIn, formData.checkOut]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.guestName.trim()) errors.guestName = 'Guest name is required';
    if (!formData.guestEmail.trim()) {
      errors.guestEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      errors.guestEmail = 'Please enter a valid email';
    }
    if (!formData.roomType) errors.roomType = 'Room type is required';
    if (!formData.roomId) errors.roomId = 'Please select a room';
    if (!formData.checkIn) errors.checkIn = 'Check-in date is required';
    if (!formData.checkOut) errors.checkOut = 'Check-out date is required';
    if (formData.checkIn && formData.checkOut && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      errors.checkOut = 'Check-out date must be after check-in date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      // Redirect to bookings list with success message
      router.push({
        pathname: '/bookings',
        query: { success: 'Booking created successfully' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating booking');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guestCount' ? Math.max(1, parseInt(value) || 1) : value,
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const calculateTotal = () => {
    if (!formData.roomType || !formData.checkIn || !formData.checkOut) return 0;
    
    const room = roomTypes.find(r => r.id === formData.roomType);
    if (!room) return 0;
    
    const nights = Math.ceil(
      (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return room.price * nights;
  };

  const total = calculateTotal();

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">New Booking</h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 space-y-8">
              {/* Guest Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-indigo-600" />
                  Guest Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      name="guestName"
                      required
                      value={formData.guestName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.guestName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                    {formErrors.guestName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.guestName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="guestEmail"
                      name="guestEmail"
                      required
                      value={formData.guestEmail}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.guestEmail ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    />
                    {formErrors.guestEmail && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.guestEmail}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="guestPhone"
                      name="guestPhone"
                      value={formData.guestPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Users className="mr-1 h-4 w-4" />
                      Number of Guests <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      id="guestCount"
                      name="guestCount"
                      min="1"
                      max="10"
                      required
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Home className="mr-2 h-5 w-5 text-indigo-600" />
                  Booking Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="roomType"
                      name="roomType"
                      required
                      value={formData.roomType}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.roomType ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    >
                      <option value="">Select a room type</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} (${type.price}/night)
                        </option>
                      ))}
                    </select>
                    {formErrors.roomType && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.roomType}</p>
                    )}
                  </div>

                  {formData.roomType && (
                    <div>
                      <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Room <span className="text-red-500">*</span>
                      </label>
                      {checkingAvailability ? (
                        <div className="flex items-center text-sm text-gray-500">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking availability...
                        </div>
                      ) : availableRooms.length > 0 ? (
                        <select
                          id="roomId"
                          name="roomId"
                          required
                          value={formData.roomId}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 border ${
                            formErrors.roomId ? 'border-red-300' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        >
                          <option value="">Select a room</option>
                          {availableRooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.number} - {room.type}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-red-600">
                          No rooms available for the selected dates. Please try different dates.
                        </div>
                      )}
                      {formErrors.roomId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.roomId}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        Check-in <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        id="checkIn"
                        name="checkIn"
                        required
                        value={formData.checkIn}
                        min={getDateString(new Date())}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${
                          formErrors.checkIn ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      />
                      {formErrors.checkIn && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.checkIn}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        Check-out <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        id="checkOut"
                        name="checkOut"
                        required
                        value={formData.checkOut}
                        min={formData.checkIn || getDateString(new Date())}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border ${
                          formErrors.checkOut ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                      />
                      {formErrors.checkOut && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.checkOut}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nights</p>
                        <p className="text-lg font-semibold">
                          {formData.checkIn && formData.checkOut
                            ? Math.ceil(
                                (new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Total</p>
                        <p className="text-lg font-semibold">${total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  rows={3}
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Any special requests or additional information..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/bookings')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading || checkingAvailability}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
