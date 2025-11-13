// app/api/create-order/route.js

import { NextResponse } from 'next/server';

// এটি আপনার ব্যাকএন্ড। এখানে অর্ডার প্রসেস হবে।
export async function POST(request) {
  // ফ্রন্টএন্ড থেকে পাঠানো ডেটা এখানে পাওয়া যাবে
  const { product, customerDetails, shippingCost } = await request.json();

  // --- এখানে আপনার ডাটাবেজে অর্ডার সেভ করার লজিক থাকবে ---
  // --- পেমেন্ট গেটওয়েতে রিকোয়েস্ট পাঠানোর লজিকও এখানে থাকতে পারে ---
  
  // আমরা এখন একটি ডেমো/সিমুলেটেড অর্ডার ডেটা তৈরি করছি, যেমনটা ওয়ার্ডপ্রেস করে
  const orderNumber = Math.floor(1000 + Math.random() * 9000); // একটি ডেমো অর্ডার নাম্বার
  const total = product.price + shippingCost;
  
  // ওয়ার্ডপ্রেসের মতো একটি বিস্তারিত orderData অবজেক্ট তৈরি করা হচ্ছে
  const finalOrderData = {
    attributes: {
      order_number: orderNumber,
      order_key: `wc_order_${Math.random().toString(36).substring(2, 15)}`,
      payment_method: 'cod',
      payment_method_title: 'ক্যাশ অন ডেলিভারি',
      shipping_method: shippingCost === 60 ? 'ঢাকার ভিতরে' : 'ঢাকার বাহিরে',
      status: 'processing',
    },
    totals: {
      currency: 'BDT',
      shipping_total: shippingCost,
      total: total,
      subtotal: product.price,
    },
    customer: {
      billing: {
        first_name: customerDetails.firstName,
        last_name: customerDetails.lastName,
        address_1: customerDetails.address,
        city: customerDetails.city,
        state: customerDetails.state,
        postcode: customerDetails.postCode,
        country: customerDetails.country,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
    },
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        sku: product.id,
        price: product.price,
        item_category: product.category,
        quantity: 1,
      },
    ],
  };
  
  // এই চূড়ান্ত ডেটাটি ফ্রন্টএন্ডে ফেরত পাঠানো হচ্ছে
  return NextResponse.json({ success: true, orderData: finalOrderData });
}