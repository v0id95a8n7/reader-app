'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { SmallLoader } from '~/components/LoadingSpinner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (loginResponse.ok) {
          router.push('/');
          router.refresh();
        } else {
          
          router.push('/login');
        }
      } else {
        const data = await response.json() as { error?: string };
        throw new Error(data.error ?? 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcf2] flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BookOpenIcon className="h-16 w-16 text-[#eb5e28]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#252422]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#403d39]">
          Or{' '}
          <Link href="/login" className="font-medium text-[#eb5e28] hover:text-[#d04718]">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#252422] py-8 px-4 shadow-custom sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-[#403d39] border-l-4 border-[#eb5e28] p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-[#eb5e28]">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#ccc5b9]">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-[#403d39] border border-[#504a45] text-[#fffcf2] rounded-md shadow-sm placeholder-[#ccc5b9] focus:outline-none focus:ring-2 focus:ring-[#eb5e28] focus:border-[#eb5e28] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#ccc5b9]">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-[#403d39] border border-[#504a45] text-[#fffcf2] rounded-md shadow-sm placeholder-[#ccc5b9] focus:outline-none focus:ring-2 focus:ring-[#eb5e28] focus:border-[#eb5e28] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#ccc5b9]">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 bg-[#403d39] border border-[#504a45] text-[#fffcf2] rounded-md shadow-sm placeholder-[#ccc5b9] focus:outline-none focus:ring-2 focus:ring-[#eb5e28] focus:border-[#eb5e28] sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#fffcf2] bg-[#eb5e28] hover:bg-[#d04718] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb5e28] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <SmallLoader />
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 