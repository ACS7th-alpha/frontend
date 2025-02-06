// ✅ 클라이언트 환경 확인 후 localStorage 사용
export function getSignupRequired() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('signupRequired') === 'true';
  }
  return false;
}

export function setSignupRequired(value) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('signupRequired', value.toString());
  }
}
