import React, { useState, useEffect, memo } from "react";
import {
  PlusIcon,
  UserIcon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { SmallLoader } from "./LoadingSpinner";
import { usePathname } from "next/navigation";
import { decodeHtmlEntities } from "~/utils/html-entities";
import type { Article } from "~/utils/use-saved-articles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSavedArticles } from "~/utils/use-saved-articles";
import { ArticleSearchInput } from "./ArticleSearchInput";

interface SidebarProps {
  articles: Article[];
  _currentPath: string;
  onArticleClick: (url: string) => void;
  onDeleteArticle: (id: string) => void;
  onAddArticle: () => void;
  currentUser?: string;
  onLogout: () => void;
  isLoading: boolean;
  _onLogoClick: () => void;
}

const AddArticleInput = memo(function AddArticleInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError("Please enter a URL");
      return;
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("Please enter a valid URL starting with http or https");
      return;
    }

    setError(null);
    onSubmit(url);
    setUrl("");
  };

  return (
    <div className="border-b border-gray-100 p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter article URL"
            className="font-nunito w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-16 text-gray-700 shadow-sm transition-all duration-200 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-300"
          />
          <div className="absolute right-0">
            <button
              type="submit"
              className="font-nunito cursor-pointer px-3 py-2 font-medium text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {isLoading ? <SmallLoader /> : "Add"}
            </button>
          </div>
        </div>
        {error && (
          <p className="font-nunito mt-1 text-xs text-red-500">{error}</p>
        )}
      </form>
    </div>
  );
});

const ArticleItem = memo(
  ({
    article,
    isActive,
    onClick,
    onDelete,
  }: {
    article: Article;
    isActive: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
  }) => {
    return (
      <li
        className={`group mx-2 my-2 rounded-md border-gray-100 px-3 py-3 transition-all duration-200 ${isActive ? "border-l-4 border-l-gray-400 bg-gray-100" : "border-l-4 border-l-transparent hover:bg-gray-50"}`}
      >
        <div className="cursor-pointer" onClick={onClick}>
          <h3
            className={`font-nunito mb-2 line-clamp-2 text-sm font-medium ${isActive ? "text-gray-700" : "text-gray-600"}`}
          >
            {decodeHtmlEntities(article.title)}
          </h3>
          {article.excerpt && (
            <p className="font-nunito mb-2 line-clamp-2 text-xs text-gray-400">
              {decodeHtmlEntities(article.excerpt)}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="font-nunito text-xs text-gray-400">
              {new Date(article.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button
              onClick={onDelete}
              className="cursor-pointer rounded px-2 py-1 text-xs text-gray-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:text-gray-600"
            >
              Delete
            </button>
          </div>
        </div>
      </li>
    );
  },
);

ArticleItem.displayName = "ArticleItem";

export const Sidebar = memo(function Sidebar({
  articles,
  _currentPath,
  onArticleClick,
  onDeleteArticle,
  onAddArticle,
  currentUser,
  onLogout,
  isLoading,
  _onLogoClick,
}: SidebarProps) {
  const pathname = usePathname();
  const [activeArticleUrl, setActiveArticleUrl] = useState<string | null>(null);
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);

  useEffect(() => {
    if (pathname?.includes("/article/")) {
      const regex = /\/article\/(.+)$/;
      const match = regex.exec(pathname);
      if (match?.[1]) {
        try {
          const decodedUrl = decodeURIComponent(match[1]);
          setActiveArticleUrl(decodedUrl);
        } catch (e) {
          console.error("Error decoding URL:", e);
        }
      }
    } else {
      setActiveArticleUrl(null);
    }
  }, [pathname]);

  const handleUrlSubmit = async (url: string) => {
    setIsSubmittingUrl(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(
        `/api/parse?url=${encodeURIComponent(url)}`,
        {
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to parse article");
      }

      const data = (await response.json()) as {
        url: string;
        title: string;
        excerpt?: string;
      };

      const saveResponse = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.url,
          title: data.title,
          excerpt: data.excerpt,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = (await saveResponse.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to save article");
      }

      onAddArticle();

      const encodedUrl = encodeURIComponent(data.url);
      window.location.href = `/article/${encodedUrl}`;
    } catch (error: unknown) {
      console.error("Error submitting URL:", error);

      if (error instanceof Error && error.name === "AbortError") {
        alert(
          "Request timed out. The article may be too large or the server is not responding.",
        );
      } else {
        alert(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }

      setIsSubmittingUrl(false);
    }
  };

  return (
    <div className="font-nunito fixed top-16 left-0 z-10 flex h-[calc(100vh-4rem)] w-120 flex-col border-r border-gray-100 bg-white text-gray-600 shadow-sm">
      {/* URL Input Field */}
      <AddArticleInput onSubmit={handleUrlSubmit} isLoading={isSubmittingUrl} />

      {/* Articles List with isolated scrolling */}
      <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <SmallLoader />
          </div>
        ) : (
          <>
            {/* Articles List with isolated scrolling */}
            <ul className="overflow-auto">
              {articles.length === 0 ? (
                /* Empty state when no articles are available */
                <div className="font-nunito m-2 rounded-md bg-gray-50 p-6 text-center text-sm text-gray-400 shadow-inner">
                  No saved articles
                </div>
              ) : (
                articles.map((article) => (
                  <ArticleItem
                    key={article.id}
                    article={article}
                    isActive={article.url === activeArticleUrl}
                    onClick={() => onArticleClick(article.url)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      onDeleteArticle(article.id);
                    }}
                  />
                ))
              )}
            </ul>
          </>
        )}

        {/* Empty state when no article is selected */}
        {!activeArticleUrl && articles.length > 0 && pathname === "/" && (
          <div className="font-nunito mx-2 mt-4 rounded-md bg-gray-50 p-4 text-center text-xs text-gray-400 italic shadow-inner">
            Select an article from the list or add a new one
          </div>
        )}
      </div>
    </div>
  );
});
