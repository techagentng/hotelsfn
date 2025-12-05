import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Calendar as CalendarIcon, User, Users, Home, X, Loader2, Search, Upload, FileText, Eye, Camera } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useGetGuests } from '../../hooks/useGuests';
import axios from '../../lib/axios';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { incrementScore } from '../../store';

const roomTypes = [
  { id: 'standard', name: 'Standard', price: 100 },
  { id: 'deluxe', name: 'Deluxe', price: 150 },
  { id: 'suite', name: 'Suite', price: 250 },
];

export default function NewBooking() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const scoreCount = useAppSelector((state) => state.score.count);
  
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
    guestId: '',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestIdType: 'Passport',
    guestIdNumber: '',
    roomType: '',
    roomId: '',
    checkIn: getDateString(new Date()),
    checkOut: getDateString(tomorrow),
    guestCount: 1,
    specialRequests: '',
  });

  // ID Document upload state
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  
  // Facial verification state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Face match state for special files
  const [isFakeUploading, setIsFakeUploading] = useState(false);
  const [fakeUploadProgress, setFakeUploadProgress] = useState(0);
  const [showFaceMatchScore, setShowFaceMatchScore] = useState(false);
  const [isFlaggedFile, setIsFlaggedFile] = useState(false); // _obs files
  const [isVerifiedFile, setIsVerifiedFile] = useState(false); // _cta files
  const [faceMatchScore, setFaceMatchScore] = useState(0);
  const [isMatchingFace, setIsMatchingFace] = useState(false);

  const [guestSearch, setGuestSearch] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const { data: guestsData } = useGetGuests({ search: guestSearch, page_size: 10 });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle ID document upload
  const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIdDocument(file);
    setError(null);
    setVerificationComplete(false);

    // Check if filename ends with _obs or _cta
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const isObsFile = fileNameWithoutExt.endsWith('_obs');
    const isCtaFile = fileNameWithoutExt.endsWith('_cta');
    console.log('Uploaded file:', file.name);
    console.log('Ends with _obs?', isObsFile, 'Ends with _cta?', isCtaFile);
    
    // Reset states
    setIsFlaggedFile(false);
    setIsVerifiedFile(false);
    setShowFaceMatchScore(false);
    setFaceMatchScore(0);
    
    if (isObsFile) {
      // _obs files: fake upload, 15% face match
      dispatch(incrementScore(file.name));
      setIsFlaggedFile(true);
      console.log('🚨 Flagged file detected! Incrementing score...');
      
      // Start fake upload simulation (don't actually upload)
      simulateFakeUpload();
    } else if (isCtaFile) {
      // _cta files: real upload, 100% face match
      setIsVerifiedFile(true);
      console.log('✅ Verified file detected (_cta)');
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDocumentPreview(reader.result as string);
        // Start AI verification simulation
        simulateAIVerification();
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, just show file info
      setIdDocumentPreview(null);
      // Start AI verification simulation
      simulateAIVerification();
    }
  };

  // Simulate AI verification process
  const simulateAIVerification = () => {
    setIsVerifying(true);
    setVerificationComplete(false);
    
    // Simulate AI processing (3 seconds)
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
    }, 3000);
  };

  // Simulate fake upload for _obs files
  const simulateFakeUpload = () => {
    setIsFakeUploading(true);
    setFakeUploadProgress(0);
    setShowFaceMatchScore(false);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFakeUploadProgress(100);
        setIsFakeUploading(false);
        
        // Show face match score after "upload" completes (only if facial photo exists)
        if (facialPhoto) {
          simulateFaceMatching(15); // 15% for _obs files
        }
      } else {
        setFakeUploadProgress(Math.min(progress, 99));
      }
    }, 200);
  };

  // Simulate face matching process with timeout
  const simulateFaceMatching = (targetScore: number) => {
    setIsMatchingFace(true);
    setShowFaceMatchScore(false);
    setFaceMatchScore(0);
    
    // Simulate face matching (2 seconds)
    setTimeout(() => {
      setIsMatchingFace(false);
      setFaceMatchScore(targetScore);
      setShowFaceMatchScore(true);
    }, 2000);
  };

  // Remove uploaded document
  const handleRemoveDocument = () => {
    setIdDocument(null);
    setIdDocumentPreview(null);
    setIsVerifying(false);
    setVerificationComplete(false);
    setIsFlaggedFile(false);
    setIsVerifiedFile(false);
    setShowFaceMatchScore(false);
    setFakeUploadProgress(0);
    setFaceMatchScore(0);
    setIsMatchingFace(false);
  };

  // Handle facial verification camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      
      // Set video element source after a small delay to ensure element is rendered
      setTimeout(() => {
        const videoElement = document.getElementById('cameraVideo') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = mediaStream;
          videoElement.play().catch(err => console.error('Error playing video:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById('cameraVideo') as HTMLVideoElement;
    if (!videoElement) {
      console.error('Video element not found');
      return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Photo captured, data length:', photoData.length);
      setFacialPhoto(photoData);
      stopCamera();
      
      // Trigger face matching based on file type
      if (isFlaggedFile && idDocument) {
        // _obs file: 15% match score
        simulateFaceMatching(15);
      } else if (isVerifiedFile && idDocument) {
        // _cta file: 100% match score
        simulateFaceMatching(100);
      }
    } else {
      console.error('Could not get canvas context');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const removeFacialPhoto = () => {
    setFacialPhoto(null);
    setShowFaceMatchScore(false);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle guest selection
  const handleGuestSelect = (guest: any) => {
    setFormData(prev => ({
      ...prev,
      guestId: guest.id.toString(),
      guestName: guest.name,
      guestEmail: guest.email,
      guestPhone: guest.phone || '',
      guestIdType: guest.id_type || 'Passport',
      guestIdNumber: guest.id_number || '',
    }));
    setGuestSearch(guest.name);
    setShowGuestDropdown(false);
  };

  // Clear guest selection
  const handleClearGuest = () => {
    setFormData(prev => ({
      ...prev,
      guestId: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      guestIdType: 'Passport',
      guestIdNumber: '',
    }));
    setGuestSearch('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#guestSearch') && !target.closest('.guest-dropdown')) {
        setShowGuestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check room availability when dates or room type changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!formData.roomType || !formData.checkIn || !formData.checkOut) return;
      
      setCheckingAvailability(true);
      setError(null);
      try {
        // Call backend API directly
        const { data } = await axios.post('/rooms/availability', {
          room_type: formData.roomType,
          check_in_date: formData.checkIn,
          check_out_date: formData.checkOut,
        });
        
        // Transform backend response
        const rooms = (data.data || []).map((room: any) => ({
          id: room.id.toString(),
          number: room.room_number,
          type: room.room_type,
        }));
        
        setAvailableRooms(rooms);
        
        // Auto-select first available room if none selected
        if (rooms.length > 0 && !formData.roomId) {
          setFormData(prev => ({ ...prev, roomId: rooms[0].id }));
        }
      } catch (err: any) {
        console.error('Error checking availability:', err);
        setError(err.response?.data?.error || 'Failed to check room availability');
        setAvailableRooms([]);
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
      console.log('Submitting form with idDocument:', idDocument ? 'YES' : 'NO');
      
      // Always use FormData for consistency with backend
      const formDataToSend = new FormData();
      
      // Guest information - either existing guest ID or new guest details
      if (formData.guestId) {
        // Existing guest
        formDataToSend.append('guest_id', formData.guestId);
        console.log('Using existing guest ID:', formData.guestId);
      } else {
        // New guest - send guest details
        formDataToSend.append('guest_name', formData.guestName);
        formDataToSend.append('guest_email', formData.guestEmail);
        formDataToSend.append('guest_phone', formData.guestPhone);
        formDataToSend.append('guest_id_type', formData.guestIdType.toLowerCase()); // passport, drivers_license, etc.
        formDataToSend.append('guest_id_number', formData.guestIdNumber);
        console.log('Creating new guest:', formData.guestName);
      }
      
      // Reservation fields
      formDataToSend.append('room_id', formData.roomId);
      formDataToSend.append('check_in_date', formData.checkIn);
      formDataToSend.append('check_out_date', formData.checkOut);
      formDataToSend.append('number_of_guests', formData.guestCount.toString());
      formDataToSend.append('payment_method', 'credit_card');
      
      if (formData.specialRequests) {
        formDataToSend.append('special_requests', formData.specialRequests);
      }
      
      // Add ID document if uploaded
      if (idDocument) {
        formDataToSend.append('id_document', idDocument);
        console.log('File attached to FormData');
      }
      
      console.log('Sending FormData to backend...');
      // Let axios automatically set Content-Type with proper boundary
      const response = await axios.post('/reservations', formDataToSend);
      
      // Redirect to bookings list with success message
      router.push({
        pathname: '/bookings',
        query: { success: 'Booking created successfully' },
      });
    } catch (err: any) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      setError(err.response?.data?.error || err.response?.data?.errors || err.message || 'Error creating booking');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const roomType = roomTypes.find(rt => rt.id === formData.roomType);
    return nights * (roomType?.price || 0);
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
                  {/* Guest Selection */}
                  <div className="md:col-span-2">
                    <label htmlFor="guestSearch" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Existing Guest (Optional)
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          id="guestSearch"
                          placeholder="Search by name or email..."
                          value={guestSearch}
                          onChange={(e) => {
                            setGuestSearch(e.target.value);
                            setShowGuestDropdown(true);
                          }}
                          onFocus={() => setShowGuestDropdown(true)}
                          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                        />
                        {formData.guestId && (
                          <button
                            type="button"
                            onClick={handleClearGuest}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      
                      {/* Guest Dropdown */}
                      {showGuestDropdown && guestSearch && guestsData?.data && guestsData.data.length > 0 && (
                        <div className="guest-dropdown absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {guestsData.data.map((guest: any) => (
                            <button
                              key={guest.id}
                              type="button"
                              onClick={() => handleGuestSelect(guest)}
                              className="w-full px-4 py-3 text-left hover:bg-indigo-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{guest.name}</div>
                              <div className="text-sm text-gray-500">{guest.email}</div>
                              {guest.phone && (
                                <div className="text-sm text-gray-400">{guest.phone}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {formData.guestId && (
                      <p className="mt-1 text-sm text-green-600 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Guest selected (ID: {formData.guestId})
                      </p>
                    )}
                  </div>

                  {/* Guest Name */}
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
                      disabled={!!formData.guestId}
                      className={`w-full px-4 py-2 border ${
                        formErrors.guestName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                        formData.guestId ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''
                      }`}
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
                      disabled={!!formData.guestId}
                      className={`w-full px-4 py-2 border ${
                        formErrors.guestEmail ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                        formData.guestId ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''
                      }`}
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
                      disabled={!!formData.guestId}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                        formData.guestId ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''
                      }`}
                    />
                  </div>

                  {/* ID Type */}
                  <div>
                    <label htmlFor="guestIdType" className="block text-sm font-medium text-gray-700 mb-1">
                      ID Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="guestIdType"
                      name="guestIdType"
                      required
                      value={formData.guestIdType}
                      onChange={handleInputChange}
                      disabled={!!formData.guestId}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                        formData.guestId ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''
                      }`}
                    >
                      <option value="Passport">Passport</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="National ID">National ID</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label htmlFor="guestIdNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      ID Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="guestIdNumber"
                      name="guestIdNumber"
                      required
                      value={formData.guestIdNumber}
                      onChange={handleInputChange}
                      disabled={!!formData.guestId}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 ${
                        formData.guestId ? 'bg-gray-50 cursor-not-allowed text-gray-600' : ''
                      }`}
                      placeholder="Enter ID number"
                    />
                  </div>

                  {/* ID Document Upload & Facial Verification - Side by Side */}
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID Document Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FileText className="inline mr-1 h-4 w-4" />
                        Upload ID Document
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload a copy of the guest's ID
                      </p>
                    
                    {!idDocument ? (
                      <div className="relative">
                        <input
                          type="file"
                          id="idDocument"
                          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                          onChange={handleIdDocumentUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="idDocument"
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <Upload className="mr-2 h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload or drag and drop
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPEG, PNG, WebP, PDF (Max 5MB)
                        </p>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {idDocumentPreview ? (
                              <div className="relative group">
                                <img
                                  src={idDocumentPreview}
                                  alt="ID Document Preview"
                                  className="w-24 h-24 object-cover rounded border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => window.open(idDocumentPreview, '_blank')}
                                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded transition-all"
                                >
                                  <Eye className="text-white opacity-0 group-hover:opacity-100 h-6 w-6" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {idDocument.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(idDocument.size / 1024).toFixed(2)} KB
                              </p>
                              <p className="text-xs text-gray-500">
                                {idDocument.type}
                              </p>
                              
                              {/* AI Verification Status */}
                              {isVerifying && (
                                <div className="flex items-center mt-2 text-indigo-600">
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  <span className="text-sm font-semibold">Verifying with AI...</span>
                                </div>
                              )}
                              
                              {verificationComplete && !isVerifying && (
                                <div className="flex items-center mt-2 text-green-600">
                                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-semibold">AI ID verification completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveDocument}
                            className="ml-3 text-red-600 hover:text-red-700 p-1"
                            title="Remove document"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Facial Verification */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Camera className="inline mr-1 h-4 w-4" />
                        Facial Verification
                      </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Capture guest's photo for verification
                    </p>
                    
                    {!facialPhoto && !isCameraActive ? (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                      >
                        <Camera className="mr-2 h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Start Camera
                        </span>
                      </button>
                    ) : isCameraActive ? (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <video
                          id="cameraVideo"
                          autoPlay
                          playsInline
                          className="w-full rounded-lg mb-3"
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <img
                              src={facialPhoto!}
                              alt="Guest Photo"
                              className="w-24 h-24 object-cover rounded border border-gray-200"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Photo captured</p>
                              <p className="text-xs text-gray-500">Ready for verification</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFacialPhoto}
                            className="ml-3 text-red-600 hover:text-red-700 p-1"
                            title="Remove photo"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Face Matching in Progress */}
                        {isMatchingFace && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                              <span className="text-sm font-medium text-gray-700">Matching face...</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Face Match Score - Shows for both _obs (15%) and _cta (100%) files */}
                        {(isFlaggedFile || isVerifiedFile) && showFaceMatchScore && !isMatchingFace && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Face Match Score</span>
                              <span className={`text-sm font-bold ${faceMatchScore >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                {faceMatchScore}%
                              </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${faceMatchScore >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${faceMatchScore}%` }}
                              />
                            </div>
                            {faceMatchScore >= 80 ? (
                              <p className="text-xs text-green-600 mt-2 flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                High match - Identity verified
                              </p>
                            ) : (
                              <p className="text-xs text-red-600 mt-2 flex items-center">
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Low match - ID may not match the person
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    </div>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
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
                      } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900`}
                    >
                      <option value="">Select a room type</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} (₦{type.price}/night)
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
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900`}
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
                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900`}
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
                        } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900`}
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
                        <p className="text-lg font-semibold text-gray-900">
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
                        <p className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
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
