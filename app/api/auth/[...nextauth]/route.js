//app/api/auth/[...nextauth]/route.js

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import {
  getSignupRequired,
  setSignupRequired,
} from '@/app/components/staticComponents';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt', // ✅ 세션이 아니라 JWT를 사용하여 자동 로그인 방지
    maxAge: 60 * 5, // ✅ 세션 유지 시간을 5분으로 제한
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('✅ OAuth 로그인 시도:', profile);

      const requestBody = {
        googleId: profile?.sub,
        email: user.email,
        name: user.name,
        photo: profile?.picture || '',
      };

      // 로그인 후, 세션에 저장될 값을 미리 준비
      user.googleId = profile?.sub;
      user.photo = profile?.picture;
      user.email = user.email;
      user.name = user.name;

      try {
        const response = await fetch(
          'http://localhost:3001/auth/google/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleId: profile.sub, // ✅ 수정된 부분
              email: user.email,
              name: user.name,
              photo: user.photo,
            }),
          }
        );

        const data = await response.json();
        console.log('✅ 백엔드 응답:', data);

        console.warn('⚠️ False로 바뀌나?', getSignupRequired());
        if (response.ok && data.access_token) {
          user.accessToken = data.access_token;
          user.refreshToken = data.refresh_token;
          return true;
        } else if (response.status === 401) {
          console.warn('⚠️ 유저 정보 없음, 회원가입 필요');

          user.signupRequired = true;
          return true;
        } else {
          console.error('❌ JWT 발급 실패:', data);
          return false;
        }
      } catch (error) {
        console.error('🚨 Google 로그인 중 오류 발생:', error);
        return true;
      }
    },

    async jwt({ token, user }) {
      //console.log('✅ 토큰 데이터 업데이트 전', token);

      if (user) {
        token.sub = user.googleId;
        token.accessToken = user.accessToken || null;
        token.refreshToken = user.refreshToken || null;
        token.signupRequired = user.signupRequired || false; // ✅ 회원가입 필요 플래그 저장
      }

      console.log('✅ 토큰 데이터 업데이트 후', token);
      return token;
    },

    async session({ session, token }) {
      //console.log('✅ 세션 데이터 업데이트 전', session);

      session.accessToken = token.accessToken || null;
      session.refreshToken = token.refreshToken || null;
      session.user.googleId = token.sub || null;
      session.user.photo = token.picture || null;
      session.user.email = token.email || null;
      session.user.name = token.name || null;
      session.user.signupRequired = token.signupRequired || false; // ✅ 회원가입 필요 플래그 유지
      console.log('✅ 세션 데이터 업데이트 후', session);
      return session;
    },
  },
  pages: {
    signIn: '/', // 기본 로그인 페이지
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
