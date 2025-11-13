'use client';

import { useEffect, useState } from 'react';

// GTM Helper ফাংশন
const gtmEvent = (eventName, eventData = {}) => {
  // নিশ্চিত করুন কোডটি শুধুমাত্র ব্রাউজারে রান হচ্ছে
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...eventData,
    });
  }
};

const ProductLandingPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '', lastName: '', phone: '', email: '', address: '', city: 'Dhaka', postCode: '', country: 'BD', state: 'Dhaka'
  });
  const [shippingLocation, setShippingLocation] = useState('inside_dhaka');
  
  const product = {
    id: 'BOOK_MKT_001', name: 'মার্কেটিং এর বই', brand: 'সেরা প্রকাশক', category: 'বই', category2: 'মার্কেটিং', variant: 'Paperback', price: 590.00,
  };

  // *** মূল পরিবর্তন এখানে ***
  // পেজ লোড হওয়ার সাথে সাথেই ক্লায়েন্টের তথ্য dataLayer-এ পাঠানো হবে
  useEffect(() => {
    const setClientInfo = async () => {
      try {
        const response = await fetch('/api/ip');
        const data = await response.json();
        
        // IP ও User Agent পাওয়ার সাথে সাথে dataLayer এ পুশ করা হচ্ছে
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          'event': 'client_info_ready', // এটি একটি কাস্টম ইভেন্ট, GTM-এ এটি দেখতে পাবেন
          'visitorIP': data.ip,
          'browserName': navigator.userAgent,
        });

      } catch (error) {
        console.error('Failed to set client info:', error);
      }
    };

    setClientInfo();

    // view_item ইভেন্ট ফায়ার করা হচ্ছে
    gtmEvent('view_item', {
      ecommerce: {
        currency: 'BDT', value: product.price, items: [{
          item_id: product.id, item_name: product.name, item_brand: product.brand,
          item_category: product.category, price: product.price, quantity: 1
        }]
      }
    });

  }, []); // [] মানে এই ইফেক্ট শুধুমাত্র একবার রান হবে

  const handleAddToCart = () => {
    gtmEvent('add_to_cart', {
      ecommerce: { currency: 'BDT', value: product.price, items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }] }
    });
    setShowCheckout(true);
  };

  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent('begin_checkout', {
        ecommerce: { currency: 'BDT', value: product.price, items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: 1 }] }
      });
      setCheckoutStarted(true);
    }
  };

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  // purchase ইভেন্ট (এখন অনেক সহজ)
  const handlePurchase = (e) => {
    e.preventDefault();
    const shippingCost = shippingLocation === 'inside_dhaka' ? 60 : 99;
    const totalValue = product.price + shippingCost;
    const transactionId = `TXN-${Date.now()}`;

    // IP বা User Agent এখানে পাঠানোর আর দরকার নেই, কারণ GTM এটি আগেই পেয়ে গেছে
    gtmEvent('purchase', {
      customerBillingFirstName: customerDetails.firstName,
      customerBillingLastName: customerDetails.lastName,
      customerBillingEmail: customerDetails.email,
      customerBillingCity: customerDetails.city,
      customerBillingPostcode: customerDetails.postCode,
      customerBillingCountry: customerDetails.country,
      customerBillingState: customerDetails.state,
      orderData: { customer: { billing: { phone: customerDetails.phone } } },
      ecommerce: {
        transaction_id: transactionId, affiliation: 'আপনার ওয়েবসাইটের নাম', value: totalValue, tax: 0, shipping: shippingCost, currency: 'BDT',
        items: [{ item_id: product.id, item_name: product.name, item_brand: product.brand, item_category: product.category, price: product.price, quantity: 1 }],
      }
    });

    console.log('Purchase Event Fired. Check GTM Preview.');
    alert('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{product.name}</h1>
      <p>দাম: ৳{product.price}</p>
      {!showCheckout ? (
        <button onClick={handleAddToCart} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>
          এখনই অর্ডার করুন
        </button>
      ) : (
        <form onSubmit={handlePurchase} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <h3>অর্ডার করতে ফর্মটি পূরণ করুন:</h3>
          <input name="firstName" placeholder="First Name" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <input name="lastName" placeholder="Last Name" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Email Address" onFocus={handleBeginCheckout} onChange={handleInputChange} />
          <textarea name="address" placeholder="Full Address" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <input name="city" placeholder="City" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <input name="postCode" placeholder="Postal Code" onFocus={handleBeginCheckout} onChange={handleInputChange} />
          <input name="state" placeholder="State/Division" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <select value={shippingLocation} onChange={(e) => setShippingLocation(e.target.value)}>
            <option value="inside_dhaka">ঢাকার ভিতরে (ডেলিভারি চার্জ ৳৬০)</option>
            <option value="outside_dhaka">ঢাকার বাহিরে (ডেলিভারি চার্জ ৳৯৯)</option>
          </select>
          <button type="submit" style={{ padding: '10px 20px', fontSize: '1rem' }}>
            অর্ডার কনফার্ম করুন
          </button>
        </form>
      )}
    </main>
  );
};

export default ProductLandingPage;