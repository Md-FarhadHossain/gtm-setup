'use client'; // Next.js App Router এর জন্য এটি জরুরি

import { useEffect, useState } from 'react';
import { gtmEvent } from '../lib/gtm'; // helper ফাংশন ইম্পোর্ট করুন

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
    city: 'Dhaka', // Default City
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

  // ১. view_item ইভেন্ট (পেজ লোড হলে)
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
  }, []); // [] মানে এই ইফেক্ট শুধুমাত্র একবার রান হবে

  // ২. add_to_cart ইভেন্ট ("অর্ডার করুন" বাটনে ক্লিক করলে)
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
    setShowCheckout(true); // চেকআউট ফর্মটি দেখান
  };
  
  // ৩. begin_checkout ইভেন্ট (ফর্ম পূরণ শুরু করলে)
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
  
  // ৪. purchase ইভেন্ট (ফর্ম সাবমিট করলে)
  const handlePurchase = (e) => {
    e.preventDefault();
    const shippingCost = shippingLocation === 'inside_dhaka' ? 60 : 99;
    const totalValue = product.price + shippingCost;
    const transactionId = `TXN-${Date.now()}`;

    gtmEvent('purchase', {
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
        // ঐচ্ছিক: Enhanced Conversions এর জন্য কাস্টমার ডেটা
        user_data: {
          email: customerDetails.email,
          phone_number: customerDetails.phone,
          address: {
            first_name: customerDetails.firstName,
            last_name: customerDetails.lastName,
            street: customerDetails.address,
            city: customerDetails.city,
            country: 'BD'
          }
        }
      }
    });
    
    alert('আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!');
    // এখানে আপনি API তে ডেটা পাঠানোর কোড লিখবেন
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