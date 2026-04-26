import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    try {
      // Matches your backend route: POST /api/auth/login
      const res = await api.post('/auth/login', { email, password });
      login(res.data.data.token);
      toast.success('Welcome back!');
      navigate('/my-learning');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // FRONTEND FIX: Sending the correct 'idToken' to the correct backend route
      const res = await api.post('/auth/google', { 
        idToken: credentialResponse.credential 
      });
      login(res.data.data.token);
      toast.success('Successfully logged in with Google!');
      navigate('/my-learning');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-zinc-50 mb-6 text-center tracking-tight">Welcome Back</h2>
        
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            Sign In
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="mx-4 text-sm text-zinc-500">or continue with</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Auth Failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
          />
        </div>

        <p className="mt-6 text-center text-zinc-400 text-sm">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</Link>
        </p>
      </div>
    </div>
  );
}