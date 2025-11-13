'use client';

import { useEffect, useState } from 'react';

// === GTM HELPER FUNCTION ===
// ডেটা লেয়ারে ইভেন্ট পাঠানোর জন্য একটি সহজ ফাংশন
const gtmEvent = (eventName, eventData = {}) => {
  // নিশ্চিত করা হচ্ছে যে কোডটি শুধুমাত্র ক্লায়েন্ট-সাইডে (ব্রাউজারে) চলছে
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...eventData });
  }
};

const ProductLandingPage = () => {
  // === STATE MANAGEMENT ===
  // UI এবং ফর্মের ডেটা নিয়ন্ত্রণের জন্য স্টেট
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ফর্ম সাবমিটের সময় লোডিং দেখানোর জন্য
  const [checkoutStarted, setCheckoutStarted] = useState(false); // begin_checkout ইভেন্ট যেন একবারই ফায়ার হয়
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '', // लास्ट नेम ঐচ্ছিক রাখা হয়েছে
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    postCode: '1216', // একটি ডিফল্ট পোস্টকোড
    country: 'BD',
    state: 'Dhaka'
  });
  const [shippingLocation, setShippingLocation] = useState('inside_dhaka');

  // === STATIC PRODUCT DATA ===
  // ওয়ার্ডপ্রেসের ডেটার সাথে মিলিয়ে প্রোডাক্টের তথ্য সেট করা হয়েছে
  const product = {
    id: 973,
    name: 'Profit First for F-Commerce',
    sku: 973,
    brand: 'সেরা প্রকাশক',
    category: 'Books',
    price: 590.00,
    google_business_vertical: 'retail',
    stockstatus: 'instock',
  };

  // === DYNAMIC PAGE METADATA (to mimic WordPress) ===
  // ওয়ার্ডপ্রেসের মতো পেজের বিস্তারিত তথ্য তৈরি করার জন্য একটি ফাংশন
  const generatePageMetadata = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      pageTitle: "Thank you page |",
      pagePostType: "cartflows_step",
      pagePostType2: "single-cartflows_step",
      pagePostAuthor: "admin",
      pagePostDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      pagePostDateYear: now.getFullYear(),
      pagePostDateMonth: now.getMonth() + 1,
      pagePostDateDay: now.getDate(),
      pagePostDateDayName: days[now.getDay()],
      pagePostDateHour: now.getHours(),
      pagePostDateMinute: now.getMinutes(),
      pagePostDateIso: now.toISOString(),
      pagePostDateUnix: Math.floor(now.getTime() / 1000),
    };
  };

  // === ECOMMERCE EVENTS ===

  // 1. view_item: পেজটি প্রথমবার লোড হওয়ার সাথে সাথে ফায়ার হবে
  useEffect(() => {
    gtmEvent('view_item', {
      ecommerce: {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          sku: product.sku,
          price: product.price,
          item_category: product.category,
          quantity: 1
        }]
      }
    });
  }, []); // খালি array নিশ্চিত করে যে এটি শুধুমাত্র একবারই রান হবে

  // 2. add_to_cart: "অর্ডার করুন" বাটনে ক্লিক করলে ফায়ার হবে
  const handleAddToCart = () => {
    gtmEvent('add_to_cart', {
      ecommerce: {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          sku: product.sku,
          price: product.price,
          item_category: product.category,
          quantity: 1
        }]
      }
    });
    setShowCheckout(true);
  };

  // 3. begin_checkout: ব্যবহারকারী যখন ফর্মে তথ্য দেওয়া শুরু করবেন
  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent('begin_checkout', {
        ecommerce: {
          currency: 'BDT',
          value: product.price,
          items: [{
            item_id: product.id,
            item_name: product.name,
            sku: product.sku,
            price: product.price,
            item_category: product.category,
            quantity: 1
          }]
        }
      });
      setCheckoutStarted(true);
    }
  };
  
  // 4. purchase: ফর্ম সাবমিট করার পর API থেকে সফল রেসপন্স এলে ফায়ার হবে
  const handlePurchase = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // যদি 이미 সাবমিট হতে থাকে, তাহলে আবার হতে দেবে না
    setIsSubmitting(true);

    const shippingInfo = shippingLocation === 'inside_dhaka' 
      ? { cost: 60, title: 'ঢাকার ভিতরে' } 
      : { cost: 99, title: 'ঢাকার বাহিরে' };
    
    try {
      // ব্যাকএন্ড API-তে অর্ডার তৈরি করার জন্য রিকোয়েস্ট পাঠানো হচ্ছে
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, customerDetails, shippingInfo }),
      });
      
      const result = await response.json();
      
      if (result.success && result.orderData) {
        const orderDataFromServer = result.orderData;
        const pageMetadata = generatePageMetadata(); // Purchase-এর মুহূর্তে ডাইনামিক পেজ ডেটা তৈরি করা
        
        // --- চূড়ান্ত এবং বিস্তারিত Data Layer পুশ করা হচ্ছে ---
        gtmEvent('purchase', {
          // --- ওয়ার্ডপ্রেসের মতো পেজ-সম্পর্কিত সকল তথ্য ---
          ...pageMetadata,

          // --- কাস্টমার ও অর্ডার সম্পর্কিত সকল তথ্য (সার্ভার থেকে প্রাপ্ত) ---
          customerBillingFirstName: orderDataFromServer.customer.billing.first_name,
          customerBillingLastName: orderDataFromServer.customer.billing.last_name,
          customerBillingPhone: orderDataFromServer.customer.billing.phone,
          customerBillingEmail: orderDataFromServer.customer.billing.email,
          customerBillingAddress1: orderDataFromServer.customer.billing.address_1,
          customerBillingCity: orderDataFromServer.customer.billing.city,
          orderData: orderDataFromServer,
          new_customer: false, // এটি ডাইনামিকভাবে নির্ধারণ করতে পারেন
          
          // --- স্ট্যান্ডার্ড GA4 ই-কমার্স অবজেক্ট ---
          ecommerce: {
            currency: orderDataFromServer.totals.currency,
            transaction_id: orderDataFromServer.attributes.order_number.toString(),
            affiliation: 'আপনার ওয়েবসাইটের নাম',
            value: orderDataFromServer.totals.total,
            tax: 0,
            shipping: orderDataFromServer.totals.shipping_total,
            coupon: '',
            items: orderDataFromServer.items.map(item => ({ ...item })), // আইটেমের একটি কপি পাঠানো হচ্ছে
          }
        });
        
        alert('অর্ডার সফল হয়েছে! আপনার অর্ডার নাম্বার: ' + orderDataFromServer.attributes.order_number);
        // প্রয়োজনে অন্য কোনো পেজে রিডাইরেক্ট করতে পারেন
        // window.location.href = '/thank-you';

      } else {
        throw new Error(result.error || 'Order creation failed on server');
      }
      
    } catch (error) {
      console.error('An error occurred during purchase:', error);
      alert('একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false); // লোডিং স্টেট রিসেট
    }
  };

  // ফর্মের ইনপুট পরিবর্তনের জন্য হ্যান্ডলার
  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h1>{product.name}</h1>
        <p>দাম: ৳{product.price}</p>
        
        {!showCheckout ? (
          <button onClick={handleAddToCart} style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer' }}>
            এখনই অর্ডার করুন
          </button>
        ) : (
          <form onSubmit={handlePurchase} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3>অর্ডার করতে ফর্মটি পূরণ করুন:</h3>
            
            <input name="firstName" placeholder="আপনার সম্পূর্ণ নাম *" onFocus={handleBeginCheckout} onChange={handleInputChange} required style={{padding: '10px'}}/>
            <input type="tel" name="phone" placeholder="আপনার ফোন নম্বর *" onFocus={handleBeginCheckout} onChange={handleInputChange} required style={{padding: '10px'}}/>
            <input type="email" name="email" placeholder="আপনার ইমেইল (ঐচ্ছিক)" onFocus={handleBeginCheckout} onChange={handleInputChange} style={{padding: '10px'}}/>
            <textarea name="address" placeholder="আপনার সম্পূর্ণ ঠিকানা *" onFocus={handleBeginCheckout} onChange={handleInputChange} required style={{padding: '10px', minHeight: '80px'}}/>
            <input name="city" placeholder="শহর *" defaultValue="Dhaka" onFocus={handleBeginCheckout} onChange={handleInputChange} required style={{padding: '10px'}}/>
            
            <select value={shippingLocation} onChange={(e) => setShippingLocation(e.target.value)} style={{padding: '10px'}}>
              <option value="inside_dhaka">ঢাকার ভিতরে (ডেলিভারি চার্জ ৳৬০)</option>
              <option value="outside_dhaka">ঢাকার বাহিরে (ডেলিভারি চার্জ ৳৯৯)</option>
            </select>
  
            <button type="submit" disabled={isSubmitting} style={{ padding: '15px 20px', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: isSubmitting ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
              {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ProductLandingPage;