import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    // headers() ফাংশনটি সার্ভারে আসা রিকোয়েস্টের হেডারগুলো পড়ার সুযোগ দেয়
    const headersList = headers();

    // বিভিন্ন হোস্টিং প্ল্যাটফর্ম (যেমন Vercel, Netlify, Cloudflare) ক্লায়েন্টের আসল IP
    // 'x-forwarded-for' হেডারে রাখে। এটি সবচেয়ে নির্ভরযোগ্য উৎস।
    const forwardedFor = headersList.get('x-forwarded-for');
    
    // কিছু প্ল্যাটফর্ম 'x-real-ip' হেডারটিও ব্যবহার করে।
    const realIp = headersList.get('x-real-ip');

    // Next.js এর নিজস্ব 'request.ip' প্রপার্টি, যা সরাসরি কানেকশনের IP দেয়।
    // এটি লোকালহোস্টে '::1' বা '127.0.0.1' দেখাতে পারে।
    const requestIp = request.ip;

    // একটি নির্দিষ্ট ক্রমে ক্লায়েন্টের IP খোঁজা হবে:
    // 1. প্রথমে 'x-forwarded-for' চেক করা হবে। যদি একাধিক IP থাকে, প্রথমটিই আসল।
    // 2. যদি উপরেরটি না পাওয়া যায়, 'x-real-ip' চেক করা হবে।
    // 3. যদি দুটিই না থাকে, 'request.ip' ব্যবহার করা হবে।
    // 4. যদি কোনোটিই না পাওয়া যায় (যা প্রায় অসম্ভব), তাহলে লোকালহোস্টের IP ফলব্যাক হিসেবে ব্যবহৃত হবে।
    const ip = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : realIp || requestIp || '127.0.0.1';

    // সফলভাবে পাওয়া IP অ্যাড্রেসটি JSON ফরম্যাটে রেসপন্স হিসেবে পাঠানো হচ্ছে।
    return NextResponse.json({ ip });
    
  } catch (error) {
    // যদি কোনো অপ্রত্যাশিত সমস্যা হয়, তাহলে সেটি লগ করা হবে
    console.error("IP API Error:", error);
    
    // এবং একটি ডিফল্ট ফলব্যাক IP সহ একটি সার্ভার এরর রেসপন্স পাঠানো হবে।
    return NextResponse.json({ ip: '0.0.0.0' }, { status: 500 });
  }
}