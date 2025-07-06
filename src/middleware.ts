import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (origin && !origin.includes('localhost:3000')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
