"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "~/components/Sidebar";
import { useSavedArticles } from "~/utils/use-saved-articles";
import { PageLoader } from "~/components/LoadingSpinner";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthLoading = status === "loading";
  const user = session?.user;
  const { articles, isLoading, deleteArticle } = useSavedArticles();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (status !== "loading") {
      if (!session && pathname !== "/login" && pathname !== "/register") {
        void router.replace("/login");
      } else if (session && (pathname === "/login" || pathname === "/register")) {
        void router.replace("/");
      }
    }
  }, [session, status, pathname, router]);

  if (isAuthLoading) {
    return <PageLoader />;
  }

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  if (!user) {
    return <PageLoader />;
  }

  const handleArticleClick = (url: string) => {
    setIsPending(true);
    const encodedUrl = encodeURIComponent(url);
    void router.push(`/article/${encodedUrl}`);

    setTimeout(() => {
      setIsPending(false);
    }, 100);
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticle(id);
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

  const handleLogoClick = () => {
    void router.push("/");
  };

  const handleSaveArticle = (): void => {
    return;
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    void router.push("/login");
  };

  return (
    <div className="font-nunito flex min-h-screen flex-col bg-gray-50">
      <header className="fixed top-0 right-0 left-0 z-20 flex h-16 items-center border-b border-gray-100 bg-white px-6 shadow-sm">
        <div
          className="flex cursor-pointer items-center space-x-3"
          onClick={handleLogoClick}
        >
          <div className="rounded-md bg-white p-2 shadow-sm">
            <BookOpenIcon className="h-6 w-6 text-gray-500" />
          </div>
          <h1 className="font-nunito text-xl font-semibold text-gray-700">
            Reader
          </h1>
        </div>

        <div className="ml-auto">
          {user && (
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 hover:bg-gray-100"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
              <span className="hidden text-gray-600 sm:inline">Sign out</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex h-screen pt-16">
        <div className="w-120 flex-shrink-0">
          <Sidebar
            articles={articles}
            _currentPath={pathname}
            onArticleClick={handleArticleClick}
            onDeleteArticle={handleDeleteArticle}
            onAddArticle={handleSaveArticle}
            currentUser={(user?.name || user?.email) ?? ""}
            onLogout={handleLogout}
            isLoading={isLoading}
            _onLogoClick={handleLogoClick}
          />
        </div>

        <main className="h-[calc(100vh-4rem)] flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            {isPending ? (
              <div className="flex h-full items-center justify-center">
                <div className="animate-pulse font-medium text-gray-500">
                  Loading...
                </div>
              </div>
            ) : (
              <article className="font-nunito rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                {children}
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
