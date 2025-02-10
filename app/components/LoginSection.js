'use client';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginSection({ onSuccess }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          환영합니다
        </h1>
        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={() => {
                console.error('Login Failed');
              }}
              useOneTap={false}
              theme="filled_black"
              text="signin_with"
              shape="rectangular"
              locale="ko"
              width="300"
              context="signin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
