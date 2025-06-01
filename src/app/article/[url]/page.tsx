'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSavedArticles } from '~/utils/use-saved-articles';
import { Readability } from '@mozilla/readability';
import { ChevronLeftIcon, ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { ContentLoader } from '~/components/LoadingSpinner';
import { ArticleRenderer } from '~/components/ArticleRenderer';
import { FloatingSettingsButton } from '~/components/FloatingSettingsButton';
import { replaceVideoLinksWithEmbeds } from '~/utils/video-parser';
import { ArticleHeader } from '~/components/ArticleHeader';
import { ArticleTableOfContents } from '~/components/ArticleTableOfContents';

interface ArticleContent {
  title: string;
  content: string;
  byline?: string | null;
  siteName?: string | null;
  excerpt?: string | null;
  publishedTime?: string | null;
  lang?: string | null;
}

interface ParseResponse {
  url: string;
  title: string;
  excerpt?: string;
  html: string;
  error?: string;
}

const DEFAULT_SETTINGS = {
  fontSize: 18,
  fontFamily: 'PT Serif' as const,
  lineHeight: 1.6,
  textAlign: 'left' as const,
  showImages: true,
  showVideos: true,
};


type Settings = {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: string;
  showImages: boolean;
  showVideos: boolean;
};


function extractPublishedTime(html: string): string | null {
  
  const ogDateRegex = /<meta[^>]*property=["']og:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const ogDateAltRegex = /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:published_time["'][^>]*>/i;
  
  const ogDateMatch = ogDateRegex.exec(html);
  const ogDateAltMatch = ogDateAltRegex.exec(html);
  
  if (ogDateMatch?.[1]) {
    return ogDateMatch[1].trim();
  }
  
  if (ogDateAltMatch?.[1]) {
    return ogDateAltMatch[1].trim();
  }
  
  
  const articleDateRegex = /<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const articleDateAltRegex = /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']article:published_time["'][^>]*>/i;
  
  const articleDateMatch = articleDateRegex.exec(html);
  const articleDateAltMatch = articleDateAltRegex.exec(html);
  
  if (articleDateMatch?.[1]) {
    return articleDateMatch[1].trim();
  }
  
  if (articleDateAltMatch?.[1]) {
    return articleDateAltMatch[1].trim();
  }
  
  
  const schemaDateRegex = /<meta[^>]*itemprop=["']datePublished["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const schemaDateAltRegex = /<meta[^>]*content=["']([^"']+)["'][^>]*itemprop=["']datePublished["'][^>]*>/i;
  
  const schemaDateMatch = schemaDateRegex.exec(html);
  const schemaDateAltMatch = schemaDateAltRegex.exec(html);
  
  if (schemaDateMatch?.[1]) {
    return schemaDateMatch[1].trim();
  }
  
  if (schemaDateAltMatch?.[1]) {
    return schemaDateAltMatch[1].trim();
  }
  
  return null;
}


const articleCache = new Map<string, ArticleContent>();

export default function ArticlePage() {
  const [article, setArticle] = useState<ArticleContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<Settings>(() => {
    
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('readerSettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings) as Settings;
        } catch (e) {
          console.error('Error parsing reader settings:', e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  const router = useRouter();
  const params = useParams();
  const { articles } = useSavedArticles();
  
  
  const urlParam = params.url as string;
  const decodedUrl = decodeURIComponent(urlParam);
  
  const articleContentRef = useRef<HTMLDivElement>(null);
  
  
  useEffect(() => {
    localStorage.setItem('readerSettings', JSON.stringify(settings));
  }, [settings]);
  
  const handleGoBack = useCallback(() => {
    startTransition(() => {
      router.push('/');
    });
  }, [router]);
  
  const navigateToArticle = useCallback((url: string) => {
    
    if (!articleCache.has(url)) {
      
      void fetch(`/api/parse?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then((data: ParseResponse) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.html, 'text/html');
          const reader = new Readability(doc);
          const parsedArticle = reader.parse();
          
          if (parsedArticle) {
            
            const processedContent = replaceVideoLinksWithEmbeds(parsedArticle.content ?? '');
            
            const publishedTime = extractPublishedTime(data.html);
            
            articleCache.set(url, {
              title: parsedArticle.title ?? 'Untitled',
              content: processedContent,
              byline: parsedArticle.byline,
              siteName: parsedArticle.siteName,
              excerpt: parsedArticle.excerpt,
              publishedTime: publishedTime,
              lang: parsedArticle.lang,
            });
          }
        })
        .catch(err => console.error('Error prefetching article:', err));
    }
    
    
    startTransition(() => {
      const encodedUrl = encodeURIComponent(url);
      router.push(`/article/${encodedUrl}`);
    });
  }, [router]);
  
  
  const fetchArticle = useCallback(async (url: string) => {
    
    if (articleCache.has(url)) {
      setArticle(articleCache.get(url)!);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); 
      
      
      const response = await fetch(`/api/parse?url=${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); 
      
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to fetch article');
      }
      
      const data = await response.json() as ParseResponse;
      
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.html, 'text/html');
      
      
      const reader = new Readability(doc);
      const parsedArticle = reader.parse();
      
      if (!parsedArticle) {
        throw new Error('Failed to parse article content');
      }
      
      
      const processedContent = replaceVideoLinksWithEmbeds(parsedArticle.content ?? '');
      
      
      const publishedTime = extractPublishedTime(data.html);
      
      const articleContent: ArticleContent = {
        title: parsedArticle.title ?? 'Untitled',
        content: processedContent,
        byline: parsedArticle.byline,
        siteName: parsedArticle.siteName,
        excerpt: parsedArticle.excerpt,
        publishedTime: publishedTime,
        lang: parsedArticle.lang,
      };
      
      
      articleCache.set(url, articleContent);
      
      setArticle(articleContent);
    } catch (error: unknown) {
      console.error('Error fetching article:', error);
      
      
      if (error instanceof Error && error.name === 'AbortError') {
        setError('Request timed out. The article may be too large or the server is not responding.');
      } else {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
      
      
      if (articleCache.has(url)) {
        console.log('Using cached version of article after error');
        setArticle(articleCache.get(url)!);
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  
  useEffect(() => {
    void fetchArticle(decodedUrl);
  }, [decodedUrl, fetchArticle]);
  
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return;
      }
      
      
      const currentIndex = articles.findIndex(article => article.url === decodedUrl);
      if (currentIndex === -1) return;
      
      
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : articles.length - 1;
        const prevArticle = articles[prevIndex];
        if (prevArticle) {
          e.preventDefault(); 
          navigateToArticle(prevArticle.url);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        
        const nextIndex = currentIndex < articles.length - 1 ? currentIndex + 1 : 0;
        const nextArticle = articles[nextIndex];
        if (nextArticle) {
          e.preventDefault(); 
          navigateToArticle(nextArticle.url);
        }
      } else if (e.key === 'Escape') {
        
        e.preventDefault();
        handleGoBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [articles, decodedUrl, handleGoBack, navigateToArticle]);
  
  const handleSettingsChange = (newSettings: typeof settings) => {
    setSettings(newSettings);
  };
  
  
  const currentIndex = articles.findIndex(article => article.url === decodedUrl);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  
  if (isLoading || isPending) {
    return <ContentLoader />;
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto font-nunito">
        {/* <div className="bg-white text-gray-700 shadow-sm p-8 border border-gray-200 rounded-lg"> */}
          <h1 className="text-xl font-bold text-gray-500 mb-4 font-nunito">Error</h1>
          <p className="text-gray-500 mb-6 font-nunito">{error}</p>
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 transition-all duration-200 shadow-sm font-nunito hover:bg-gray-600 rounded-md cursor-pointer"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        {/* </div> */}
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto font-nunito">
        <div className="bg-white text-gray-700 shadow-sm p-8 border border-gray-200 rounded-lg">
          <h1 className="text-xl font-bold text-gray-700 mb-4 font-nunito">Article not found</h1>
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 transition-all duration-200 shadow-sm font-nunito hover:bg-gray-600 rounded-md"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <ArticleHeader 
        title={article.title}
        byline={article.byline ?? null}
        siteName={article.siteName ?? null}
        publishedTime={article.publishedTime ?? null}
        excerpt={article.excerpt ?? null}
        url={decodedUrl}
        settings={{
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily
        }}
      />
      
      {/* Table of contents */}
      <ArticleTableOfContents 
        containerRef={articleContentRef} 
        settings={{
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily
        }}
      />
      
      {/* Article content */}
      <div ref={articleContentRef}>
        <ArticleRenderer content={article.content} settings={settings} />
      </div>
      
      {/* Navigation between articles */}
      <div className="article-navigation mt-8 pt-4 border-t border-gray-200 flex justify-between">
        {prevArticle && (
          <button
            onClick={() => navigateToArticle(prevArticle.url)}
            className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 transition-all duration-200 shadow-sm font-nunito hover:bg-gray-600 rounded-md cursor-pointer"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span>Previous Article</span>
          </button>
        )}
        
        <button
          onClick={handleGoBack}
          className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 transition-all duration-200 shadow-sm font-nunito hover:bg-gray-600 rounded-md cursor-pointer"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </button>
        
        {nextArticle && (
          <button
            onClick={() => navigateToArticle(nextArticle.url)}
            className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 transition-all duration-200 shadow-sm font-nunito hover:bg-gray-600 rounded-md cursor-pointer"
          >
            <span>Next Article</span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Floating Settings Button */}
      <FloatingSettingsButton
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </>
  );
}