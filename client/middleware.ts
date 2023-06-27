import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {AuthService} from "@/api";

export async function middleware(request: NextRequest) {

    if (request.nextUrl.pathname.startsWith('/history') || request.nextUrl.pathname.startsWith('/facematch')) {
        const isAuth =  await AuthService.checkAuthMiddleware(request)

        if (!isAuth) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith('/auth')) {
        const isAuth =  await AuthService.checkAuthMiddleware(request)

        if (isAuth) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }
}