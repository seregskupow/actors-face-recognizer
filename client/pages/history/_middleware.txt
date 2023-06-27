import { AuthService } from '@/api';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('USER')
  if (!(await AuthService.checkAuthMiddleware(req))) {
    return NextResponse.redirect('/auth/login');
  }
  return NextResponse.next();
}
