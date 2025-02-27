import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const hasAuthCookie = req.cookies.has('poker_auth');
  
  if (hasAuthCookie) {
    return new NextResponse(null, { status: 200 });
  }
  
  return new NextResponse(null, { status: 401 });
}