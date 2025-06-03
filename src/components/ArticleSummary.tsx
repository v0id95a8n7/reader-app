"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowPathIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/solid";

interface ArticleSummaryProps {
  articleContent: string;
  articleTitle: string;
}

interface SummaryResponseData {
  summary: string;
  language?: string;
}

interface ErrorResponseData {
  error: string;
}

export function ArticleSummary({ articleContent, articleTitle }: ArticleSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const generateSummary = async () => {
    // If we already have a summary, just open the panel
    if (summary) {
      setIsOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsOpen(true);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: articleContent,
          title: articleTitle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponseData;
        throw new Error(errorData.error ?? "Failed to generate summary");
      }

      const data = await response.json() as SummaryResponseData;
      setSummary(data.summary);
      if (data.language) {
        setLanguage(data.language);
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      setError(err instanceof Error ? err.message : "Failed to generate summary");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSummary = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      void generateSummary();
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        buttonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Заголовок диалога в зависимости от языка
  const dialogTitle = language === 'ru' ? 'Резюме статьи' : 'Article Summary';
  const loadingText = language === 'ru' ? 'Создание резюме...' : 'Generating summary...';
  const errorTitle = language === 'ru' ? 'Ошибка' : 'Error';
  const tryAgainText = language === 'ru' ? 'Попробовать снова' : 'Try Again';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleSummary}
        className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-gray-500 shadow-md transition-all duration-200 hover:bg-gray-100"
        aria-label="Generate article summary"
      >
        <SparklesIcon className="h-6 w-6 relative z-10"/>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          className="font-nunito absolute bottom-full right-0 mb-2 w-96 transform rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 ease-in-out"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-nunito text-lg font-bold text-gray-700">
              {dialogTitle}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                <ArrowPathIcon className="h-8 w-8 animate-spin mb-4" />
                <p>{loadingText}</p>
              </div>
            )}

            {error && !isLoading && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
                <p className="mb-2 font-bold">{errorTitle}</p>
                <p>{error}</p>
                <button
                  onClick={generateSummary}
                  className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                >
                  {tryAgainText}
                </button>
              </div>
            )}

            {summary && !isLoading && (
              <div className="prose prose-sm max-w-none text-gray-700">
                {summary.split("\n").map((paragraph, i) => (
                  paragraph.trim() ? <p key={i} className="mb-3">{paragraph}</p> : null
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 