import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Package, 
  Star,
  Filter,
  Search,
  X,
  Check,
  Clock,
  Truck
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';
import { merchandisePaymentService } from '../../services/merchandisePayment';
import { useConvex } from 'convex/react';
import MerchandiseOrderSuccess from './MerchandiseOrderSuccess';

interface MerchandiseItem {
  _id: Id<"merchandise">;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  isActive: boolean;
}

interface CartItem {
  merchandiseId: Id<"merchandise">;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: Id<"merchandiseOrders">;
  orderNumber: string;
  items: {
    merchandiseId: Id<"merchandise">;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
    merchandiseName: string;
    merchandiseImage: string;
  }[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: number;
}

const MerchandiseView: React.FC = () => {
  const { user } = useAuth();
  const convex = useConvex();
  
  // Initialize payment service
  React.useEffect(() => {
    merchandisePaymentService.setConvexClient(convex);
    merchandisePaymentService.loadRazorpayScript();
  }, [convex]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MerchandiseItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showOrders, setShowOrders] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState('');

  // Queries
  const merchandise = useQuery(api.merchandise.getActiveMerchandise) || [];
  const categories = useQuery(api.merchandise.getCategories) || [];
  const userOrders = useQuery(api.merchandiseOrders.getOrdersByCustomer, {
    customerPhone: user?.phoneNumber || ''
  }) || [];

  // Mutations
  const createOrder = useMutation(api.merchandiseOrders.createOrder);

  // Filter merchandise
  const filteredMerchandise = merchandise.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.stockQuantity > 0;
  });

  const addToCart = (item: MerchandiseItem, size?: string, color?: string) => {
    const cartItem: CartItem = {
      merchandiseId: item._id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      quantity,
      size,
      color,
    };

    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.merchandiseId === item._id && 
      cartItem.size === size && 
      cartItem.color === color
    );

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }

    toast.success('Added to cart!');
    setSelectedItem(null);
    setQuantity(1);
    setSelectedSize('');
    setSelectedColor('');
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const updateCartQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    setCart(newCart);
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!user?.phoneNumber) {
      toast.error('Please login to place an order');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        merchandiseId: item.merchandiseId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price,
      }));

      const totalAmount = getTotalAmount();
      
      // Create order first
      const result = await merchandisePaymentService.createOrder({
        customerPhone: user.phoneNumber,
        customerName: user.phoneNumber || 'Student',
        items: orderItems,
        totalAmount,
      });

      // Process payment with Razorpay
      await merchandisePaymentService.processPayment(
        result.orderId,
        result.orderNumber,
        totalAmount,
        user.phoneNumber || 'Student',
        user.phoneNumber
      );

      setSuccessOrderNumber(result.orderNumber);
      setShowOrderSuccess(true);
      setCart([]);
      setShowCart(false);
      
    } catch (error: any) {
      if (error.message === 'Payment cancelled by user') {
        toast.error('Payment was cancelled');
      } else {
        toast.error('Payment failed. Please try again.');
      }
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-900/20';
      case 'paid': return 'text-green-400 bg-green-900/20';
      case 'processing': return 'text-blue-400 bg-blue-900/20';
      case 'ready_for_collection': return 'text-purple-400 bg-purple-900/20';
      case 'collected': return 'text-green-400 bg-green-900/20';
      case 'cancelled': return 'text-red-400 bg-red-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePayNow = async (order: Order) => {
    if (!user?.phoneNumber) {
      toast.error('Please log in to complete payment');
      return;
    }

    try {
      setIsLoading(true);
      
      // Set Convex client for payment service
      merchandisePaymentService.setConvexClient(convex);
      
      // Process payment with correct arguments
      await merchandisePaymentService.processPayment(
        order._id,
        order.orderNumber,
        order.totalAmount,
        user.name || user.fullName || 'Customer',
        user.phoneNumber
      );
      
      toast.success('Payment initiated successfully!');
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header - Mobile App Style */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Merchandise Store</h2>
          <p className="text-gray-600 text-sm font-medium">Get your Playgram gear and show your team spirit!</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowOrders(!showOrders)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-100 hover:to-gray-200 active:scale-95 transition-all duration-200 shadow-sm border border-gray-200 font-semibold"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Orders</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-bold">{userOrders.length}</span>
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 shadow-lg font-semibold"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-blue-800 text-white text-xs px-2 py-0.5 rounded-full font-bold">{cart.length}</span>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* My Orders Section - Mobile App Style */}
      {showOrders && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">My Orders</h3>
          {userOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No orders yet. Start shopping!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {userOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md active:scale-95 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base">{order.orderNumber}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status === 'ready_for_collection' && <Truck className="w-3 h-3" />}
                        {order.status === 'collected' && <Check className="w-3 h-3" />}
                        {order.status === 'pending' && <Clock className="w-3 h-3" />}
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">₹{order.totalAmount}</span>
                      {order.status === 'pending' && order.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handlePayNow(order)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          {isLoading ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-2 bg-gray-50 rounded">
                        <img
                          src={item.merchandiseImage}
                          alt={item.merchandiseName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.merchandiseName}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          {item.size && <p className="text-xs text-gray-500">Size: {item.size}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Success Modal */}
      {showOrderSuccess && (
        <MerchandiseOrderSuccess
          orderNumber={successOrderNumber}
          onClose={() => {
            setShowOrderSuccess(false);
            setSuccessOrderNumber('');
          }}
        />
      )}

      {/* Filters */
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchandise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Products Grid - Mobile App Style */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {filteredMerchandise.map((item) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg active:scale-95 transition-all duration-200 shadow-sm"
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.stockQuantity <= 10 && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                  Low Stock
                </span>
              )}
            </div>
            
            <div className="p-3 sm:p-4">
              <div className="mb-3">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-medium">{item.category}</p>
                  <span className="text-lg font-bold text-blue-600">₹{item.price}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-600 mb-3 line-clamp-2 hidden sm:block">{item.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 font-medium">
                  Stock: {item.stockQuantity}
                </span>
                <div className="flex gap-1 hidden sm:flex">
                  {item.sizes.slice(0, 2).map((size) => (
                    <span key={size} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-lg font-medium">
                      {size}
                    </span>
                  ))}
                  {item.sizes.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-lg font-medium">
                      +{item.sizes.length - 2}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setSelectedItem(item)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMerchandise.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Product Selection Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedItem.name}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-gray-600 mb-2">{selectedItem.description}</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">₹{selectedItem.price}</p>
              </div>

              {selectedItem.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 border rounded ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 border rounded ${
                          selectedColor === color
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedItem.stockQuantity, quantity + 1))}
                    className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => addToCart(selectedItem, selectedSize, selectedColor)}
                disabled={selectedItem.sizes.length > 0 && !selectedSize}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart - ₹{selectedItem.price * quantity}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-white to-gray-50 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Shopping Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:shadow-md transition-shadow">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="text-sm text-gray-500">
                        {item.size && `Size: ${item.size} • `}
                        {item.color && `Color: ${item.color} • `}
                        ₹{item.price} each
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity - 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(index, item.quantity + 1)}
                          className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">₹{item.price * item.quantity}</div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">₹{getTotalAmount()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Items will be available for collection at your next session
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MerchandiseView;