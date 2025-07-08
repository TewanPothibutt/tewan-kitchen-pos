// ✅ Responsive enhancements added:
// - Navigation buttons stack on small screens (flex-wrap, gap)
// - Grid layout for tables and menus adjusts with screen size
// - Payment buttons & reports use responsive columns



import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, CreditCard, Smartphone, Wallet, Receipt,
  TrendingUp, Calendar, Clock, Users, ChefHat, Check,
  X, Plus, Minus, Trash2, Coffee, Pizza, Utensils,
  BarChart3, DollarSign, Package, ArrowRight, Loader
} from 'lucide-react';

const TewanKitchenPOS = () => {
  const [tables, setTables] = useState([
    { id: 1, status: 'available', orders: [] },
    { id: 2, status: 'available', orders: [] },
    { id: 3, status: 'available', orders: [] },
    { id: 4, status: 'available', orders: [] },
    { id: 5, status: 'available', orders: [] },
    { id: 6, status: 'available', orders: [] },
  ]);
  
  const menuCategories = {
    'Main Dishes': { icon: Pizza, color: 'orange' },
    'Side Dishes': { icon: Utensils, color: 'green' },
    'Beverages': { icon: Coffee, color: 'blue' }
  };
  
  const [menuItems] = useState([
    { id: 1, name: 'Rad Na Pork', price: 60, category: 'Main Dishes', image: '🍜' },
    { id: 2, name: 'Rad Na Chicken', price: 60, category: 'Main Dishes', image: '🍜' },
    { id: 3, name: 'Fried Egg', price: 15, category: 'Side Dishes', image: '🍳' },
    { id: 4, name: 'Fried Rice Pork', price: 55, category: 'Main Dishes', image: '🍛' },
    { id: 5, name: 'Fried Rice Beef', price: 65, category: 'Main Dishes', image: '🍛' },
    { id: 6, name: 'Water', price: 10, category: 'Beverages', image: '💧' },
    { id: 7, name: 'Soft Drink', price: 20, category: 'Beverages', image: '🥤' },
  ]);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [view, setView] = useState('tables');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [transactions, setTransactions] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [serviceCharge] = useState(10);
  const [tax] = useState(7);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculate totals
  const calculateSubtotal = (orders) => {
    return orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = (orders) => {
    const subtotal = calculateSubtotal(orders);
    const serviceAmount = subtotal * (serviceCharge / 100);
    const taxAmount = (subtotal + serviceAmount) * (tax / 100);
    const discountAmount = subtotal * (discount / 100);
    return subtotal + serviceAmount + taxAmount - discountAmount;
  };

  // Add item to order with animation
  const addToOrder = (item) => {
    const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setCurrentOrder(currentOrder.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setCurrentOrder([...currentOrder, { ...item, quantity: 1 }]);
    }
    showNotification(`Added ${item.name} to order`);
  };

  // Update quantity
  const updateQuantity = (itemId, change) => {
    setCurrentOrder(currentOrder.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  // Send order to kitchen
  const sendToKitchen = () => {
    if (!selectedTable || currentOrder.length === 0) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      const updatedTables = tables.map(table => {
        if (table.id === selectedTable) {
          return {
            ...table,
            status: 'occupied',
            orders: [...table.orders, ...currentOrder]
          };
        }
        return table;
      });
      
      setTables(updatedTables);
      setCurrentOrder([]);
      setIsProcessing(false);
      showNotification('Order sent to kitchen successfully!');
      setView('tables');
    }, 1000);
  };

  // Send to Google Sheets (mock function - replace with actual API call)
const sendToGoogleSheets = async (transactionData) => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyg87Shvrc81VyMvSfNw7I_jPhrZYCfW9u9KISyzdsjOPmqrqRD_t68zFYA-71z4o5p/exec';

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // ✅ จำเป็น
      },
      body: JSON.stringify(transactionData),
    });

    const result = await response.json(); // ✅ ทำได้ถ้าไม่ใช้ 'no-cors'
    console.log('✅ Success:', result);

    return result.status === 'success';
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};




  // Process payment
  const processPayment = async () => {
    if (!selectedTable || !paymentMethod) return;
    
    setIsProcessing(true);
    const table = tables.find(t => t.id === selectedTable);
    if (!table || table.orders.length === 0) return;
    
    const transaction = {
      tableId: selectedTable,
      items: table.orders,
      subtotal: calculateSubtotal(table.orders),
      total: calculateTotal(table.orders),
      paymentMethod,
      discount,
      serviceCharge,
      tax,
      timestamp: new Date().toISOString()
    };
    
    // Send to Google Sheets
    await sendToGoogleSheets(transaction);
    
    setTransactions([...transactions, transaction]);
    
    // Clear table
    setTables(tables.map(t => 
      t.id === selectedTable 
        ? { ...t, status: 'available', orders: [] }
        : t
    ));
    
    setSelectedTable(null);
    setPaymentMethod('');
    setDiscount(0);
    setIsProcessing(false);
    showNotification('Payment processed successfully!');
    setView('tables');
  };

  // Get filtered menu items
  const getFilteredMenuItems = () => {
    if (selectedCategory === 'All') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  };

  // Get daily statistics
  const getDailyStats = () => {
    const today = new Date().toDateString();
    const todayTransactions = transactions.filter(t => 
      new Date(t.timestamp).toDateString() === today
    );
    
    const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalOrders = todayTransactions.length;
    
    const popularItems = {};
    todayTransactions.forEach(t => {
      t.items.forEach(item => {
        popularItems[item.name] = (popularItems[item.name] || 0) + item.quantity;
      });
    });
    
    return { totalRevenue, totalOrders, popularItems };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Tewan's Kitchen</h1>
                <p className="text-xs text-gray-500">Restaurant POS System</p>
              </div>
            </motion.div>
            
            <nav className="hidden md:flex space-x-2">
              {[
                { id: 'tables', icon: Users, label: 'Tables' },
                { id: 'order', icon: ShoppingBag, label: 'Order' },
                { id: 'payment', icon: CreditCard, label: 'Payment' },
                { id: 'reports', icon: BarChart3, label: 'Reports' }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView(item.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                    view === item.id 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <div className="flex md:hidden space-x-2">
              {[
                { id: 'tables', icon: Users },
                { id: 'order', icon: ShoppingBag },
                { id: 'payment', icon: CreditCard },
                { id: 'reports', icon: BarChart3 }
              ].map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setView(item.id)}
                  className={`p-2 rounded-lg ${
                    view === item.id 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                      : 'text-gray-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 z-50"
          >
            <div className={`px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <Check className="w-5 h-5" />
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="p-4 pb-20 md:pb-4">
        <AnimatePresence mode="wait">
          {/* Tables View */}
          {view === 'tables' && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Table</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {tables.map((table, index) => (
                  <motion.button
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedTable(table.id);
                      setCurrentOrder(table.orders);
                      setView('order');
                    }}
                    className={`relative p-8 rounded-2xl border-2 transition-all overflow-hidden ${
                      table.status === 'occupied'
                        ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-3 h-3 rounded-full ${
                        table.status === 'occupied' ? 'bg-red-500' : 'bg-green-500'
                      } animate-pulse`} />
                    </div>
                    <Users className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                    <div className="text-2xl font-bold mb-1">Table {table.id}</div>
                    <div className={`text-sm font-medium ${
                      table.status === 'occupied' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {table.status === 'occupied' ? 'Occupied' : 'Available'}
                    </div>
                    {table.orders.length > 0 && (
                      <div className="mt-3 text-sm text-gray-600 bg-white/80 rounded-lg px-3 py-1">
                        {table.orders.length} items • ฿{calculateSubtotal(table.orders)}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Order View */}
          {view === 'order' && (
            <motion.div
              key="order"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-7xl mx-auto"
            >
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
                  Order for Table {selectedTable}
                </h2>
                <button
                  onClick={() => setView('tables')}
                  className="self-start md:self-auto text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Menu Items */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Menu</h3>
                  
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory('All')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === 'All'
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Items
                    </motion.button>
                    {Object.entries(menuCategories).map(([category, config]) => {
                      const Icon = config.icon;
                      return (
                        <motion.button
                          key={category}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center space-x-2 ${
                            selectedCategory === category
                              ? `bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 text-white`
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{category}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredMenuItems().map((item, index) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToOrder(item)}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">{item.image}</span>
                          <div className="text-left">
                            <div className="font-semibold text-gray-800">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg">฿{item.price}</span>
                          <div className="bg-green-500 text-white p-2 rounded-lg group-hover:bg-green-600 transition-colors">
                            <Plus className="w-5 h-5" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Current Order */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="font-bold text-lg mb-4">Current Order</h3>
                  {currentOrder.length === 0 ? (
                    <div className="text-center py-16">
                      <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Your cart is empty</p>
                      <p className="text-sm text-gray-400 mt-2">Add items from the menu</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                        <AnimatePresence>
                          {currentOrder.map((item) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{item.image}</span>
                                <div>
                                  <div className="font-semibold">{item.name}</div>
                                  <div className="text-sm text-gray-500">฿{item.price} each</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, -item.quantity)}
                                  className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center ml-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-lg">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">฿{calculateSubtotal(currentOrder)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Service Charge ({serviceCharge}%)</span>
                          <span>฿{(calculateSubtotal(currentOrder) * serviceCharge / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Tax ({tax}%)</span>
                          <span>฿{(calculateSubtotal(currentOrder) * (1 + serviceCharge/100) * tax / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2 border-t">
                          <span>Total</span>
                          <span className="text-orange-600">฿{calculateTotal(currentOrder).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={sendToKitchen}
                        disabled={isProcessing}
                        className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2 shadow-lg"
                      >
                        {isProcessing ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <ChefHat className="w-5 h-5" />
                            <span>Send to Kitchen</span>
                          </>
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Payment View */}
          {view === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Process Payment</h2>
              
              {/* Table Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Select Table</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {tables.filter(t => t.status === 'occupied').map(table => (
                    <motion.button
                      key={table.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTable(table.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedTable === table.id
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-transparent'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold">Table {table.id}</div>
                      <div className="text-xs mt-1">
                        {table.orders.length} items
                      </div>
                    </motion.button>
                  ))}
                </div>
                {tables.filter(t => t.status === 'occupied').length === 0 && (
                  <p className="text-gray-500 text-center py-8">No occupied tables</p>
                )}
              </div>

              {selectedTable && tables.find(t => t.id === selectedTable)?.orders.length > 0 && (
                <>
                  {/* Order Summary */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h3 className="font-bold text-lg mb-4">Order Summary - Table {selectedTable}</h3>
                    <div className="space-y-2 mb-6">
                      {tables.find(t => t.id === selectedTable).orders.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2 text-gray-700">
                          <span className="flex items-center space-x-2">
                            <span>{item.image}</span>
                            <span>{item.name} x{item.quantity}</span>
                          </span>
                          <span className="font-medium">฿{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>฿{calculateSubtotal(tables.find(t => t.id === selectedTable).orders)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Service Charge ({serviceCharge}%)</span>
                        <span>฿{(calculateSubtotal(tables.find(t => t.id === selectedTable).orders) * serviceCharge / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax ({tax}%)</span>
                        <span>฿{(calculateSubtotal(tables.find(t => t.id === selectedTable).orders) * (1 + serviceCharge/100) * tax / 100).toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount ({discount}%)</span>
                          <span>-฿{(calculateSubtotal(tables.find(t => t.id === selectedTable).orders) * discount / 100).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-xl pt-3 border-t">
                        <span>Total</span>
                        <span className="text-orange-600">฿{calculateTotal(tables.find(t => t.id === selectedTable).orders).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Discount Input */}
                    <div className="mt-6 flex items-center space-x-3 bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-700">Discount %:</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="font-bold text-lg mb-4">Payment Method</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'cash'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-transparent'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Wallet className={`w-10 h-10 mx-auto mb-3 ${
                          paymentMethod === 'cash' ? 'text-white' : 'text-green-600'
                        }`} />
                        <div className="font-semibold">Cash</div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod('qr')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'qr'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-transparent'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Smartphone className={`w-10 h-10 mx-auto mb-3 ${
                          paymentMethod === 'qr' ? 'text-white' : 'text-blue-600'
                        }`} />
                        <div className="font-semibold">QR Code</div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-transparent'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className={`w-10 h-10 mx-auto mb-3 ${
                          paymentMethod === 'card' ? 'text-white' : 'text-purple-600'
                        }`} />
                        <div className="font-semibold">Card</div>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod('other')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          paymentMethod === 'other'
                            ? 'bg-gradient-to-br from-gray-500 to-gray-600 text-white border-transparent'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Receipt className={`w-10 h-10 mx-auto mb-3 ${
                          paymentMethod === 'other' ? 'text-white' : 'text-gray-600'
                        }`} />
                        <div className="font-semibold">Other</div>
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={processPayment}
                      disabled={!paymentMethod || isProcessing}
                      className={`w-full mt-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                        paymentMethod && !isProcessing
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Complete Payment</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Reports View */}
          {view === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Daily Reports</h2>
              
              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white/80">Total Revenue</h3>
                    <DollarSign className="w-8 h-8 text-white/50" />
                  </div>
                  <div className="text-3xl font-bold">
                    ฿{getDailyStats().totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-white/60 mt-1">Today's earnings</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white/80">Total Orders</h3>
                    <ShoppingBag className="w-8 h-8 text-white/50" />
                  </div>
                  <div className="text-3xl font-bold">
                    {getDailyStats().totalOrders}
                  </div>
                  <div className="text-sm text-white/60 mt-1">Completed today</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white/80">Average Order</h3>
                    <TrendingUp className="w-8 h-8 text-white/50" />
                  </div>
                  <div className="text-3xl font-bold">
                    ฿{getDailyStats().totalOrders > 0 
                      ? (getDailyStats().totalRevenue / getDailyStats().totalOrders).toFixed(2)
                      : '0.00'
                    }
                  </div>
                  <div className="text-sm text-white/60 mt-1">Per transaction</div>
                </motion.div>
              </div>
              
              {/* Popular Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl p-6 mb-6"
              >
                <h3 className="font-bold text-lg mb-4">Popular Items Today</h3>
                <div className="space-y-3">
                  {Object.entries(getDailyStats().popularItems)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([name, quantity], index) => (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-600' :
                            'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-semibold">{name}</span>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          {quantity} sold
                        </span>
                      </motion.div>
                    ))
                  }
                  {Object.keys(getDailyStats().popularItems).length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No sales data yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions.slice(-5).reverse().map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-2 md:mb-0">
                          <div className="font-semibold flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span>Table {transaction.tableId}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end md:space-x-4">
                          <div className="text-right">
                            <div className="font-bold text-lg text-orange-600">฿{transaction.total.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 capitalize flex items-center justify-end space-x-1">
                              {transaction.paymentMethod === 'cash' && <Wallet className="w-3 h-3" />}
                              {transaction.paymentMethod === 'qr' && <Smartphone className="w-3 h-3" />}
                              {transaction.paymentMethod === 'card' && <CreditCard className="w-3 h-3" />}
                              <span>{transaction.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                  </motion.div> 
                  ))}
                  {transactions.length === 0 && (
                    <div className="text-center py-8">
                      <Receipt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No transactions yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TewanKitchenPOS;

