import React, { useState, useEffect, memo, useRef } from "react";
import { usePathname } from "next/navigation";
import { decodeHtmlEntities } from "~/utils/html-entities";
import type { Article } from "~/utils/use-saved-articles";
import { TrashIcon, ArrowPathIcon, PlusIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
  articles: Article[];
  _currentPath: string;
  onArticleClick: (url: string) => void;
  onDeleteArticle: (id: string) => void;
  onAddArticle: () => void;
  _currentUser?: string;
  _onLogout: () => void;
  isLoading: boolean;
  _onLogoClick: () => void;
}

const SidebarHeader = memo(function SidebarHeader({ 
  onAddUrl
}: { 
  onAddUrl: (url: string) => Promise<void> 
}) {
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsAddPopoverOpen(false);
      }
    }

    if (isAddPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddPopoverOpen]);

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
    setIsSubmitting(true);
    
    onAddUrl(url)
      .catch((error) => {
        console.error("Failed to add URL:", error);
        // Error is already handled in the onAddUrl function
      })
      .finally(() => {
        setIsSubmitting(false);
        setUrl("");
        setIsAddPopoverOpen(false);
      });
  };

  return (
    <div className="h-12 flex gap-2 items-center pl-4 pr-2 relative">
      <div className="font-nunito text-xl font-medium text-gray-600 flex-1">Saved articles</div>
      <div className="relative">
        <button 
          ref={buttonRef}
          onClick={() => setIsAddPopoverOpen(!isAddPopoverOpen)}
          className="font-nunito text-sm text-gray-500 hover:text-gray-700 cursor-pointer rounded-md px-2 py-2 hover:bg-gray-100"
          aria-expanded={isAddPopoverOpen}
          aria-controls="add-article-popover"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        {isAddPopoverOpen && (
          <div 
            id="add-article-popover"
            ref={popoverRef}
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-md z-50"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-nunito text-base font-medium text-gray-700">
                Add new article
              </h3>
              <button
                onClick={() => setIsAddPopoverOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="article-url" className="font-nunito mb-1 block text-sm font-medium text-gray-600">
                  Article URL
                </label>
                <input
                  id="article-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="font-nunito w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
                {error && (
                  <p className="font-nunito mt-1 text-xs text-red-500">{error}</p>
                )}
              </div>
              
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPopoverOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-1">
                      <ArrowPathIcon className="h-3 w-3 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    "Add Article"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

const SearchInput = memo(function SearchInput({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
        className="font-nunito h-12 w-full border-t border-b border-gray-200 bg-white px-10 py-2 text-gray-700 transition-all duration-200 outline-none"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
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
        className={`group mx-2 my-2 cursor-pointer rounded-md px-3 py-3 transition-all duration-200 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
        onClick={onClick}
      >
        <h3
          className={`font-nunito mb-2 line-clamp-2 text-sm font-medium cursor-pointer ${isActive ? "text-gray-700" : "text-gray-600"}`}
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
            className="cursor-pointer rounded p-1 text-gray-400 opacity-0 transition-all duration-400 ease-in-out group-hover:opacity-50 hover:text-red-500 hover:opacity-100"
            aria-label="Delete article"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
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
  _currentUser,
  _onLogout,
  isLoading,
  _onLogoClick,
}: SidebarProps) {
  const pathname = usePathname();
  const [activeArticleUrl, setActiveArticleUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUrlSubmit = async (url: string): Promise<void> => {
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
      throw error; // Re-throw to let the caller know the operation failed
    }
  };

  // Filter articles based on search term
  const filteredArticles = searchTerm
    ? articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : articles;

  return (
    <div className="font-nunito fixed top-16 left-0 z-10 flex h-[calc(100vh-4rem)] w-120 flex-col border-r border-gray-100 bg-white text-gray-600 shadow-sm">
      <SidebarHeader onAddUrl={handleUrlSubmit} />
      {/* Search Input Field */}
      <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      {/* Articles List with isolated scrolling */}
      <div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* Articles List with isolated scrolling */}
            <ul className="overflow-auto">
              {filteredArticles.length === 0 ? (
                /* Empty state when no articles are available */
                <div className="font-nunito m-2 p-6 text-center text-sm text-gray-400">
                  {searchTerm ? "No articles match your search :(" : "No saved articles :("}
                </div>
              ) : (
                filteredArticles.map((article) => (
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
      </div>
    </div>
  );
});
