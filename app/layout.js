'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';

// _app.js (또는 app/layout.js)
import { SessionProvider } from 'next-auth/react';
import localFont from 'next/font/local';
import './globals.css';

// const geistSans = localFont({
//   src: '../public/fonts/GeistVF.woff',
//   variable: '--font-geist-sans',
//   weight: '100 900',
// });

// const geistMono = localFont({
//   src: '../public/fonts/GeistMonoVF.woff',
//   variable: '--font-geist-mono',
//   weight: '100 900',
// });

export default function RootLayout({ children }) {
  // 클라이언트 ID를 직접 문자열로 입력
  const clientId =
    '140823084109-9phm7467tp421u96g73ffb4vtj4i6gg8.apps.googleusercontent.com';

  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>My App</title>
      </head>
      <body>
        <GoogleOAuthProvider clientId={clientId}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
