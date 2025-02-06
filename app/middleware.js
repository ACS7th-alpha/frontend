import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const signupRequired = req.cookies.get('signupRequired')?.value;

  if (signupRequired === 'true' && url.pathname !== '/signup') {
    console.warn('⚠️ Middleware: 회원가입 페이지로 리디렉트 실행');
    url.pathname = '/signup';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/signup'],
};

// import { NextResponse } from 'next/server';

// export function middleware(req) {
//   const url = req.nextUrl.clone();
//   const signupRequired = req.cookies.get('signupRequired')?.value;

//   if (signupRequired === 'true' && url.pathname !== '/signup') {
//     console.warn('⚠️ Middleware: 회원가입 페이지로 리디렉트 실행');
//     url.pathname = '/signup';
//     return NextResponse.redirect(url);
//   }

//   // ✅ 세션 쿠키 설정 (브라우저 종료 시 삭제)
//   const response = NextResponse.next();
//   response.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' });
//   response.cookies.set('next-auth.csrf-token', '', { maxAge: 0, path: '/' });
//   response.cookies.set('signupRequired', '', { maxAge: 0, path: '/' });

//   return response;
// }

// export const config = {
//   matcher: ['/', '/signup'],
// };
