'use client'; 

import { useEffect, useState } from 'react';

const gtmEvent = (eventName, eventData) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
};

const ProductLandingPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);

  // নতুন স্টেট: ক্লায়েন্টের IP এবং User Agent স্টোর করার জন্য
  const [clientInfo, setClientInfo] = useState({ ip: '', userAgent: '' });

  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    postCode: '',
    country: 'BD',
    state: 'Dhaka'
  });
  const [shippingLocation, setShippingLocation] = useState('inside_dhaka');
  
  const product = { /* ... আপনার প্রোডাক্টের তথ্য অপরিবর্তিত ... */ };

  // নতুন useEffect: পেজ লোড হওয়ার সাথে সাথে IP এবং User Agent সংগ্রহ করবে
  useEffect(() => {
    // User Agent সেট করা
    setClientInfo(prev => ({ ...prev, userAgent: navigator.userAgent }));

    // IP অ্যাড্রেসের জন্য API কল করা
    const fetchIp = async () => {
      try {
        const response = await fetch('/api/ip');
        const data = await response.json();
        setClientInfo(prev => ({ ...prev, ip: data.ip }));
      } catch (error) {
        console.error('Error fetching IP:', error);
        setClientInfo(prev => ({ ...prev, ip: '0.0.0.0' })); // fallback
      }
    };
    
    fetchIp();
  }, []);
  
  // view_item, add_to_cart, begin_checkout ইভেন্টগুলো অপরিবর্তিত থাকবে
  useEffect(() => { /* view_item এর কোড এখানে অপরিবর্তিত থাকবে */ }, []);
  const handleAddToCart = () => { /* add_to_cart এর কোড এখানে অপরিবর্তিত থাকবে */ };
  const handleBeginCheckout = () => { /* begin_checkout এর কোড এখানে অপরিবর্তিত থাকবে */ };

  // ... (বাকি ফাংশন যেমন handleInputChange অপরিবর্তিত থাকবে)
  const handleInputChange = (e) => { setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value }); };

  // ৪. purchase ইভেন্ট (IP এবং User Agent সহ চূড়ান্ত আপডেট)
  const handlePurchase = (e) => {
    e.preventDefault();
    const shippingCost = shippingLocation === 'inside_dhaka' ? 60 : 99;
    const totalValue = product.price + shippingCost;
    const transactionId = `TXN-${Date.now()}`;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      
      // *** আপনার GTM টেমপ্লেট অনুযায়ী ডেটা যুক্ত করা হয়েছে ***
      customerBillingFirstName: customerDetails.firstName,
      customerBillingLastName: customerDetails.lastName,
      customerBillingEmail: customerDetails.email,
      customerBillingCity: customerDetails.city,
      customerBillingPostcode: customerDetails.postCode,
      customerBillingCountry: customerDetails.country,
      customerBillingState: customerDetails.state,

      orderData: {
          customer: {
              billing: {
                  phone: customerDetails.phone
              }
          }
      },

      // *** নতুন দুটি কী (key) যুক্ত করা হয়েছে ***
      visitorIP: clientInfo.ip, // আপনার GTM এটিকে DLV-Client IP Address হিসেবে ধরবে
      browserName: clientInfo.userAgent, // আপনার GTM এটিকে DLV-Client User Agent হিসেবে ধরবে
      
      // ecommerce অবজেক্ট অপরিবর্তিত
      ecommerce: {
        transaction_id: transactionId,
        affiliation: 'আপনার ওয়েবসাইটের নাম',
        value: totalValue,
        tax: 0,
        shipping: shippingCost,
        currency: 'BDT',
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1
        }],
      }
    });
    
    console.log('Final Data pushed to dataLayer:', window.dataLayer[window.dataLayer.length - 1]);
    alert('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
  };
  
  return (
    // ... আপনার JSX বা HTML কোড এখানে অপরিবর্তিত থাকবে
    <main style={{ padding: '2rem' }}>
      <h1>{product.name}</h1>
      {!showCheckout ? (
        <button onClick={handleAddToCart}>এখনই অর্ডার করুন</button>
      ) : (
        <form onSubmit={handlePurchase} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          {/* ... আপনার সমস্ত ইনপুট ফিল্ড অপরিবর্তিত থাকবে ... */}
          <input name="firstName" placeholder="First Name" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          <input name="phone" placeholder="Phone Number" onFocus={handleBeginCheckout} onChange={handleInputChange} required />
          {/* ... */}
          <button type="submit">অর্ডার কনফার্ম করুন</button>
        </form>
      )}
    </main>
  );
};

export default ProductLandingPage;