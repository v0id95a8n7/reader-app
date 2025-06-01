import React, { useState, useEffect, memo } from 'react';
import { PlusIcon, UserIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SmallLoader } from './LoadingSpinner';
import { usePathname } from 'next/navigation';
import { decodeHtmlEntities } from '~/utils/html-entities';
import type { Article } from '~/utils/use-saved-articles';

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
  onCancel,
  onSubmit,
  isLoading,
}: {
  onCancel: () => void;
  onSubmit: (url: string) => void;
  isLoading: boolean;
}) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http or https');
      return;
    }
    
    setError(null);
    onSubmit(url);
  };

  return (
    <div className="p-4 border-b border-gray-100">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full px-3 py-2 pr-16 border border-gray-300 outline-none transition-all duration-200 shadow-sm bg-white text-gray-700 font-nunito focus:border-gray-400 focus:ring-1 focus:ring-gray-300 rounded-md"
            autoFocus
          />
          <div className="absolute right-0 flex">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              disabled={isLoading}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <button
              type="submit"
              className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? <SmallLoader /> : <ArrowRightIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 font-nunito">{error}</p>
        )}
      </form>
    </div>
  );
});


const ArticleItem = memo(({ 
  article, 
  isActive, 
  onClick, 
  onDelete 
}: { 
  article: Article; 
  isActive: boolean; 
  onClick: () => void; 
  onDelete: (e: React.MouseEvent) => void;
}) => {
  return (
    <li className={`group px-3 py-3 mx-2 my-2 transition-all duration-200 rounded-md border-gray-100 ${isActive ? 'bg-gray-100 border-l-4 border-l-gray-400' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
      <div 
        className="cursor-pointer"
        onClick={onClick}
      >
        <h3 className={`font-medium text-sm line-clamp-2 mb-2 font-nunito ${isActive ? 'text-gray-700' : 'text-gray-600'}`}>
          {decodeHtmlEntities(article.title)}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 font-nunito">
            {decodeHtmlEntities(article.excerpt)}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-nunito">
            {new Date(article.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <button
            onClick={onDelete}
            className="text-xs text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 px-2 py-1 rounded cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
});

ArticleItem.displayName = 'ArticleItem';

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
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);
  
  
  useEffect(() => {
    if (pathname?.includes('/article/')) {
      
      const regex = /\/article\/(.+)$/;
      const match = regex.exec(pathname);
      if (match?.[1]) {
        try {
          const decodedUrl = decodeURIComponent(match[1]);
          setActiveArticleUrl(decodedUrl);
        } catch (e) {
          console.error('Error decoding URL:', e);
        }
      }
    } else {
      setActiveArticleUrl(null);
    }
  }, [pathname]);

  const handleAddButtonClick = () => {
    setIsAddingArticle(true);
  };

  const handleUrlSubmit = async (url: string) => {
    setIsSubmittingUrl(true);
    
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); 
    
    try {
      
      const response = await fetch(`/api/parse?url=${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); 
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to parse article');
      }
      
      const data = await response.json() as { url: string; title: string; excerpt?: string };
      
      
      const saveResponse = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: data.url,
          title: data.title,
          excerpt: data.excerpt,
        }),
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to save article');
      }
      
      
      setIsAddingArticle(false);
      
      
      onAddArticle();
      
      
      const encodedUrl = encodeURIComponent(data.url);
      window.location.href = `/article/${encodedUrl}`;
      
    } catch (error: unknown) {
      console.error('Error submitting URL:', error);
      
      
      if (error instanceof Error && error.name === 'AbortError') {
        alert('Request timed out. The article may be too large or the server is not responding.');
      } else {
        alert(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
      
      
      setIsSubmittingUrl(false);
    }
  };

  return (
    <div className="fixed top-16 left-0 w-120 h-[calc(100vh-4rem)] flex flex-col bg-white border-r border-gray-100 text-gray-600 shadow-sm z-10 font-nunito">
      {/* Add Article Button or Input */}
      {isAddingArticle ? (
        <AddArticleInput 
          onCancel={() => setIsAddingArticle(false)}
          onSubmit={handleUrlSubmit}
          isLoading={isSubmittingUrl}
        />
      ) : (
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={handleAddButtonClick}
            className="w-full flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 transition-all duration-200 shadow-sm rounded-md cursor-pointer"
          >
            <PlusIcon className="h-5 w-5" />
            <span className="font-nunito">Add Article</span>
          </button>
        </div>
      )}

      {/* Articles List with isolated scrolling */}
      <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <SmallLoader />
          </div>
        ) : (
          <>
            {/* Articles List with isolated scrolling */}
            <ul className="overflow-auto">
              {articles.length === 0 ? (
                /* Empty state when no articles are available */
                <div className="p-6 m-2 text-center text-gray-400 text-sm bg-gray-50 shadow-inner font-nunito rounded-md">
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
        {!activeArticleUrl && articles.length > 0 && pathname === '/' && (
          <div className="p-4 mx-2 mt-4 text-center text-gray-400 text-xs italic bg-gray-50 shadow-inner font-nunito rounded-md">
            Select an article from the list or add a new one
          </div>
        )}
      </div>
      
      {/* User Profile */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-200 p-2 rounded-md">
              <UserIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-sm text-gray-600 font-medium truncate max-w-[140px] font-nunito">
              {currentUser}
            </div>
          </div>
          <button
            onClick={() => void onLogout()}
            className="text-xs text-gray-500 hover:text-gray-700 transition-all duration-200 px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 shadow-sm font-nunito rounded cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
});