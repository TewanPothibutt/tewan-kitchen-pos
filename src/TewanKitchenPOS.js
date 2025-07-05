import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, CreditCard, Smartphone, Wallet, FileText, TrendingUp, Calendar, Clock, Users, ChefHat, Check, X, Edit2, Save, Printer } from 'lucide-react';

const TewanKitchenPOS = () => {
  const [tables, setTables] = useState([
    { id: 1, status: 'available', orders: [] },
    { id: 2, status: 'available', orders: [] },
    { id: 3, status: 'available', orders: [] },
    { id: 4, status: 'available', orders: [] },
    { id: 5, status: 'available', orders: [] },
    { id: 6, status: 'available', orders: [] },
  ]);
  
  const [menuItems] = useState([
    { id: 1, name: 'Rad Na Pork', price: 60, category: 'Main' },
    { id: 2, name: 'Rad Na Chicken', price: 60, category: 'Main' },
    { id: 3, name: 'Fried Egg', price: 15, category: 'Side' },
    { id: 4, name: 'Fried Rice Pork', price: 55, category: 'Main' },
    { id: 5, name: 'Fried Rice Beef', price: 65, category: 'Main' },
    { id: 6, name: 'Water', price: 10, category: 'Beverage' },
    { id: 7, name: 'Soft Drink', price: 20, category: 'Beverage' },
  ]);
  
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [view, setView] = useState('tables'); // tables, order, payment, reports
  const [transactions, setTransactions] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(10); // 10%
  const [tax, setTax] = useState(7); // 7%
  const [paymentMethod, setPaymentMethod] = useState('');

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

  // Add item to order
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

  // Remove item
  const removeItem = (itemId) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  // Send order to kitchen
  const sendToKitchen = () => {
    if (!selectedTable || currentOrder.length === 0) return;
    
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
    alert('Order sent to kitchen!');
  };

  // Process payment
  const processPayment = () => {
    if (!selectedTable || !paymentMethod) return;
    
    const table = tables.find(t => t.id === selectedTable);
    if (!table || table.orders.length === 0) return;
    
    const transaction = {
      id: Date.now(),
      tableId: selectedTable,
      items: table.orders,
      subtotal: calculateSubtotal(table.orders),
      total: calculateTotal(table.orders),
      paymentMethod,
      timestamp: new Date().toISOString(),
      discount,
      serviceCharge,
      tax
    };
    
    setTransactions([...transactions, transaction]);
    
    // Clear table
    setTables(tables.map(t => 
      t.id === selectedTable 
        ? { ...t, status: 'available', orders: [] }
        : t
    ));
    
    setSelectedTable(null);
    setPaymentMethod('');
    setView('tables');
    alert('Payment processed successfully!');
    
    // Here you would normally send to Google Sheets
    console.log('Transaction data for Google Sheets:', transaction);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-800">Tewan's Kitchen</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setView('tables')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'tables' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Tables
              </button>
              <button
                onClick={() => setView('order')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'order' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Order
              </button>
              <button
                onClick={() => setView('payment')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'payment' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Payment
              </button>
              <button
                onClick={() => setView('reports')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'reports' 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Reports
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">
        {/* Tables View */}
        {view === 'tables' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Select Table</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map(table => (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table.id);
                    setCurrentOrder(table.orders);
                    setView('order');
                  }}
                  className={`p-8 rounded-xl border-2 transition-all ${
                    table.status === 'occupied'
                      ? 'bg-orange-50 border-orange-300 hover:border-orange-400'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl font-bold mb-2">Table {table.id}</div>
                  <div className={`text-sm ${
                    table.status === 'occupied' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {table.status === 'occupied' ? 'Occupied' : 'Available'}
                  </div>
                  {table.orders.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      {table.orders.length} items
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order View */}
        {view === 'order' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Order for Table {selectedTable}
              </h2>
              <button
                onClick={() => setView('tables')}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Menu Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Menu</h3>
                <div className="space-y-2">
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => addToOrder(item)}
                      className="w-full p-3 border rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center"
                    >
                      <div className="text-left">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">฿{item.price}</span>
                        <Plus className="w-5 h-5 text-green-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Order */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Current Order</h3>
                {currentOrder.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items added</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {currentOrder.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-gray-500">฿{item.price} each</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-white border hover:bg-gray-100 flex items-center justify-center"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Subtotal</span>
                        <span>฿{calculateSubtotal(currentOrder)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={sendToKitchen}
                      className="w-full mt-4 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Printer className="w-5 h-5" />
                      <span>Send to Kitchen</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment View */}
        {view === 'payment' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Process Payment</h2>
            
            {/* Table Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Select Table</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {tables.filter(t => t.status === 'occupied').map(table => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTable === table.id
                        ? 'bg-orange-50 border-orange-400'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">Table {table.id}</div>
                    <div className="text-xs text-gray-500">{table.orders.length} items</div>
                  </button>
                ))}
              </div>
            </div>

            {selectedTable && tables.find(t => t.id === selectedTable)?.orders.length > 0 && (
              <>
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h3 className="font-semibold mb-4">Order Summary - Table {selectedTable}</h3>
                  <div className="space-y-2 mb-4">
                    {tables.find(t => t.id === selectedTable).orders.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2">
                        <span>{item.name} x{item.quantity}</span>
                        <span>฿{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>฿{calculateSubtotal(tables.find(t => t.id === selectedTable).orders)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service Charge ({serviceCharge}%)</span>
                      <span>฿{(calculateSubtotal(tables.find(t => t.id === selectedTable).orders) * serviceCharge / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({tax}%)</span>
                      <span>฿{(calculateSubtotal(tables.find(t => t.id === selectedTable).orders) * (1 + serviceCharge/100) * tax / 100).toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({discount}%)</span>
                        <span>-฿{(calculateSubtotal(tables.find(t => t.id === selectedTable).orders) * discount / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>฿{calculateTotal(tables.find(t => t.id === selectedTable).orders).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Discount Input */}
                  <div className="mt-4 flex items-center space-x-3">
                    <label className="text-sm font-medium">Discount %:</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-20 px-3 py-1 border rounded-lg"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Wallet className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <div className="text-sm font-medium">Cash</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('qr')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'qr'
                          ? 'bg-blue-50 border-blue-400'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-sm font-medium">QR / PromptPay</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-purple-50 border-purple-400'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-sm font-medium">Credit/Debit</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('other')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'other'
                          ? 'bg-gray-100 border-gray-400'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm font-medium">Other</div>
                    </button>
                  </div>
                  
                  <button
                    onClick={processPayment}
                    disabled={!paymentMethod}
                    className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                      paymentMethod
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Process Payment
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Reports View */}
        {view === 'reports' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Daily Reports</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Revenue Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  ฿{getDailyStats().totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Today</div>
              </div>
              
              {/* Orders Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {getDailyStats().totalOrders}
                </div>
                <div className="text-xs text-gray-500 mt-1">Completed</div>
              </div>
              
              {/* Average Order Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Average Order</h3>
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  ฿{getDailyStats().totalOrders > 0 
                    ? (getDailyStats().totalRevenue / getDailyStats().totalOrders).toFixed(2)
                    : '0.00'
                  }
                </div>
                <div className="text-xs text-gray-500 mt-1">Per order</div>
              </div>
            </div>
            
            {/* Popular Items */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-4">Popular Items Today</h3>
              <div className="space-y-3">
                {Object.entries(getDailyStats().popularItems)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([name, quantity]) => (
                    <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{name}</span>
                      <span className="text-sm text-gray-600">{quantity} sold</span>
                    </div>
                  ))
                }
                {Object.keys(getDailyStats().popularItems).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No sales data yet</p>
                )}
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.slice(-5).reverse().map(transaction => (
                  <div key={transaction.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">Table {transaction.tableId}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">฿{transaction.total.toFixed(2)}</div>
                        <div className="text-sm text-gray-500 capitalize">{transaction.paymentMethod}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.items.length} items
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TewanKitchenPOS;