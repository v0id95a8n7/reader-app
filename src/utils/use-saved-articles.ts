import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";

export interface Article {
  id: string;
  url: string;
  title: string;
  excerpt?: string | null;
  date: string;
}

interface ArticlesResponse {
  articles: Article[];
}

interface ErrorResponse {
  error: string;
}

interface UseSavedArticles {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
  saveArticle: (article: Omit<Article, "id" | "date">) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  refreshArticles: () => Promise<void>;
}

export function useSavedArticles(): UseSavedArticles {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchArticles = useCallback(async () => {
    if (!user) {
      setArticles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching saved articles for user:", user.id);
      const response = await fetch("/api/articles", {
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as ArticlesResponse;
        console.log("Received articles:", data.articles.length);
        setArticles(data.articles);
      } else {
        const errorData = (await response.json()) as ErrorResponse;
        console.error("Failed to fetch articles:", errorData);
        setError(errorData.error ?? "Failed to fetch articles");
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch articles",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const saveArticle = async (article: Omit<Article, "id" | "date">) => {
    if (!user) {
      setError("You must be logged in to save articles");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Saving article for user:", user.id, article);
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
        credentials: "include",
      });

      if (response.ok) {
        const savedArticle = (await response.json()) as Article;
        console.log("Article saved successfully:", savedArticle);
        setArticles((prev) => [...prev, savedArticle]);
      } else {
        const errorData = (await response.json()) as ErrorResponse;
        console.error("Failed to save article:", errorData);
        setError(errorData.error ?? "Failed to save article");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteArticle = async (id: string) => {
    if (!user) {
      setError("You must be logged in to delete articles");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Deleting article for user:", user.id, "article ID:", id);
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        console.log("Article deleted successfully");
        setArticles((prev) => prev.filter((article) => article.id !== id));
      } else {
        const errorData = (await response.json()) as ErrorResponse;
        console.error("Failed to delete article:", errorData);
        setError(errorData.error ?? "Failed to delete article");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete article",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshArticles = async () => {
    await fetchArticles();
  };

  return {
    articles,
    isLoading,
    error,
    saveArticle,
    deleteArticle,
    refreshArticles,
  };
}
