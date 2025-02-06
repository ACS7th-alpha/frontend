// app/signup/form.js
'use client';

import { useSession, signIn } from 'next-auth/react'; // ✅ signIn 추가
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ChildInput from './childInput';

export default function Form({ session }) {
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || '');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [nickname, setNickname] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [children, setChildren] = useState([
    { name: '', gender: '', birthdate: '' },
  ]);

  const addChild = () =>
    setChildren([...children, { name: '', gender: '', birthdate: '' }]);
  const removeChild = (index) =>
    setChildren(children.filter((_, i) => i !== index));
  const updateChild = (index, key, value) => {
    const updatedChildren = [...children];
    updatedChildren[index][key] = value;
    setChildren(updatedChildren);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const requestBody = {
      user: {
        googleId: session?.user?.googleId || '',
        email: email,
        name: name,
        photo: session?.user?.photo || '',
      },
      additionalInfo: {
        nickname,
        monthlyBudget: Number(monthlyBudget),
        children,
      },
    };

    try {
      console.log(
        '📤 회원가입 요청 데이터:',
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('✅ 회원가입 응답:', data);

      if (!response.ok || !data.access_token) {
        alert(`회원가입 실패: ${data.message}`);
        return;
      }

      // ✅ 회원가입 성공 후, 쿠키 삭제 및 메인 페이지 이동
      console.log('🔄 회원가입 성공! 메인 페이지로 이동');

      document.cookie =
        'signupRequired=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;';

      router.push('/');
    } catch (error) {
      console.error('🚨 회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">회원가입</h2>
      <form
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg"
        onSubmit={handleSignup}
      >
        <div className="grid grid-cols-1 gap-4 mb-4">
          <label className="block">
            이름:
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block">
            이메일:
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block">
            닉네임:
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block">
            월 예산:
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              required
            />
          </label>
        </div>

        <ChildInput
          children={children}
          addChild={addChild}
          removeChild={removeChild}
          updateChild={updateChild}
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          회원가입 완료
        </button>
      </form>
    </div>
  );
}
