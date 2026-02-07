'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setUsername(data.username);
      setAvatar(data.avatar || '');
      setEmail(data.email);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router, fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, avatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      await update({ username: data.username });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const initial = username ? username[0].toUpperCase() : '?';

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-white">Profile Settings</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-xl">
        {/* Profile Header Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
          </div>

          {/* Avatar + Name */}
          <div className="px-6 pb-6">
            <div className="-mt-14 mb-4">
              <div className="relative inline-block">
                {avatar && !avatarError ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-gray-900 shadow-xl"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-900 shadow-xl">
                    {initial}
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{username}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{email}</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Edit Form Card */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Edit Profile</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 w-full bg-gray-800/50 text-gray-500 rounded-xl px-4 py-3 border border-gray-800">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{email}</span>
                <svg className="w-4 h-4 ml-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-xl pl-11 pr-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Avatar URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => {
                    setAvatar(e.target.value);
                    setAvatarError(false);
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-gray-800 text-white rounded-xl pl-11 pr-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-600"
                />
              </div>
              <p className="text-gray-600 text-xs mt-1.5 ml-1">
                Paste a direct link to an image for your profile picture
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
