'use client'; // Next.js App Router এর জন্য এটি জরুরি

import { useEffect, useState } from 'react';

// ধরে নিচ্ছি gtm.js ফাইলটি lib ফোল্ডারে আছে
const gtmEvent = (eventName, eventData) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
};


const ProductLandingPage = () => {
  // UI State Management
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStarted, setCheckoutStarted] = useState(false);

  // ফর্মের ডেটা ম্যানেজ করার জন্য স্টেট
  const [customerDetails, setCustomerDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    postCode: '',
    country: 'BD',
    state: 'Dhaka' // GTM টেমপ্লেটে State ভ্যারিয়েবল আছে
  });
  const [shippingLocation, setShippingLocation] = useState('inside_dhaka');
  
  // প্রোডাক্টের বিবরণ
  const product = {
    id: 'BOOK_MKT_001',
    name: 'মার্কেটিং এর বই',
    brand: 'সেরা প্রকাশক',
    category: 'বই',
    category2: 'মার্কেটিং',
    variant: 'Paperback',
    price: 590.00,
  };

  // ১. view_item ইভেন্ট (পেজ লোড হলে) - এটি অপরিবর্তিত
  useEffect(() => {
    gtmEvent('view_item', {
      ecommerce: {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_brand: product.brand,
          item_category: product.category,
          item_category2: product.category2,
          item_variant: product.variant,
          price: product.price,
          quantity: 1
        }]
      }
    });
  }, []);

  // ২. add_to_cart ইভেন্ট - এটি অপরিবর্তিত
  const handleAddToCart = () => {
    gtmEvent('add_to_cart', {
      ecommerce: {
        currency: 'BDT',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1
        }]
      }
    });
    setShowCheckout(true);
  };
  
  // ৩. begin_checkout ইভেন্ট - এটি অপরিবর্তিত
  const handleBeginCheckout = () => {
    if (!checkoutStarted) {
      gtmEvent('begin_checkout', {
        ecommerce: {
          currency: 'BDT',
          value: product.price,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity: 1
          }]
        }
      });
      setCheckoutStarted(true);
    }
  };

  const handleInputChange = (e) => {
    setCustomerDetails({ ...customerDetails, [e.target.name]: e.target.value });
  };
  
  // ৪. purchase ইভেন্ট (আপনার GTM টেমপ্লেট অনুযায়ী পরিবর্তিত)
  const handlePurchase = (e) => {
    e.preventDefault();
    const shippingCost = shippingLocation === 'inside_dhaka' ? 60 : 99;
    const totalValue = product.price + shippingCost;
    const transactionId = `TXN-${Date.now()}`;

    // dataLayer-কে আপনার GTM ভ্যারিয়েবলের গঠন অনুযায়ী সাজানো হয়েছে
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'purchase',
      
      // *** মূল পরিবর্তন এখানে ***
      // কাস্টমারের তথ্য GTM ভ্যারিয়েবলের নাম অনুযায়ী top-level এ দেওয়া হয়েছে
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
      
      // ecommerce অবজেক্ট আগের মতোই আছে, কারণ আপনার GTM এটি এভাবেই পড়ছে
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
          item_brand: product.brand,
          item_category: product.category,
          price: product.price,
          quantity: 1
        }],
      }
    });
    
    // Developer Console এ ডেটা পরীক্ষা করার জন্য
    console.log('Final Data pushed to dataLayer:', window.dataLayer[window.dataLayer.length - 1]);

    alert('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
  };
  
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{product.name}</h1>
      <p>একটি দারুণ মার্কেটিং বই যা আপনার ব্যবসা বদলে দেবে।</p>
      <h2>দাম: ৳{product.price}</h2>

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