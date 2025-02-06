// app/signup/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { setSignupRequired } from '@/app/components/staticComponents';
import Form from './form';

export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('✅ 회원가입 완료 후 / 초기화');
      setSignupRequired(false);
    }
  }, [status]);
  return <Form session={session} />;
}




