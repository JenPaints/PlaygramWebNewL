import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Plus, Minus, Package, AlertCircle, X } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '../../auth/AuthContext';
import merchandisePaymentService from '../../../services/merchandisePayment';
import { useConvex } from 'convex/react';
import { Id } from '../../../../convex/_generated/dataModel';
import MerchandiseOrderSuccess from '../MerchandiseOrderSuccess';

interface CartItem {
  merchandiseId: Id<"merchandise">;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  maxStock: number;
  imageUrl?: string;
}

interface MerchandiseViewProps {
  currentView?: string;
}

export const MerchandiseView: React.FC<MerchandiseViewProps> = ({ currentView }) => {
  const { user } = useAuth();
  const convex = useConvex();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showCart, setShowCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState('');

  // Fetch data from Convex
  const merchandise = useQuery(api.merchandise.getActiveMerchandise) || [];
  const categories = useQuery(api.merchandise.getCategories) || [];
  const userOrders = useQuery(api.merchandiseOrders.getOrdersByCustomer, {
    customerPhone: user?.phoneNumber || ''
  }) || [];

  // Mutations
  const createOrder = useMutation(api.merchandiseOrders.createOrder);

  // Filter merchandise by category
  const filteredMerchandise = selectedCategory === 'All'
    ? merchandise
    : merchandise.filter(item => item.category === selectedCategory);

  // Initialize payment service
  useEffect(() => {
    merchandisePaymentService.setConvexClient(convex);
  }, [convex]);

  // Add to cart function
  const addToCart = (item: any, size?: string, color?: string) => {
    const cartItem: CartItem = {
      merchandiseId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      size,
      color,
      maxStock: item.stockQuantity,
      imageUrl: item.imageUrl
    };

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem =>
        cartItem.merchandiseId === item._id &&
        cartItem.size === size &&
        cartItem.color === color
      );

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.merchandiseId === item._id &&
            cartItem.size === size &&
            cartItem.color === color
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, item.stockQuantity) }
            : cartItem
        );
      } else {
        return [...prevCart, cartItem];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (merchandiseId: Id<"merchandise">, size?: string, color?: string) => {
    setCart(prevCart => prevCart.filter(item =>
      !(item.merchandiseId === merchandiseId && item.size === size && item.color === color)
    ));
  };

  // Update cart quantity
  const updateCartQuantity = (merchandiseId: Id<"merchandise">, newQuantity: number, size?: string, color?: string) => {
    if (newQuantity <= 0) {
      removeFromCart(merchandiseId, size, color);
      return;
    }

    setCart(prevCart => prevCart.map(item =>
      item.merchandiseId === merchandiseId && item.size === size && item.color === color
        ? { ...item, quantity: Math.min(newQuantity, item.maxStock) }
        : item
    ));
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Process payment
  const handleCheckout = async () => {
    if (!user?.phoneNumber || cart.length === 0) return;
    
    if (!convex) {
      alert('System not ready. Please try again in a moment.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Ensure Convex client is set
      merchandisePaymentService.setConvexClient(convex);
      
      // Create order
      const orderData = {
        customerPhone: user.phoneNumber,
        customerName: user.fullName || user.name || 'Customer',
        items: cart.map(item => ({
          merchandiseId: item.merchandiseId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price
        })),
        totalAmount: cartTotal
      };

      const { orderId, orderNumber } = await createOrder(orderData);

      // Process payment
      await merchandisePaymentService.processPayment(
        orderId,
        orderNumber,
        cartTotal,
        user.fullName || user.name || 'Customer',
        user.phoneNumber
      );

      // Clear cart on success
      setCart([]);
      setShowOrderSuccess(true);
      setSuccessOrderNumber(orderNumber);
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process order';
      alert(`Payment failed: ${errorMessage}. Please try again.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Get cart item for a specific merchandise
  const getCartItem = (merchandiseId: Id<"merchandise">, size?: string, color?: string) => {
    return cart.find(item =>
      item.merchandiseId === merchandiseId &&
      item.size === size &&
      item.color === color
    );
  };

  if (merchandise === undefined) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Mobile App Style */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot_2025-07-13_at_22.16.29-removebg-preview.png"
              alt="Playgram Logo"
              className="h-6 w-6 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900">Shop Now</h1>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors">
            <span className="text-sm font-medium">Filters</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-4">
        {/* Products Grid - Matching Reference Design */}
        <div className="grid grid-cols-2 gap-4">
          {filteredMerchandise.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No merchandise available</h3>
              <p className="text-gray-500">Check back later for new items!</p>
            </div>
          ) : (
             filteredMerchandise.map((item) => {
               const isOutOfStock = item.stockQuantity === 0;

               return (
                 <div key={item._id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200">
                   {/* Product Image */}
                   <div 
                     className="aspect-square bg-gray-50 relative cursor-pointer"
                     onClick={() => setSelectedProduct(item)}
                   >
                     {item.imageUrl ? (
                       <img
                         src={item.imageUrl}
                         alt={item.name}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center">
                         <span className="text-2xl font-bold text-gray-400">P</span>
                       </div>
                     )}

                     {isOutOfStock && (
                       <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                         Out of Stock
                       </span>
                     )}
                   </div>

                   {/* Product Details */}
                   <div className="p-3">
                     <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{item.name}</h3>
                     <p className="text-lg font-bold text-gray-900 mb-3">₹{item.price}</p>

                     {/* Action Buttons - Same Line Layout */}
                     <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedProduct(item)}
                          disabled={isOutOfStock}
                          className={`flex-1 px-2 py-1.5 border border-red-500 text-red-500 text-xs font-bold rounded hover:bg-red-50 transition-colors ${
                            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => setSelectedProduct(item)}
                          disabled={isOutOfStock}
                          className={`flex-1 px-2 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors ${
                            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
        </div>
      </div>
      
      {/* Floating Cart Button */}
      {currentView === 'merchandise' && cart.length > 0 && (
        <button 
          onClick={() => setShowCart(true)}
          className="fixed bottom-40 right-4 z-40 bg-black p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" style={{ color: '#86D5F0' }} />
            <span className="absolute -top-2 -right-2 bg-white text-black text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}
       
       {/* Cart Modal */}
         {showCart && (
           <div className="fixed inset-0 bg-white z-50 flex flex-col">
             {/* Header */}
              <div className="flex-shrink-0 bg-white px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setShowCart(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Merchandise</h2>
                  <div className="w-10"></div>
                </div>
                <div className="mt-2">
                  <h3 className="text-sm text-gray-600">Cart</h3>
                </div>
              </div>
             
             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto px-4">
               {cart.length === 0 ? (
                 <div className="text-center py-12">
                   <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                   <p className="text-gray-500 font-medium">Your cart is empty</p>
                   <p className="text-gray-400 text-sm">Add some items to get started!</p>
                 </div>
               ) : (
                 <div className="py-4">
                   <div className="space-y-4 mb-8">
                    {cart.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-xl">
                        <img
                          src={item.imageUrl || '/placeholder-product.jpg'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">Size: {item.size || 'N/A'}</p>
                          <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.merchandiseId, item.quantity - 1, item.size, item.color)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.merchandiseId, item.quantity + 1, item.size, item.color)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Section - Inside Scrollable Content */}
                  <div className="bg-white border-t border-gray-200 pt-6 pb-8 -mx-4 px-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-gray-900">₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={() => {
                        handleCheckout();
                        setShowCart(false);
                      }}
                      className="w-full bg-red-500 text-white py-4 rounded-lg font-bold hover:bg-red-600 transition-colors text-lg"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
        </div>
     )}
      
      {/* Product Detail Modal - Matching Reference Design */}
       {selectedProduct && (
         <div className="fixed inset-0 bg-white z-50 flex flex-col">
           {/* Header */}
           <div className="flex-shrink-0 bg-white px-4 py-4 border-b border-gray-100">
             <div className="flex items-center justify-between">
               <button 
                 onClick={() => {
                   setSelectedProduct(null);
                   setSelectedSize('');
                   setSelectedColor('');
                 }}
                 className="p-2 rounded-full hover:bg-gray-100"
               >
                 <X className="w-6 h-6 text-gray-600" />
               </button>
               <h2 className="text-lg font-semibold text-gray-900">Shop Now</h2>
               <div className="w-10"></div>
             </div>
             <div className="mt-2">
               <h3 className="text-base font-medium text-gray-900">{selectedProduct.name}</h3>
               <p className="text-sm text-gray-600">Step into a sport, first experience made for every</p>
             </div>
           </div>
          
           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto px-4">
             <div className="py-4">
               {/* Large Product Image */}
               <div className="mb-6">
                 <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer" onClick={() => {
                   setSelectedImage(selectedProduct.imageUrl);
                   setShowImageModal(true);
                 }}>
                   <img
                     src={selectedProduct.imageUrl}
                     alt={selectedProduct.name}
                     className="w-full h-full object-cover"
                   />
                 </div>
               </div>
            
               {/* Price */}
               <div className="mb-6">
                 <span className="text-2xl font-bold text-gray-900">₹{selectedProduct.price}</span>
               </div>
            
               {/* Size Selection */}
               <div className="mb-6">
                 <h3 className="text-base font-semibold text-gray-900 mb-3">Select Size</h3>
                 <div className="grid grid-cols-5 gap-2">
                   {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                     <button
                       key={size}
                       onClick={() => setSelectedSize(size)}
                       className={`py-2 px-3 border rounded text-sm font-medium transition-colors ${
                         selectedSize === size
                           ? 'border-black bg-black text-white'
                           : 'border-gray-300 text-gray-700 hover:border-gray-400'
                       }`}
                     >
                       {size}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Action Buttons - Elegant Style */}
               <div className="flex gap-2 mb-6">
                 <button 
                   onClick={() => {
                     if (!selectedSize) {
                       alert('Please select a size');
                       return;
                     }
                     addToCart(selectedProduct, selectedSize, selectedColor);
                     setSelectedProduct(null);
                     setSelectedSize('');
                     setSelectedColor('');
                   }}
                   className="flex-1 px-2 py-1.5 border border-red-500 text-red-500 text-xs font-bold rounded hover:bg-red-50 transition-colors"
                 >
                   Add to Cart
                 </button>
                 <button 
                   onClick={() => {
                     if (!selectedSize) {
                       alert('Please select a size');
                       return;
                     }
                     addToCart(selectedProduct, selectedSize, selectedColor);
                     handleCheckout();
                     setSelectedProduct(null);
                     setSelectedSize('');
                     setSelectedColor('');
                   }}
                   className="flex-1 px-2 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
                 >
                   Buy Now
                 </button>
               </div>
            
               {/* Product Description */}
               <div className="mb-6">
                 <h3 className="text-base font-semibold text-gray-900 mb-3">Product Description</h3>
                 <p className="text-gray-700 text-sm leading-relaxed">
                   {selectedProduct.description || 'Designed with premium materials for superior comfort and performance. Perfect for training and casual wear.'}
                 </p>
               </div>
             
               {/* Material and Care */}
               <div className="mb-8">
                 <h3 className="text-base font-semibold text-gray-900 mb-3">Material and Care</h3>
                 <div className="text-gray-700 text-sm space-y-1">
                   <p>• 100% Polyester & 25% Spandex Blend</p>
                   <p>• Machine wash cold</p>
                   <p>• Do not bleach</p>
                   <p>• Tumble dry low</p>
                 </div>
               </div>
             </div>
           </div>
        </div>
      )}

       
       {/* Full-Screen Image Modal */}
       {showImageModal && (
         <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
           <div className="relative max-w-4xl max-h-full">
             <button 
               onClick={() => setShowImageModal(false)}
               className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors z-10"
             >
               <X className="w-6 h-6 text-white" />
             </button>
             <img
               src={selectedImage}
               alt="Product Image"
               className="max-w-full max-h-full object-contain rounded-lg"
               onClick={() => setShowImageModal(false)}
             />
           </div>
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
    </div>
  );
};

export default MerchandiseView;