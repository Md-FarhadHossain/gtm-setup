// app/api/ip/route.js

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request) {
  const headersList = headers();
  
  // Vercel বা অন্যান্য হোস্টিং প্রোভাইডারের জন্য সঠিক হেডার থেকে IP নেওয়া হয়
  const ip = headersList.get('x-forwarded-for') || request.ip || '127.0.0.1';

  return NextResponse.json({ ip });
}