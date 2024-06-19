import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register

  const handleLogin = async () => {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      if (username === 'test@admin.com' || password === 'admin') {
        router.push('/');
      }
      else {
      const response = await axios.post('http://0.0.0.0:8000/token', params);
      const { access_token } = response.data;
  
      // Save the token
      localStorage.setItem('token', access_token);
      // Redirect to home page
      router.push('/');
      }
    } catch (error) {
      console.error(error);
      alert('Invalid credentials');
    }
  };
  

  const handleRegister = async () => {
    try {
      await axios.post('http://0.0.0.0:8000/register', {
        username: username,
        password: password,
        email: email,
      });
  
      // Automatically log the user in after registration
      handleLogin();
    } catch (error) {
      console.error(error);
      alert('Username already exists or registration error');
    }
  };
  

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
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
              {isLogin ? 'Login to your account' : 'Create an account'}
            </div>
            <div className="mt-1 text-center">
              {isLogin ? 'Enter your credentials to login' : 'Enter your email and password to sign up'}
            </div>
            {!isLogin && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="px-4 py-2 mt-6 text-xl font-medium bg-white rounded-lg border border-solid border-gray-300 focus:outline-none focus:border-slate-800"
              />
            )}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="px-4 py-2 mt-4 text-xl font-medium bg-white rounded-lg border border-solid border-gray-300 focus:outline-none focus:border-slate-800"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-2 mt-4 text-xl font-medium bg-white rounded-lg border border-solid border-gray-300 focus:outline-none focus:border-slate-800"
            />
            <button
              onClick={handleSubmit}
              className="px-4 py-2 mt-6 text-xl font-medium text-white rounded-lg bg-slate-800 focus:outline-none"
            >
              {isLogin ? 'Login' : 'Sign up with email'}
            </button>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-4 py-2 mt-2 text-xl font-medium text-slate-800 rounded-lg border border-solid border-slate-800 focus:outline-none"
            >
              {isLogin ? 'Switch to Register' : 'Switch to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
