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
import type { CartItem, HousekeepingServiceType, MaintenanceIssueType } from '../types/tablet';

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
          <p className="text-gray-600">Unable to load guest information</p>
        </div>
      </div>
    );
  }

  // Home Page
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-white mb-12">
            <h1 className="text-5xl font-bold mb-2">
              Welcome, {guestInfo.guest.first_name}!
            </h1>
            <p className="text-2xl opacity-90">
              Room {guestInfo.room.room_number} • {guestInfo.room.room_type}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setCurrentPage('menu')}
              className="bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-shadow"
            >
              <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Order Food</h3>
              <p className="text-gray-900">Browse our delicious menu</p>
            </button>

            <button
              onClick={() => setCurrentPage('services')}
              className="bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-shadow"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Request Service</h3>
              <p className="text-gray-900">Housekeeping & Maintenance</p>
            </button>

            <button
              onClick={() => setCurrentPage('orders')}
              className="bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-shadow"
            >
              <div className="bg-green-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Track Orders</h3>
              <p className="text-gray-900">View your active orders</p>
              {activeOrders && activeOrders.length > 0 && (
                <span className="inline-block mt-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  {activeOrders.length} active
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentPage('info')}
              className="bg-white rounded-2xl p-8 text-left hover:shadow-2xl transition-shadow"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Hotel Info</h3>
              <p className="text-gray-900">Facilities & Contact</p>
            </button>
          </div>

          {/* Active Orders Preview */}
          {activeOrders && activeOrders.length > 0 && (
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Your Active Orders</h2>
              <div className="space-y-3">
                {activeOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Menu Page
  if (currentPage === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-20">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Room Service Menu</h1>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 inline mr-2" />
                {cartItemsCount}
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto px-6 pb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-lg mr-2 whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All Items
            </button>
            {categories?.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-6 py-2 rounded-lg mr-2 whitespace-nowrap ${
                  selectedCategory === category.name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700'
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
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-900 mb-3">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-indigo-600">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add
                      </button>
                    </div>
                    {item.preparation_time && (
                      <p className="text-xs text-gray-500 mt-2">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {item.preparation_time} min
                      </p>
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
                  <p className="text-center text-gray-500 py-8">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.menu_item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.menu_item.name}</h3>
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
                      <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
                      <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
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
              className="text-gray-600 hover:text-gray-900"
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
              <p className="text-gray-500">No active orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order: any) => (
                <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{order.order_number}</h3>
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
                              : 'bg-gray-200 text-gray-400'
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
              className="text-gray-600 hover:text-gray-900"
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
              <h3 className="text-lg font-bold mb-1">Housekeeping</h3>
              <p className="text-sm text-gray-900">Request cleaning or amenities</p>
            </button>

            <button
              onClick={() => setShowMaintenanceForm(true)}
              className="bg-white rounded-xl p-6 text-left hover:shadow-lg transition-shadow"
            >
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                <Wrench className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold mb-1">Maintenance</h3>
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
                        <p className="text-sm text-gray-600 capitalize">{request.type}</p>
                        {request.description && (
                          <p className="text-sm text-gray-500 mt-1">{request.description}</p>
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
              <h3 className="text-xl font-bold mb-4">Request Housekeeping</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Service Type</label>
                <select
                  value={housekeepingType}
                  onChange={(e) => setHousekeepingType(e.target.value as HousekeepingServiceType)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="cleaning">Room Cleaning</option>
                  <option value="towels">Fresh Towels</option>
                  <option value="amenities">Toiletries Refill</option>
                  <option value="bedding">Change Bed Linens</option>
                  <option value="turndown">Turndown Service</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={housekeepingNotes}
                  onChange={(e) => setHousekeepingNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowHousekeepingForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
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
              <h3 className="text-xl font-bold mb-4">Report Maintenance Issue</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Issue Type</label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value as MaintenanceIssueType)}
                  className="w-full px-4 py-2 border rounded-lg"
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
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={maintenanceDesc}
                  onChange={(e) => setMaintenanceDesc(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Please describe the issue..."
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowMaintenanceForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
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
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Hotel Information</h1>
            <div className="w-20"></div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <HomeIcon className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Reception</p>
                  <p className="font-medium">Dial 0</p>
                </div>
              </div>
              <div className="flex items-center">
                <UtensilsCrossed className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Room Service</p>
                  <p className="font-medium">Dial 1</p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Emergency</p>
                  <p className="font-medium">Dial 911</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">WiFi Information</h2>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Network</p>
              <p className="font-bold text-lg mb-3">GrandHotel-Guest</p>
              <p className="text-sm text-gray-600 mb-1">Password</p>
              <p className="font-mono font-bold text-lg">welcome2024</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
