"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NewspaperIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { signIn, useSession } from "next-auth/react";

interface RegisterResponse {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  error?: string;
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  console.log("Register page - session status:", status, "session:", session);

  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (session?.user && status === "authenticated") {
      router.push("/");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting registration with:", { email, name, passwordProvided: !!password });
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json() as RegisterResponse;
      console.log("Registration response:", response.status, data);

      if (response.ok) {
        console.log("Registration successful, signing in...");
        
        // Автоматически входим после успешной регистрации
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        console.log("SignIn result after registration:", result);
        
        if (result?.error) {
          console.error("Login after registration failed:", result.error);
          setError(result.error);
        } else {
          console.log("Login after registration successful, redirecting...");
          router.push("/");
        }
      } else {
        console.error("Registration failed:", data);
        throw new Error(data.error ?? "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-gray-700 hover:text-gray-900"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <div className="mt-8">
          {error && (
            <div
              className="relative mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              role="alert"
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
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
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
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
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
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
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:ring-gray-500 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full cursor-pointer justify-center rounded-md border border-transparent bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? <ArrowPathIcon className="h-5 w-5 animate-spin text-white" /> : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
