"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "~/components/Sidebar";
import { useAuth } from "~/utils/use-auth";
import { useSavedArticles } from "~/utils/use-saved-articles";
import { PageLoader } from "~/components/LoadingSpinner";
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { articles, isLoading, deleteArticle } = useSavedArticles();
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user && pathname !== "/login" && pathname !== "/register") {
        void router.replace("/login");
      } else if (user && (pathname === "/login" || pathname === "/register")) {
        void router.replace("/");
      }
    }
  }, [user, isAuthLoading, pathname, router]);

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
      console.error('Failed to delete article:', error);
    }
  };

  const handleLogoClick = () => {
    void router.push("/");
  };

  const handleSaveArticle = (): void => {
    return;
  };

  const handleLogout = () => {
    void logout();
    void router.push("/login");
  };

  return (
    <div className="font-nunito flex flex-col min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 shadow-sm z-20 flex items-center px-6">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={handleLogoClick}>
          <div className="bg-white p-2 rounded-md shadow-sm">
            <BookOpenIcon className="h-6 w-6 text-gray-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-700 font-nunito">Reader</h1>
        </div>
        
        <div className="ml-auto">
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
              <span className="hidden sm:inline text-gray-600">Sign out</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex pt-16 h-screen">
        <div className="w-120 flex-shrink-0">
          <Sidebar
            articles={articles}
            _currentPath={pathname}
            onArticleClick={handleArticleClick}
            onDeleteArticle={handleDeleteArticle}
            onAddArticle={handleSaveArticle}
            currentUser={user?.name ?? user?.email}
            onLogout={logout}
            isLoading={isLoading}
            _onLogoClick={handleLogoClick}
          />
        </div>

        <main className="flex-1 overflow-y-auto p-6 h-[calc(100vh-4rem)]">
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
