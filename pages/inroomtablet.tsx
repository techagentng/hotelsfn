import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  UtensilsCrossed,
  Sparkles,
  Info,
  LogOut,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Loader2,
  AlertCircle,
  Wrench,
  Home as HomeIcon,
  Search,
} from 'lucide-react';
import { formatTime } from '../utils/dateFormat';
import { toast } from 'react-hot-toast';
import { useCheckoutReservation } from '../hooks/useReservations';
import {
  useGetGuestInfo,
  useGetMenu,
  useGetMenuCategories,
  useGetActiveOrders,
  usePlaceOrder,
  useRequestHousekeeping,
  useRequestMaintenance,
  useGetServiceRequests,
  type MenuItem,
  type MenuCategory,
} from '../hooks/useTablet';
import type { CartItem, HousekeepingServiceType, MaintenanceIssueType } from '@/types/tablet';

// For demo purposes - in production, this would come from device/session
const ROOM_NUMBER = '104';

type Page = 'home' | 'menu' | 'orders' | 'services' | 'info';

export default function InRoomTablet() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Service request states
  const [showHousekeepingForm, setShowHousekeepingForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [housekeepingType, setHousekeepingType] = useState<HousekeepingServiceType>('cleaning');
  const [housekeepingNotes, setHousekeepingNotes] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceIssueType>('air_conditioning');
  const [maintenanceDesc, setMaintenanceDesc] = useState('');

  // Checkout states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // Fetch data
  const { data: guestInfo, isLoading: loadingGuest } = useGetGuestInfo(ROOM_NUMBER);
  const { data: categories } = useGetMenuCategories();
  const { data: menuItems, isLoading: loadingMenu } = useGetMenu(
    selectedCategory !== 'all' ? selectedCategory : undefined
  );
  const { data: activeOrders } = useGetActiveOrders(guestInfo?.guest.id || 0);
  const { data: serviceRequests } = useGetServiceRequests(guestInfo?.guest.id || 0);

  // Mutations
  const placeOrder = usePlaceOrder();
  const checkoutMutation = useCheckoutReservation();
  const requestHousekeeping = useRequestHousekeeping();
  const requestMaintenance = useRequestMaintenance();

  // Cart calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Cart functions
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.menu_item.id === item.id);
    
    if (existingItem) {
      setCart(cart.map((cartItem) =>
        cartItem.menu_item.id === item.id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + 1,
              subtotal: (cartItem.quantity + 1) * item.price,
            }
          : cartItem
      ));
    } else {
      setCart([
        ...cart,
        {
          menu_item: item,
          quantity: 1,
          special_instructions: '',
          subtotal: item.price,
        },
      ]);
    }
    toast.success(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(cart.map((cartItem) => {
      if (cartItem.menu_item.id === itemId) {
        const newQuantity = Math.max(0, cartItem.quantity + delta);
        return {
          ...cartItem,
          quantity: newQuantity,
          subtotal: newQuantity * cartItem.menu_item.price,
        };
      }
      return cartItem;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (itemId: number) => {
    setCart(cart.filter((item) => item.menu_item.id !== itemId));
  };

  const handlePlaceOrder = async () => {
    if (!guestInfo || cart.length === 0) return;

    try {
      await placeOrder.mutateAsync({
        room_id: guestInfo.room.id,
        guest_id: guestInfo.guest.id,
        items: cart.map((item) => ({
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || undefined,
        })),
        special_requests: specialRequests || undefined,
        priority: 'normal',
      });

      toast.success('Order placed successfully!');
      setCart([]);
      setSpecialRequests('');
      setShowCart(false);
      setCurrentPage('orders');
    } catch (error: any) {
      toast.error(error.response?.data?.errors || 'Failed to place order');
    }
  };

  const handleCheckout = async () => {
    if (!guestInfo?.reservation?.id) return;

    try {
      await checkoutMutation.mutateAsync({
        id: guestInfo.reservation.id,
        additional_charges: additionalCharges ? parseFloat(additionalCharges) : undefined,
        notes: checkoutNotes || undefined,
      });

      toast.success('Check-out successful! Thank you for staying with us.');
      setShowCheckoutModal(false);
      // Redirect to thank you page or home
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.errors || 'Failed to check out');
    }
  };

  const handleHousekeepingRequest = async () => {
    if (!guestInfo) return;

    try {
      await requestHousekeeping.mutateAsync({
        room_id: guestInfo.room.id,
        guest_id: guestInfo.guest.id,
        service_type: housekeepingType,
        priority: 'normal',
        notes: housekeepingNotes,
      });

      toast.success('Housekeeping request submitted!');
      setShowHousekeepingForm(false);
      setHousekeepingNotes('');
    } catch (error: any) {
      toast.error(error.response?.data?.errors || 'Failed to submit request');
    }
  };

  const handleMaintenanceRequest = async () => {
    if (!guestInfo || !maintenanceDesc) {
      toast.error('Please describe the issue');
      return;
    }

    try {
      await requestMaintenance.mutateAsync({
        room_id: guestInfo.room.id,
        guest_id: guestInfo.guest.id,
        issue_type: maintenanceType,
        priority: 'normal',
        description: maintenanceDesc,
      });

      toast.success('Maintenance request submitted!');
      setShowMaintenanceForm(false);
      setMaintenanceDesc('');
    } catch (error: any) {
      toast.error(error.response?.data?.errors || 'Failed to submit request');
    }
  };

  // Checkout Modal Component
  const CheckoutModal = () => {
    if (!showCheckoutModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8 z-50">
        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
              <h3 className="font-bold text-lg mb-3 text-gray-900">Reservation Summary</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Guest:</span> {guestInfo?.guest.first_name} {guestInfo?.guest.last_name}</p>
                <p><span className="font-medium">Room:</span> {guestInfo?.room.room_number} - {guestInfo?.room.room_type}</p>
                <p><span className="font-medium">Check-in:</span> {guestInfo?.reservation?.check_in_date}</p>
                <p><span className="font-medium">Check-out:</span> {guestInfo?.reservation?.check_out_date}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Charges (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Mini bar, room service, or other charges</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Any feedback or special notes..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutMutation.isPending ? 'Processing...' : 'Confirm Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loadingGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  if (!guestInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Room Not Found</h2>
          <p className="text-gray-900">Unable to load guest information</p>
        </div>
      </div>
    );
  }

  // Home Page
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-white mb-16">
            <div className="backdrop-blur-sm bg-white/10 rounded-3xl p-8 border border-white/20 flex items-center justify-between gap-6">
              <div className="flex-1 pointer-events-none">
                <h1 className="text-6xl font-extrabold mb-3 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  Welcome, {guestInfo.guest.first_name}!
                </h1>
                <p className="text-2xl font-medium text-white/90">
                  Room {guestInfo.room.room_number} • {guestInfo.room.room_type}
                </p>
              </div>
              <button
                onClick={() => setShowCheckoutModal(true)}
                className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all hover:scale-105 shadow-xl hover:shadow-2xl flex items-center gap-3 flex-shrink-0 z-50 relative pointer-events-auto cursor-pointer"
              >
                <span>Checkout</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <button
              onClick={() => setCurrentPage('menu')}
              className="group bg-white/95 backdrop-blur-lg rounded-3xl p-10 text-left hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border border-orange-100"
            >
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <UtensilsCrossed className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Order Food</h3>
              <p className="text-gray-600 text-lg">Browse our delicious menu</p>
            </button>

            <button
              onClick={() => setCurrentPage('services')}
              className="group bg-white/95 backdrop-blur-lg rounded-3xl p-10 text-left hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border border-blue-100"
            >
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">Request Service</h3>
              <p className="text-gray-600 text-lg">Housekeeping & Maintenance</p>
            </button>

            <button
              onClick={() => setCurrentPage('orders')}
              className="group bg-white/95 backdrop-blur-lg rounded-3xl p-10 text-left hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border border-green-100 relative overflow-hidden"
            >
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900 group-hover:text-green-600 transition-colors">Track Orders</h3>
              <p className="text-gray-600 text-lg">View your active orders</p>
              {activeOrders && activeOrders.length > 0 && (
                <span className="inline-flex items-center mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                  {activeOrders.length} active
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage('info')}
              className="group bg-white/95 backdrop-blur-lg rounded-3xl p-10 text-left hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border border-purple-100"
            >
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Info className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">Hotel Info</h3>
              <p className="text-gray-600 text-lg">Facilities & Contact</p>
            </button>
          </div>

          {/* Active Orders Preview */}
          {activeOrders && activeOrders.length > 0 && (
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Active Orders</h2>
              <div className="space-y-4">
                {activeOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-md">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Checkout Modal */}
        {CheckoutModal()}
      </div>
    );
  }

  // Menu Page
  if (currentPage === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              <span className="text-xl">←</span> Back
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Room Service Menu</h1>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                <span className="font-semibold">{cartItemsCount}</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                  {cart.length}
                </span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto px-6 pb-4 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Items
            </button>
            {categories?.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category.name} ({category.items_count})
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-6">
          {loadingMenu ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {menuItems?.map((item) => (
                <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  {item.image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add
                      </button>
                    </div>
                    {item.preparation_time && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.preparation_time} min</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                  <button onClick={() => setShowCart(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <p className="text-center text-gray-700 py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.menu_item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.menu_item.name}</h3>
                            <p className="text-sm text-gray-900">${item.menu_item.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.menu_item.id, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.menu_item.id, 1)}
                              className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.menu_item.id)}
                              className="ml-2 text-red-600"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">Special Requests (Optional)</label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg text-gray-900"
                        rows={3}
                        placeholder="Any special instructions..."
                      />
                    </div>

                    <div className="border-t pt-4 mb-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placeOrder.isPending}
                      className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Orders Page
  if (currentPage === 'orders') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-900 hover:text-indigo-600"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Your Orders</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6">
          {!activeOrders || activeOrders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-700">No active orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order: any) => (
                <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                      <p className="text-sm text-gray-900">Ordered at {formatTime(order.ordered_at)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'delivering' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      {['pending', 'preparing', 'ready', 'delivering', 'delivered'].map((status, index) => (
                        <div key={status} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            order.status === status ? 'bg-indigo-600 text-white' :
                            index < ['pending', 'preparing', 'ready', 'delivering', 'delivered'].indexOf(order.status)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index < ['pending', 'preparing', 'ready', 'delivering', 'delivered'].indexOf(order.status) ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : order.status === status ? (
                              <Clock className="w-5 h-5 animate-pulse" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <p className="text-xs mt-1 capitalize">{status}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.estimated_delivery_time && (
                    <div className="bg-indigo-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-indigo-600 font-medium">Estimated Delivery</p>
                      <p className="text-lg font-bold text-indigo-900">{formatTime(order.estimated_delivery_time)}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-900 mb-2 font-medium">Items:</p>
                    {order.items?.map((item: any, idx: number) => (
                      <p key={idx} className="text-sm">
                        {item.quantity}x {item.name}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">${order.total_amount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Services Page
  if (currentPage === 'services') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-900 hover:text-indigo-600"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Services</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setShowHousekeepingForm(true)}
              className="bg-white rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">Housekeeping</h3>
              <p className="text-sm text-gray-900">Request cleaning or amenities</p>
            </button>

            <button
              onClick={() => setShowMaintenanceForm(true)}
              className="bg-white rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-1 text-gray-900">Maintenance</h3>
              <p className="text-sm text-gray-900">Report an issue</p>
            </button>
          </div>

          {/* Service Requests */}
          {serviceRequests && serviceRequests.length > 0 && (
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Your Requests</h2>
              <div className="space-y-3">
                {serviceRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{request.request_number}</p>
                        <p className="text-sm text-gray-900 capitalize">{request.type}</p>
                        {request.description && (
                          <p className="text-sm text-gray-700 mt-1">{request.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Housekeeping Form Modal */}
        {showHousekeepingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Request Housekeeping</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Service Type</label>
                <select
                  value={housekeepingType}
                  onChange={(e) => setHousekeepingType(e.target.value as HousekeepingServiceType)}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                >
                  <option value="cleaning">Room Cleaning</option>
                  <option value="towels">Fresh Towels</option>
                  <option value="amenities">Toiletries Refill</option>
                  <option value="bedding">Change Bed Linens</option>
                  <option value="turndown">Turndown Service</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes (Optional)</label>
                <textarea
                  value={housekeepingNotes}
                  onChange={(e) => setHousekeepingNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  rows={3}
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowHousekeepingForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHousekeepingRequest}
                  disabled={requestHousekeeping.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                  {requestHousekeeping.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance Form Modal */}
        {showMaintenanceForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Report Maintenance Issue</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Issue Type</label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value as MaintenanceIssueType)}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                >
                  <option value="air_conditioning">Air Conditioning</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="appliances">Appliances</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={maintenanceDesc}
                  onChange={(e) => setMaintenanceDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  rows={3}
                  placeholder="Please describe the issue..."
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMaintenanceRequest}
                  disabled={requestMaintenance.isPending || !maintenanceDesc}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
                >
                  {requestMaintenance.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Info Page
  if (currentPage === 'info') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-900 hover:text-indigo-600"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Hotel Information</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <HomeIcon className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-900">Reception</p>
                  <p className="font-medium">Dial 0</p>
                </div>
              </div>
              <div className="flex items-center">
                <UtensilsCrossed className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-900">Room Service</p>
                  <p className="font-medium">Dial 1</p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-900">Emergency</p>
                  <p className="font-medium">Dial 911</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">WiFi Information</h2>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-900 mb-1">Network</p>
              <p className="font-bold text-lg mb-3">GrandHotel-Guest</p>
              <p className="text-sm text-gray-900 mb-1">Password</p>
              <p className="font-mono font-bold text-lg">welcome2024</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
