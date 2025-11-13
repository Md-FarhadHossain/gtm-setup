import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request) {
  const headersList = headers();
  
  // Vercel বা অন্যান্য হোস্টিং প্রোভাইডার থেকে আসল IP অ্যাড্রেস পাওয়া যায়
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';

  return NextResponse.json({ ip });
}