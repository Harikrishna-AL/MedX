import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email === 'test@domain.com' && password === 'password') {
      // Save authentication state
      localStorage.setItem('authenticated', 'true');
      // Redirect to home page
      router.push('/');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="bg-white min-h-screen flex justify-center items-center">
      <div className="max-w-screen-xl w-full flex p-5">
        <div className="w-1/2 max-md:hidden">
          <img
            loading="lazy"
            src="/assets/x-rays-of-hand-vector.jpg"
            alt="X-rays of hand"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col w-1/2 max-md:w-full ml-8">
          <div className="flex flex-col px-5 my-auto">
            <div className="text-2xl font-semibold tracking-tight text-center">
              Create an account
            </div>
            <div className="mt-1 text-center">
              Enter your email and password to sign up
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="px-4 py-2 mt-6 text-xl font-medium bg-white rounded-lg border border-solid border-gray-300 focus:outline-none focus:border-slate-800"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-2 mt-4 text-xl font-medium bg-white rounded-lg border border-solid border-gray-300 focus:outline-none focus:border-slate-800"
            />
            <button
              onClick={handleLogin}
              className="px-4 py-2 mt-6 text-xl font-medium text-white rounded-lg bg-slate-800 focus:outline-none"
            >
              Sign up with email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
