'use client';

import { useEffect, useState } from 'react';

// === GTM HELPER FUNCTION ===
const gtmEvent = (eventName, eventData = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...eventData });
  }
};

const ProductLandingPage = () => {
  // === STATE MANAGEMENT ===
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '', lastName: '', phone: '', email: '', address: '', city: 'Dhaka', postCode: '1216', country: 'BD', state: 'Dhaka'
  });
  const [shippingLocation, setShippingLocation] = useState('inside_dhaka');

  // *** নতুন এবং সবচেয়ে গুরুত্বপূর্ণ স্টেট ***
  // IP এবং User Agent স্টোর করার জন্য
  const [clientInfo, setClientInfo] = useState({
    ip: null,
    userAgent: null,
  });

  // === STATIC PRODUCT DATA ===
  const product = {
    id: 973, name: 'Profit First for F-Commerce', sku: 973, category: 'Books', price: 590.00,
  };

  // === DYNAMIC PAGE METADATA FUNCTION ===
  const generatePageMetadata = () => {
    // ... (আগের মতোই অপরিবর্তিত) ...
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      pageTitle: "Thank you page |", pagePostType: "cartflows_step", pagePostAuthor: "admin",
      pagePostDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      pagePostDateYear: now.getFullYear(), pagePostDateMonth: now.getMonth() + 1, pagePostDateDay: now.getDate(),
      pagePostDateDayName: days[now.getDay()], pagePostDateHour: now.getHours(), pagePostDateMinute: now.getMinutes(),
      pagePostDateIso: now.toISOString(), pagePostDateUnix: Math.floor(now.getTime() / 1000),
    };
  };

  // === INITIAL DATA FETCHING (Client Info & View Item) ===
  useEffect(() => {
    // শুধুমাত্র একবার ক্লায়েন্ট ইনফো এবং view_item ফায়ার হবে
    
    // User Agent সংগ্রহ করা
    const ua = navigator.userAgent;
    
    // IP Address সংগ্রহ করা
    const fetchIp = async () => {
      try {
        const response = await fetch('/api/ip');
        if (!response.ok) throw new Error('Failed to fetch IP');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error(error);
        return '0.0.0.0'; // Fallback IP
      }
    };

    const initializeTracking = async () => {
      const ip = await fetchIp();
      // State এ IP এবং User Agent সেভ করা হচ্ছে
      setClientInfo({ ip, userAgent: ua });

      // view_item ইভেন্টের সাথেও IP এবং User Agent পাঠানো হচ্ছে (ঐচ্ছিক কিন্তু ভালো প্র্যাকটিস)
      gtmEvent('view_item', {
        visitorIP: ip,
        browserName: ua,
        ecommerce: {
          currency: 'BDT', value: product.price, items: [{
            item_id: product.id, item_name: product.name, price: product.price,
            item_category: product.category, quantity: 1
          }]
        }
      });
    };

    initializeTracking();
  }, []);

  // === ECOMMERCE EVENT HANDLERS (Updated) ===

  const handleAddToCart = () => {
    gtmEvent('add_to_cart', {
      // *** ক্লায়েন্ট ইনফো যুক্ত করা হয়েছে ***
      visitorIP: clientInfo.ip,
      browserName: clientInfo.userAgent,
      ecommerce: {
        currency: 'BDT', value: product.price, items: [{
          item_id: product.id, item_name: product.name, price: product.price,
          item_category: product.category, quantity: 1
        }]
      }
    });
    setShowCheckout(true);
  };

  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent('begin_checkout', {
        // *** ক্লায়েন্ট ইনফো যুক্ত করা হয়েছে ***
        visitorIP: clientInfo.ip,
        browserName: clientInfo.userAgent,
        ecommerce: {
          currency: 'BDT', value: product.price, items: [{
            item_id: product.id, item_name: product.name, price: product.price,
            item_category: product.category, quantity: 1
          }]
        }
      });
      setCheckoutStarted(true);
    }
  };
  
  const handlePurchase = async (e) => {
    e.preventDefault();
    if (isSubmitting || !clientInfo.ip) { // IP লোড না হওয়া পর্যন্ত সাবমিট করতে দেবে না
      alert('অনুগ্রহ করে এক মুহূর্ত অপেক্ষা করুন...');
      return;
    }
    setIsSubmitting(true);

    const shippingInfo = shippingLocation === 'inside_dhaka' 
      ? { cost: 60, title: 'ঢাকার ভিতরে' } 
      : { cost: 99, title: 'ঢাকার বাহিরে' };
    
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, customerDetails, shippingInfo }),
      });
      
      const result = await response.json();
      
      if (result.success && result.orderData) {
        const orderDataFromServer = result.orderData;
        const pageMetadata = generatePageMetadata();
        
        gtmEvent('purchase', {
          ...pageMetadata,
          // *** ক্লায়েন্ট ইনফো যুক্ত করা হয়েছে ***
          visitorIP: clientInfo.ip,
          browserName: clientInfo.userAgent,

          // কাস্টমার এবং অর্ডার ডেটা
          customerBillingFirstName: orderDataFromServer.customer.billing.first_name,
          orderData: orderDataFromServer,
          ecommerce: {
            currency: 'BDT',
            transaction_id: orderDataFromServer.attributes.order_number.toString(),
            value: orderDataFromServer.totals.total,
            shipping: orderDataFromServer.totals.shipping_total,
            items: orderDataFromServer.items
          }
        });
        
        alert('অর্ডার সফল হয়েছে!');
      } else {
        throw new Error(result.error || 'Server error');
      }
      
    } catch (error) {
      console.error('Purchase Error:', error);
      alert('একটি সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  // === JSX / RENDER ===
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
        <h1>{product.name}</h1>
        <p>দাম: ৳{product.price}</p>
        
        {!showCheckout ? (
          <button onClick={handleAddToCart} style={{ padding: '10px 20px', fontSize: '1.2rem' }}>
            এখনই অর্ডার করুন
          </button>
        ) : (
          <form onSubmit={handlePurchase}>
             {/* ... আপনার সব ইনপুট ফিল্ড এখানে অপরিবর্তিত ... */}
             <input name="firstName" placeholder="আপনার সম্পূর্ণ নাম *" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
             {/* ... etc ... */}
            <button type="submit" disabled={isSubmitting || !clientInfo.ip}>
              {isSubmitting ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}
            </button>
          </form>
        )}
    </main>
  );
};

export default ProductLandingPage;