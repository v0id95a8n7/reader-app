"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { SmallLoader } from "~/components/LoadingSpinner";
import { useAuth } from "~/utils/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { login, error, isLoading, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect");

  // If user is already logged in, redirect to home page
  useEffect(() => {
    console.log("Login page: checking auth state", { user, isLoading });
    if (user && !isLoading) {
      console.log("User already logged in, redirecting to home");
      const redirectTo = redirect ? decodeURIComponent(redirect) : "/";
      window.location.href = redirectTo;
    }
  }, [user, isLoading, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted:", { email, redirect });

    setLocalLoading(true);
    setLocalError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Login successful, redirecting...");
        // Redirect to specified page or home page
        const redirectTo = redirect ? decodeURIComponent(redirect) : "/";
        window.location.href = redirectTo;
      } else {
        const data = await response.json();
        setLocalError(data.error ?? "An error occurred during login");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLocalError("An unexpected error occurred");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="font-nunito flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="rounded-md bg-white p-3 shadow-sm">
              <BookOpenIcon className="h-12 w-12 text-gray-500" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-700">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              register
            </Link>{" "}
            if you don&apos;t have an account
          </p>
          {redirect && (
            <p className="mt-2 text-center text-xs text-gray-500">
              You will be redirected to: {decodeURIComponent(redirect)}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {(localError ?? error) && (
            <div
              className="relative rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              role="alert"
            >
              <span className="block sm:inline">{localError ?? error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className="group relative flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
            >
              {localLoading || isLoading ? <SmallLoader /> : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
