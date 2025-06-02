"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSavedArticles } from "~/utils/use-saved-articles";
import { Readability } from "@mozilla/readability";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ContentLoader } from "~/components/LoadingSpinner";
import {
  ArticleRenderer,
  type ArticleRendererProps,
} from "~/components/ArticleRenderer";
import { ArticleHeader } from "~/components/ArticleHeader";
import { FloatingButtons } from "~/components/FloatingButtons";

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

type ReaderSettings = ArticleRendererProps["settings"];

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 18,
  fontFamily: "PT Serif",
  lineHeight: 1.6,
  textAlign: "left",
  showImages: true,
  showVideos: true,
};

function extractPublishedTime(html: string): string | null {
  const ogDateRegex =
    /<meta[^>]*property=["']og:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const ogDateAltRegex =
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:published_time["'][^>]*>/i;

  const ogDateMatch = ogDateRegex.exec(html);
  const ogDateAltMatch = ogDateAltRegex.exec(html);

  if (ogDateMatch?.[1]) {
    return ogDateMatch[1].trim();
  }

  if (ogDateAltMatch?.[1]) {
    return ogDateAltMatch[1].trim();
  }

  const articleDateRegex =
    /<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const articleDateAltRegex =
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']article:published_time["'][^>]*>/i;

  const articleDateMatch = articleDateRegex.exec(html);
  const articleDateAltMatch = articleDateAltRegex.exec(html);

  if (articleDateMatch?.[1]) {
    return articleDateMatch[1].trim();
  }

  if (articleDateAltMatch?.[1]) {
    return articleDateAltMatch[1].trim();
  }

  const schemaDateRegex =
    /<meta[^>]*itemprop=["']datePublished["'][^>]*content=["']([^"']+)["'][^>]*>/i;
  const schemaDateAltRegex =
    /<meta[^>]*content=["']([^"']+)["'][^>]*itemprop=["']datePublished["'][^>]*>/i;

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
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const router = useRouter();
  const params = useParams();
  const { articles } = useSavedArticles();

  const urlParam = params.url as string;
  const decodedUrl = decodeURIComponent(urlParam);

  const articleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json() as ReaderSettings;
          setSettings(data);
          setIsSettingsSaved(true);
        } else {
          const savedSettings = localStorage.getItem("readerSettings");
          if (savedSettings) {
            try {
              setSettings(JSON.parse(savedSettings) as ReaderSettings);
            } catch (e) {
              console.error("Error parsing reader settings:", e);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        const savedSettings = localStorage.getItem("readerSettings");
        if (savedSettings) {
          try {
            setSettings(JSON.parse(savedSettings) as ReaderSettings);
          } catch (e) {
            console.error("Error parsing reader settings:", e);
          }
        }
      } finally {
        setIsSettingsLoaded(true);
      }
    };

    void fetchSettingsData();
  }, []);

  useEffect(() => {
    localStorage.setItem("readerSettings", JSON.stringify(settings));

    const saveSettings = async () => {
      if (isSettingsSaved) {
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
          });
        } catch (error) {
          console.error("Error saving settings:", error);
        }
      }
    };

    void saveSettings();
  }, [settings, isSettingsSaved]);

  const handleGoBack = useCallback(() => {
    startTransition(() => {
      router.push("/");
    });
  }, [router]);

  const navigateToArticle = useCallback(
    (url: string) => {
      if (!articleCache.has(url)) {
        void fetch(`/api/parse?url=${encodeURIComponent(url)}`)
          .then((response) => response.json())
          .then((data: ParseResponse) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.html, "text/html");
            const reader = new Readability(doc);
            const parsedArticle = reader.parse();

            if (parsedArticle) {
              const articleContent: ArticleContent = {
                title: parsedArticle.title ?? "Untitled",
                content: parsedArticle.content ?? "",
                byline: parsedArticle.byline,
                siteName: parsedArticle.siteName,
                excerpt: parsedArticle.excerpt,
                publishedTime: extractPublishedTime(data.html),
                lang: parsedArticle.lang,
              };

              articleCache.set(url, articleContent);
            }
          })
          .catch((err) => console.error("Error prefetching article:", err));
      }

      startTransition(() => {
        const encodedUrl = encodeURIComponent(url);
        router.push(`/article/${encodedUrl}`);
      });
    },
    [router],
  );

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

      const response = await fetch(
        `/api/parse?url=${encodeURIComponent(url)}`,
        {
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? "Failed to fetch article");
      }

      const data = (await response.json()) as ParseResponse;

      const parser = new DOMParser();
      const doc = parser.parseFromString(data.html, "text/html");

      const reader = new Readability(doc);
      const parsedArticle = reader.parse();

      if (!parsedArticle) {
        throw new Error("Failed to parse article content");
      }

      const articleContent: ArticleContent = {
        title: parsedArticle.title ?? "Untitled",
        content: parsedArticle.content ?? "",
        byline: parsedArticle.byline,
        siteName: parsedArticle.siteName,
        excerpt: parsedArticle.excerpt,
        publishedTime: extractPublishedTime(data.html),
        lang: parsedArticle.lang,
      };

      articleCache.set(url, articleContent);

      setArticle(articleContent);
    } catch (error: unknown) {
      console.error("Error fetching article:", error);

      if (error instanceof Error && error.name === "AbortError") {
        setError(
          "Request timed out. The article may be too large or the server is not responding.",
        );
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }

      if (articleCache.has(url)) {
        console.log("Using cached version of article after error");
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
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const currentIndex = articles.findIndex(
        (article) => article.url === decodedUrl,
      );
      if (currentIndex === -1) return;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : articles.length - 1;
        const prevArticle = articles[prevIndex];
        if (prevArticle) {
          e.preventDefault();
          navigateToArticle(prevArticle.url);
        }
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const nextIndex =
          currentIndex < articles.length - 1 ? currentIndex + 1 : 0;
        const nextArticle = articles[nextIndex];
        if (nextArticle) {
          e.preventDefault();
          navigateToArticle(nextArticle.url);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleGoBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [articles, decodedUrl, handleGoBack, navigateToArticle]);

  const handleSettingsChange = (newSettings: ReaderSettings) => {
    setSettings(newSettings);
    setIsSettingsSaved(true);
  };

  const handleScrollToTop = () => {
    if (articleContentRef.current) {
      articleContentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLinkClick = (url: string) => {
    if (url.startsWith("#")) {
      // Internal link - scroll to element
      const elementId = url.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (url.startsWith("http")) {
      // External link - open in new window
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Relative link - do nothing for now
      console.log("Relative link clicked:", url);
    }
  };

  const currentIndex = articles.findIndex(
    (article) => article.url === decodedUrl,
  );
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  if (isLoading || isPending || !isSettingsLoaded) {
    return <ContentLoader />;
  }

  if (error) {
    return (
      <div className="font-nunito mx-auto max-w-3xl">
        {/* <div className="bg-white text-gray-700 shadow-sm p-8 border border-gray-200 rounded-lg"> */}
        <h1 className="font-nunito mb-4 text-xl font-bold text-gray-500">
          Error
        </h1>
        <p className="font-nunito mb-6 text-gray-500">{error}</p>
        <button
          onClick={handleGoBack}
          className="font-nunito flex cursor-pointer items-center space-x-2 rounded-md bg-gray-500 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:bg-gray-600"
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
      <div className="font-nunito mx-auto max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-gray-700 shadow-sm">
          <h1 className="font-nunito mb-4 text-xl font-bold text-gray-700">
            Article not found
          </h1>
          <button
            onClick={handleGoBack}
            className="font-nunito flex items-center space-x-2 rounded-md bg-gray-500 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:bg-gray-600"
          >
            <ChevronLeftIcon className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full" ref={articleContentRef}>
      {isLoading || !isSettingsLoaded ? (
        <ContentLoader />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
          <h2 className="mb-2 text-lg font-bold">Error Loading Article</h2>
          <p>{error}</p>
          <button
            onClick={handleGoBack}
            className="mt-4 rounded-md bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
          >
            Go Back
          </button>
        </div>
      ) : article ? (
        <>
          <div className="relative">
            <div className="mb-6 flex items-center">
              {prevArticle && (
                <button
                  onClick={() => navigateToArticle(prevArticle.url)}
                  className="mr-auto rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label="Previous article"
                >
                  <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                </button>
              )}

              {nextArticle && (
                <button
                  onClick={() => navigateToArticle(nextArticle.url)}
                  className="ml-auto rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label="Next article"
                >
                  <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            <ArticleHeader
              title={article.title}
              byline={article.byline}
              siteName={article.siteName}
              publishedTime={article.publishedTime}
              excerpt={article.excerpt}
              url={decodedUrl}
              settings={settings}
            />

            <div className="mt-8">
              <ArticleRenderer
                content={article.content}
                settings={settings}
                originalUrl={decodedUrl}
                onLinkClick={handleLinkClick}
              />
            </div>
          </div>

          <FloatingButtons
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onScrollToTop={handleScrollToTop}
          />
        </>
      ) : null}
    </div>
  );
}
