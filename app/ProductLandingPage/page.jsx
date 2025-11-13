'use client';

import { useEffect, useState } from 'react';

const ProductLandingPage = () => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // লোডিং স্টেট
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '', lastName: '', phone: '', email: '', address: '', city: 'Dhaka', postCode: '', country: 'BD', state: 'Dhaka'
  });
  const [shippingLocation, setShippingLocation] = useState('inside_dhaka');
  
  const product = {
    id: 'BOOK_MKT_001', name: 'মার্কেটিং এর বই', brand: 'সেরা প্রকাশক', category: 'বই', price: 590.00,
  };
  
  useEffect(() => {
    // view_item ইভেন্টটি আগের মতোই কাজ করবে
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'view_item', ecommerce: { /* ... view_item ডেটা ... */ } });
  }, []);
  
  // handlePurchase ফাংশনটি এখন async হবে এবং API কল করবে
  const handlePurchase = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // লোডিং শুরু

    const shippingCost = shippingLocation === 'inside_dhaka' ? 60 : 99;
    
    try {
      // ধাপ ১: আমাদের তৈরি করা API তে অর্ডার ডেটা পাঠানো হচ্ছে
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, customerDetails, shippingCost }),
      });
      
      const result = await response.json();
      
      // ধাপ ২: API থেকে সফলভাবে ডেটা ফেরত এলে...
      if (result.success) {
        const orderData = result.orderData; // সার্ভার থেকে পাওয়া চূড়ান্ত অর্ডার ডেটা

        // ধাপ ৩: এখন ওয়ার্ডপ্রেসের মতো বিস্তারিত dataLayer পুশ করা হচ্ছে
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'purchase',
          // page related data (প্রয়োজনে হার্ডকোড করতে পারেন)
          pageTitle: 'Thank you page',
          pagePostType: 'custom_page',
          
          // সার্ভার থেকে পাওয়া কাস্টমার ও অর্ডার ডেটা
          customerBillingFirstName: orderData.customer.billing.first_name,
          customerBillingLastName: orderData.customer.billing.last_name,
          customerBillingPhone: orderData.customer.billing.phone,
          customerBillingEmail: orderData.customer.billing.email,
          customerBillingCity: orderData.customer.billing.city,
          orderData: orderData, // সম্পূর্ণ orderData অবজেক্ট
          
          // GA4 এর জন্য ecommerce অবজেক্ট
          ecommerce: {
            currency: 'BDT',
            transaction_id: orderData.attributes.order_number, // সার্ভার থেকে পাওয়া অর্ডার নাম্বার
            affiliation: 'আপনার ওয়েবসাইটের নাম',
            value: orderData.totals.total,
            tax: 0,
            shipping: orderData.totals.shipping_total,
            coupon: '',
            items: orderData.items,
          }
        });
        
        console.log("Final Purchase DataLayer Pushed:", window.dataLayer[window.dataLayer.length - 1]);
        alert('অর্ডার সফল হয়েছে! আপনার অর্ডার নাম্বার: ' + orderData.attributes.order_number);

      } else {
        throw new Error('Order creation failed');
      }
      
    } catch (error) {
      console.error('An error occurred:', error);
      alert('একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false); // লোডিং শেষ
    }
  };

  const handleInputChange = (e) => { setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value }); };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{product.name}</h1>
      <p>দাম: ৳{product.price}</p>
      
      {!showCheckout ? (
        <button onClick={() => setShowCheckout(true)}>এখনই অর্ডার করুন</button>
      ) : (
        <form onSubmit={handlePurchase} style={{ marginTop: '2rem' }}>
          <h3>অর্ডার করতে ফর্মটি পূরণ করুন:</h3>
          {/* ... আপনার সমস্ত ইনপুট ফিল্ড এখানে ... */}
          <input name="firstName" placeholder="First/Full Name" onChange={handleInputChange} required />
          <input type="tel" name="phone" placeholder="Phone Number" onChange={handleInputChange} required />
          {/* ... */}
          <select value={shippingLocation} onChange={(e) => setShippingLocation(e.target.value)}>
            <option value="inside_dhaka">ঢাকার ভিতরে (৳৬০)</option>
            <option value="outside_dhaka">ঢাকার বাহিরে (৳৯৯)</option>
          </select>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'প্রসেসিং...' : 'অর্ডার কনফার্ম করুন'}
          </button>
        </form>
      )}
    </main>
  );
};

export default ProductLandingPage;