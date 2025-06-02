"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { NewspaperIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { signIn, useSession } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get("redirect");
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  console.log("Login page - session status:", status, "session:", session);

  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      console.log("User already logged in, redirecting to home");
      const redirectTo = redirect ? decodeURIComponent(redirect) : "/";
      router.push(redirectTo);
    }
  }, [session, status, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted:", { email, redirect });

    setLocalLoading(true);
    setLocalError(null);

    try {
      console.log("Calling signIn...");
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Login error from result:", result.error);
        setLocalError(result.error);
      } else {
        console.log("Login successful, redirecting...");
        // Redirect to specified page or home page
        const redirectTo = redirect ? decodeURIComponent(redirect) : "/";
        router.push(redirectTo);
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
            <NewspaperIcon className="h-12 w-12 text-gray-700" />
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

          {localError && (
            <div
              className="relative rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              role="alert"
            >
              <span className="block sm:inline">{localError}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={localLoading || isLoading}
              className="group relative flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
            >
              {localLoading || isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin text-white" /> : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
