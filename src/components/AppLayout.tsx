"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "~/components/Sidebar";
import { useSavedArticles } from "~/utils/use-saved-articles";
import { NewspaperIcon, ArrowRightOnRectangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { SettingsModal } from "~/components/SettingsModal";
import { LogoutModal } from "~/components/LogoutModal";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);

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
    return (
      <div className="font-nunito flex min-h-screen items-center justify-center bg-gray-50">
        <ArrowPathIcon className="h-24 w-24 animate-spin text-gray-500" />
      </div>
    );
  }

  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="font-nunito flex min-h-screen items-center justify-center bg-gray-50">
        <ArrowPathIcon className="h-24 w-24 animate-spin text-gray-500" />
      </div>
    );
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
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    setIsLoggingOut(false);
    void router.push("/login");
  };
  
  const handleOpenSettings = () => {
    setIsSettingsOpen(prevState => !prevState);
    if (isLogoutOpen) {
      setIsLogoutOpen(false);
    }
  };

  const handleOpenLogoutModal = () => {
    setIsLogoutOpen(prevState => !prevState);
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="font-nunito flex min-h-screen flex-col bg-gray-50">
      <header className="fixed top-0 right-0 left-0 z-20 flex h-16 items-center border-b border-gray-200 bg-white px-6">
        <div
          className="flex cursor-pointer items-center space-x-3"
          onClick={handleLogoClick}
        >
          <h1 className="font-nunito flex flex-row items-center justify-center gap-1 text-xl font-semibold text-gray-700">
            <NewspaperIcon className="h-6 w-6 text-gray-700" />
            Reedr
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2 relative">
          {user && (
            <>
              <button
                ref={settingsButtonRef}
                onClick={handleOpenSettings}
                className="flex flex-row items-center gap-2 font-nunito rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <span className="hidden text-gray-600 sm:inline">Settings</span>
                <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
              </button>
              
              <button
                ref={logoutButtonRef}
                onClick={handleOpenLogoutModal}
                className="flex flex-row items-center gap-2 font-nunito rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <span className="hidden text-gray-600 sm:inline">Logout</span>
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-500" />
              </button>
            </>
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
            _currentUser={user?.name ?? user?.email ?? ""}
            _onLogout={handleLogout}
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
        
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => setIsSettingsOpen(false)}
            anchorRef={settingsButtonRef}
          />
        )}
        
        {isLogoutOpen && (
          <LogoutModal
            onClose={() => setIsLogoutOpen(false)}
            onConfirm={handleLogout}
            anchorRef={logoutButtonRef}
            isLoading={isLoggingOut}
          />
        )}
      </div>
    </div>
  );
}
