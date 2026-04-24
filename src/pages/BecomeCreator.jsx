import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function BecomeCreator() {
  const { setCreatorId } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ handle: '', brandName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // POST /api/creator/create → { success, message, data: creator }
      // Body: { handle (lowercase alphanumeric/_), brandName (optional) }
      const res = await api.post('/creator/create', {
        handle: form.handle,
        brandName: form.brandName || undefined,
      });
      // Update the creatorId in global auth state so requireCreator routes work
      setCreatorId(res.data.data.id);
      navigate('/creator');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create creator profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg glass-card p-10 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Become a Creator</h1>
          <p className="text-zinc-400">Set up your creator profile to start publishing courses.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Handle <span className="text-zinc-500">(lowercase, letters/numbers/_)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">@</span>
              <input
                name="handle"
                required
                minLength={3}
                maxLength={30}
                pattern="^[a-z0-9_]+$"
                title="Lowercase letters, numbers, underscores only"
                value={form.handle}
                onChange={handleChange}
                placeholder="your_handle"
                className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">
              Brand Name <span className="text-zinc-500">(optional)</span>
            </label>
            <input
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              placeholder="e.g. CodeMastery Academy"
              className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.2)] mt-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating Profile…' : 'Activate Creator Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
