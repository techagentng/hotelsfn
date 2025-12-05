import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer } from '../utils/animations';
import AnimatedWrapper from '../components/AnimatedWrapper';
import Navbar from '../components/Navbar';
import AnimatedSpotlight from '../components/AnimatedSpotlight';
import { ArrowRight, CheckCircle, Zap, BarChart3, Shield, Users, TrendingUp, Check, Calendar, Home, Search, X, User, Mail, Phone, MessageSquare, Upload, CreditCard, Globe, FileText, Loader2, Eye, Camera, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useTranslation } from '../hooks/useTranslation';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LoginModal from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function Landing() {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Booking form state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomType, setRoomType] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Booking modal form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNationality, setGuestNationality] = useState('');
  const [guestIdType, setGuestIdType] = useState('passport');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [specialRequests, setSpecialRequests] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Facial verification state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facialPhoto, setFacialPhoto] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMatchingFace, setIsMatchingFace] = useState(false);
  const [showFaceMatchScore, setShowFaceMatchScore] = useState(false);
  const [faceMatchScore, setFaceMatchScore] = useState(0);

  // Room ID mapping (you may need to adjust based on your backend)
  const roomTypeToId: Record<string, number> = {
    standard: 1,
    deluxe: 5,
    suite: 7,
    presidential: 10,
  };

  const handleBookingSearch = () => {
    if (!checkInDate || !checkOutDate || !roomType) {
      alert('Please fill in all fields');
      return;
    }
    // Open booking modal instead of navigating
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    return Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getRoomPrice = (type: string) => {
    const prices: Record<string, number> = {
      standard: 25000,
      deluxe: 45000,
      suite: 75000,
      presidential: 150000,
    };
    return prices[type] || 25000;
  };

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !roomType) return 0;
    const nights = calculateNights(checkInDate, checkOutDate);
    return nights * getRoomPrice(roomType);
  };

  const handleSubmitBooking = async () => {
    if (!guestName || !guestEmail || !guestPhone || !guestIdNumber) {
      setBookingError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setBookingError('');
    setBookingSuccess(false);
    
    try {
      const formData = new FormData();
      
      // Add booking fields
      formData.append('guest_name', guestName);
      formData.append('guest_email', guestEmail);
      formData.append('guest_phone', guestPhone);
      formData.append('guest_nationality', guestNationality);
      formData.append('guest_id_type', guestIdType);
      formData.append('guest_id_number', guestIdNumber);
      formData.append('room_id', String(roomTypeToId[roomType] || 1));
      formData.append('check_in_date', checkInDate);
      formData.append('check_out_date', checkOutDate);
      formData.append('number_of_guests', String(guestCount));
      formData.append('payment_method', paymentMethod);
      formData.append('special_requests', specialRequests);
      
      // Add file if selected
      if (idDocument) {
        formData.append('id_document', idDocument);
      }
      
      // Call public booking endpoint (no auth required)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/reservations/public`,
        formData
      );
      
      console.log('Booking successful:', response.data);
      setBookingSuccess(true);
      
      // Reset form after short delay
      setTimeout(() => {
        closeBookingModal();
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setGuestNationality('');
        setGuestIdType('passport');
        setGuestIdNumber('');
        setGuestCount(1);
        setPaymentMethod('credit_card');
        setSpecialRequests('');
        setIdDocument(null);
        setIdDocumentPreview(null);
        setIsVerifying(false);
        setVerificationComplete(false);
        setFacialPhoto(null);
        setShowFaceMatchScore(false);
        setFaceMatchScore(0);
        setCheckInDate('');
        setCheckOutDate('');
        setRoomType('');
        setBookingSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Booking failed:', error);
      setBookingError(error.response?.data?.errors || error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setBookingError('Please upload a valid image (JPEG, PNG, WebP) or PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setBookingError('File size must be less than 5MB');
      return;
    }

    setIdDocument(file);
    setBookingError('');
    setVerificationComplete(false);

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

  // Remove uploaded document
  const handleRemoveDocument = () => {
    setIdDocument(null);
    setIdDocumentPreview(null);
    setIsVerifying(false);
    setVerificationComplete(false);
    setShowFaceMatchScore(false);
    setFaceMatchScore(0);
  };

  // Camera functions for facial verification
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      
      setTimeout(() => {
        const videoElement = document.getElementById('bookingCameraVideo') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = mediaStream;
          videoElement.play().catch(err => console.error('Error playing video:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setBookingError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById('bookingCameraVideo') as HTMLVideoElement;
    if (!videoElement) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.9);
      setFacialPhoto(photoData);
      stopCamera();
      
      // Trigger face matching if ID document is uploaded
      if (idDocument) {
        simulateFaceMatching();
      }
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
    setFaceMatchScore(0);
  };

  // Simulate face matching process
  const simulateFaceMatching = () => {
    setIsMatchingFace(true);
    setShowFaceMatchScore(false);
    setFaceMatchScore(0);
    
    // Simulate face matching (2 seconds) - random score between 75-100%
    setTimeout(() => {
      setIsMatchingFace(false);
      const score = Math.floor(Math.random() * 26) + 75; // 75-100%
      setFaceMatchScore(score);
      setShowFaceMatchScore(true);
    }, 2000);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleSuccess = (data: any) => {
    setSubmitSuccess(true);
    console.log('Form submitted successfully:', data);
    // You could show a success message or redirect here
  };

  const handleError = (error: string) => {
    setSubmitError(error);
    console.error('Form submission error:', error);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Navbar />
      
      {/* Animated Spotlights */}
      <AnimatedSpotlight
        fill="rgba(59, 130, 246, 0.08)"
        startX={0}
        startY={0}
        endX={50}
        endY={50}
        duration={4}
        delay={0}
      />
      <AnimatedSpotlight
        fill="rgba(139, 92, 246, 0.08)"
        startX={100}
        startY={0}
        endX={50}
        endY={50}
        duration={4}
        delay={1}
      />
      
      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-16 md:pb-20 px-4 min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/movie.mov" type="video/quicktime" />
            <source src="/movie.mov" type="video/mp4" />
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <AnimatedWrapper variants={fadeInUp}>
            <motion.div
              className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-6 bg-white/20 backdrop-blur-sm"
            >
              <span className="text-xs md:text-sm font-medium text-white">
                ✨ {t('landing.welcome')}{' '}
               <span className="text-yellow-400">KTECH</span>
              </span>
            </motion.div>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.1}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight text-white drop-shadow-lg">
              {t('landing.welcome2')}{' '}
            </h1>
          </AnimatedWrapper>

          <AnimatedWrapper variants={fadeInUp} delay={0.2}>
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto px-2 text-gray-200"
            >
              {t('landing.tagline')} 
              {t('landing.subtagline')}
            </p>
          </AnimatedWrapper>

          {/* <AnimatedWrapper variants={fadeInUp} delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-2">
              <button
                onClick={() => {
                  setSubmitError('');
                  setSubmitSuccess(false);
                  setIsLoginModalOpen(true);
                }}
                className="btn-primary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {t('landing.getStarted')}
                <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
              </button>
              <Link href="/theme-showcase" className="w-full sm:w-auto">
                <motion.button
                  className="btn-secondary text-base md:text-lg px-6 md:px-8 py-3 md:py-4 w-full sm:w-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('landing.viewShowcase')}
                </motion.button>
              </Link>
            </div>
          </AnimatedWrapper> */}

          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => {
              setIsLoginModalOpen(false);
              setSubmitError('');
              setSubmitSuccess(false);
            }}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        {/* Booking Form at Base of Hero */}
        <AnimatedWrapper variants={fadeInUp} delay={0.5}>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-5xl px-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Check-in Date */}
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Check-in</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Check-out</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* Room Type */}
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Room Type</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="">Select Room</option>
                      <option value="standard">Standard Room</option>
                      <option value="deluxe">Deluxe Room</option>
                      <option value="suite">Suite</option>
                      <option value="presidential">Presidential Suite</option>
                    </select>
                  </div>
                </div>

                {/* Book Now Button */}
                <div className="w-full md:w-auto">
                  <label className="block text-xs font-semibold text-transparent mb-1 md:block hidden">Book</label>
                  <motion.button
                    onClick={handleBookingSearch}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Search className="w-5 h-5" />
                    Book Now
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedWrapper>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              {t('landing.whyChooseUs')}
            </h2>
            <p 
              className="text-center text-lg mb-12 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('landing.everythingYouNeed')}
            </p>
          </AnimatedWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: t('landing.lightningFast'),
                description: t('landing.lightningFastDesc'),
                color: 'var(--accent-primary)',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: t('landing.secureReliable'),
                description: t('landing.secureReliableDesc'),
                color: 'var(--accent-success)',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: t('landing.growBusiness'),
                description: t('landing.growBusinessDesc'),
                color: 'var(--accent-info)',
              },
            ].map((feature, index) => (
              <AnimatedWrapper key={feature.title} variants={fadeInUp} delay={0.1 * (index + 1)}>
                <motion.div
                  className="card h-full"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="p-3 rounded-xl inline-block mb-4"
                    style={{ backgroundColor: 'var(--bg-tertiary)' }}
                  >
                    <div style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Why Everyone Loves iWe Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Why Everyone Loves <span style={{ color: 'var(--accent-primary)' }}>iWe</span>
            </h2>
          </AnimatedWrapper>

          <div className="space-y-8">
            {[
              {
                title: 'PDF or Photo Upload',
                description: 'Drag any bank statement. We read every line in seconds.',
                icon: '📄',
              },
              {
                title: 'Ask IWE Anything',
                description: 'Type or speak: "How much on transport?" → Get a chart + response instantly.',
                icon: '🤖',
              },
              {
                title: '100% For Nigeria & Global',
                description: '₦ currency, language toggle, voice input',
                icon: '🌍',
              },
            ].map((feature, index) => (
              <AnimatedWrapper key={feature.title} variants={fadeInUp} delay={0.1 * index}>
                <motion.div
                  className="card p-8 flex items-center gap-6"
                  whileHover={{ x: 8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-5xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>

          <AnimatedWrapper variants={fadeInUp} delay={0.4}>
            <div className="text-center mt-12">
              <Link href="#features">
                <motion.button
                  className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Discover More Features
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
                Invoicing, Bookkeeping, Inventory, Accounting – All in One.
              </p>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* How iWe Works Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              How iWe Works in <span style={{ color: 'var(--accent-primary)' }}>3 Steps</span>
            </h2>
          </AnimatedWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Statement',
                description: 'PDF or photo. We extract every transaction instantly.',
                icon: '📤',
              },
              {
                step: '2',
                title: 'Ask IWE',
                description: '"Show transport" or "How much on data?" → Get a chart in seconds.',
                icon: '💬',
              },
              {
                step: '3',
                title: 'See & Act',
                description: 'Live dashboard. Tap to recategorize. Export anytime.',
                icon: '📊',
              },
            ].map((step, index) => (
              <AnimatedWrapper key={step.title} variants={fadeInUp} delay={0.1 * index}>
                <motion.div
                  className="text-center"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    {step.step}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                </motion.div>
              </AnimatedWrapper>
            ))}
          </div>

          <AnimatedWrapper variants={fadeInUp} delay={0.4}>
            <div className="text-center mt-12">
              <Link href="#business">
                <motion.button
                  className="btn-secondary text-lg px-8 py-4 flex items-center gap-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Business Tools
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
                From invoicing clients to tracking inventory – scale effortlessly.
              </p>
            </div>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedWrapper variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to See Your <span style={{ color: 'var(--accent-primary)' }}>Money Clearly?</span>
            </h2>
            <div className="mb-8">
              <p className="text-2xl font-semibold mb-2">Start Free – No Card Required</p>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                First 42 transactions on us. Upgrade anytime.
              </p>
            </div>
            <Link href="/signup">
              <motion.button
                className="btn-primary text-xl px-10 py-5 flex items-center gap-3 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Now
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </AnimatedWrapper>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 px-4 border-t"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p style={{ color: 'var(--text-secondary)' }}>
              © 2025 iWe. Made in Nigeria
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-center">
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Privacy
              </Link>
              <Link href="/terms" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Terms
              </Link>
              <a href="mailto:hello@iweapps.com" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
                Support: hello@iweapps.com
              </a>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <span style={{ color: 'var(--text-secondary)' }}>More Features:</span>
              <span className="font-medium">Invoicing</span>
              <span className="font-medium">Bookkeeping</span>
              <span className="font-medium">Inventory</span>
              <span className="font-medium">Accounting</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complete Your Booking</h2>
                  <p className="text-gray-500">Fill in your details to reserve your room</p>
                </div>
                <button 
                  onClick={closeBookingModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Summary */}
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium text-gray-900">{new Date(checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium text-gray-900">{new Date(checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Type</span>
                      <span className="font-medium text-gray-900 capitalize">{roomType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights</span>
                      <span className="font-medium text-gray-900">{calculateNights(checkInDate, checkOutDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per night</span>
                      <span className="font-medium text-gray-900">₦{getRoomPrice(roomType).toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-indigo-600">₦{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guest Information Form */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Guest Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value)}
                            placeholder="+234 800 000 0000"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={guestNationality}
                            onChange={(e) => setGuestNationality(e.target.value)}
                            placeholder="Nigerian"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={guestCount}
                            onChange={(e) => setGuestCount(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm"
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Type *</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            value={guestIdType}
                            onChange={(e) => setGuestIdType(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm"
                          >
                            <option value="passport">Passport</option>
                            <option value="national_id">National ID</option>
                            <option value="drivers_license">Driver's License</option>
                            <option value="voters_card">Voter's Card</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ID Number *</label>
                        <input
                          type="text"
                          value={guestIdNumber}
                          onChange={(e) => setGuestIdNumber(e.target.value)}
                          placeholder="AB123456"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white text-sm"
                        >
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash">Cash (Pay at Hotel)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Document Upload & Special Requests */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="inline mr-1 h-4 w-4" />
                    Upload ID Document
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Upload a copy of your ID</p>
                  
                  {!idDocument ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="id-document-upload"
                      />
                      <label
                        htmlFor="id-document-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 cursor-pointer transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">Click to upload</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP, PDF (Max 5MB)</p>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          {idDocumentPreview ? (
                            <div className="relative group">
                              <img
                                src={idDocumentPreview}
                                alt="ID Document Preview"
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => window.open(idDocumentPreview, '_blank')}
                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded transition-all"
                              >
                                <Eye className="text-white opacity-0 group-hover:opacity-100 h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                              <FileText className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{idDocument.name}</p>
                            <p className="text-xs text-gray-500">{(idDocument.size / 1024).toFixed(1)} KB</p>
                            
                            {/* AI Verification Status */}
                            {isVerifying && (
                              <div className="flex items-center mt-1 text-indigo-600">
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                <span className="text-xs font-medium">Verifying...</span>
                              </div>
                            )}
                            
                            {verificationComplete && !isVerifying && (
                              <div className="flex items-center mt-1 text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveDocument}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove document"
                        >
                          <X className="h-4 w-4" />
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
                  <p className="text-xs text-gray-500 mb-2">Capture your photo for verification</p>
                  
                  {!facialPhoto && !isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-sm">Start Camera</span>
                    </button>
                  ) : isCameraActive ? (
                    <div className="border border-gray-300 rounded-xl p-3">
                      <video
                        id="bookingCameraVideo"
                        autoPlay
                        playsInline
                        className="w-full rounded-lg mb-3"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          Capture
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <img
                            src={facialPhoto!}
                            alt="Your Photo"
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Photo captured</p>
                            <p className="text-xs text-gray-500">Ready for verification</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFacialPhoto}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Face Matching in Progress */}
                      {isMatchingFace && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                            <span className="text-sm font-medium text-gray-700">Matching face...</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Face Match Score */}
                      {showFaceMatchScore && !isMatchingFace && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-700">Face Match Score</span>
                            <span className={`text-xs font-bold ${faceMatchScore >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                              {faceMatchScore}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${faceMatchScore >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${faceMatchScore}%` }}
                            />
                          </div>
                          {faceMatchScore >= 80 ? (
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Identity verified
                            </p>
                          ) : (
                            <p className="text-xs text-red-600 mt-1 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low match - please retake
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Late checkout, extra pillows, etc..."
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {bookingError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {bookingError}
                </div>
              )}
              {bookingSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Booking submitted successfully! We'll send confirmation to your email.
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Booking
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}