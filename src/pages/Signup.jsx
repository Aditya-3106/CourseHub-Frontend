import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleStandardSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { name, email, password });
      // FRONTEND FIX: Backend doesn't send token on signup. Just redirect to login.
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google', { 
        idToken: credentialResponse.credential 
      });
      // Google Auth from backend returns a token, so we can auto-login here
      login(res.data.data.token);
      toast.success('Account created with Google!');
      navigate('/my-learning');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-zinc-50 mb-6 text-center tracking-tight">Create Account</h2>
        
        <form onSubmit={handleStandardSignup} className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={name} onChange={(e) => setName(e.target.value)} required
          />
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            Sign Up
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="mx-4 text-sm text-zinc-500">or</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="rectangular" size="large" />
        </div>

        <p className="mt-6 text-center text-zinc-400 text-sm">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}