import { useState, useEffect } from 'react';

function NewBill() {
  const [allItems, setAllItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch inventory on load
  useEffect(() => {
    getInventory();
  }, []);

  const getInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/inventory');
      const data = await response.json();
      setAllItems(data);
      setMessage('Inventory loaded successfully');
    } catch (error) {
      setMessage('Error loading inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search term
  const filteredItems = allItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item) => {
    const existingItem = cart.find((c) => c.pid === item.pid);

    if (existingItem) {
      if (existingItem.quantity + 1 > item.quantity) {
        setMessage(`Cannot add more. Only ${item.quantity} available in stock`);
        return;
      }
      setCart(
        cart.map((c) =>
          c.pid === item.pid
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.price }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          pid: item.pid,
          name: item.name,
          price: item.price,
          quantity: 1,
          subtotal: item.price,
        },
      ]);
    }
    setMessage(`Added ${item.name} to cart`);
  };

  const removeFromCart = (pid) => {
    setCart(cart.filter((item) => item.pid !== pid));
    setMessage('Item removed from cart');
  };

  const updateCartQuantity = (pid, newQuantity) => {
    const item = allItems.find((i) => i.pid === pid);
    if (newQuantity > item.quantity) {
      setMessage(`Only ${item.quantity} available in stock`);
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(pid);
      return;
    }
    setCart(
      cart.map((c) =>
        c.pid === pid ? { ...c, quantity: newQuantity, subtotal: newQuantity * c.price } : c
      )
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setMessage('Cart is empty');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          cart_items: cart,
        }),
      });
      if (!response.ok) throw new Error('Checkout failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${Date.now()}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Checkout successful! Invoice downloaded.');
      setCart([]);
      getInventory();
    } catch (error) {
      setMessage('Checkout error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const gst = subtotal * 0.18;
    const additionalTax = subtotal * 0.02;
    const total = subtotal + gst + additionalTax;
    return { subtotal, gst, additionalTax, total };
  };

  const totals = calculateTotal();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🏪 POS Inventory System</h1>

      {message && (
        <div
          style={{
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            color: '#2e7d32',
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Inventory Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>📦 Available Products</h2>
            <button
              onClick={getInventory}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ margin: '15px 0' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
          </div>

          {/* Inventory Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '15px',
              marginTop: '15px',
            }}
          >
            {filteredItems.map((item) => (
              <div
                key={item.pid}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{item.name}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>Price: ₹{item.price}</p>
                <p style={{ margin: '5px 0', color: item.quantity > 0 ? '#4caf50' : '#f44336' }}>
                  Stock: {item.quantity}
                </p>
                <button
                  onClick={() => addToCart(item)}
                  disabled={item.quantity === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    backgroundColor: item.quantity > 0 ? '#4caf50' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: item.quantity > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold',
                  }}
                >
                  {item.quantity > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div>
          <h2>🛒 Shopping Cart</h2>
          <div
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              backgroundColor: '#fff',
              minHeight: '400px',
            }}
          >
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>Cart is empty</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.pid}
                    style={{
                      borderBottom: '1px solid #eee',
                      padding: '10px 0',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{item.name}</strong>
                      <button
                        onClick={() => removeFromCart(item.pid)}
                        style={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                      <button
                        onClick={() => updateCartQuantity(item.pid, item.quantity - 1)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.pid, item.quantity + 1)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                      <span style={{ marginLeft: 'auto' }}>₹{item.subtotal}</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '5px 0' }}>
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '5px 0',
                      fontSize: '14px',
                      color: '#666',
                    }}
                  >
                    <span>GST (18%):</span>
                    <span>₹{totals.gst.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '5px 0',
                      fontSize: '14px',
                      color: '#666',
                    }}
                  >
                    <span>Additional Tax (2%):</span>
                    <span>₹{totals.additionalTax.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '10px 0 15px 0',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#4caf50',
                    }}
                  >
                    <span>Total:</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                      Payment Method:
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                      }}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                    }}
                  >
                    {loading ? 'Processing...' : '💳 Checkout'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewBill;
