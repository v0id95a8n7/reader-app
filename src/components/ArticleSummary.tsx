"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowPathIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface ArticleSummaryProps {
  articleContent: string;
  articleTitle: string;
}

interface SummaryResponseData {
  summary: string;
}

interface ErrorResponseData {
  error: string;
}

interface UserSummarySettings {
  showSummaryButton: boolean;
}

// Wrapper to manage initial button display
export function ArticleSummaryWrapper(props: ArticleSummaryProps) {
  const [initialSettingsChecked, setInitialSettingsChecked] = useState(false);
  const [showButton, setShowButton] = useState(false);
  
  useEffect(() => {
    // Check localStorage immediately when component mounts
    try {
      const storedSettings = localStorage.getItem("summarySettings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as UserSummarySettings;
        setShowButton(parsedSettings.showSummaryButton !== false);
      }
      setInitialSettingsChecked(true);
    } catch (error) {
      console.error("Error reading stored summary settings in wrapper:", error);
      setInitialSettingsChecked(true);
    }
  }, []);
  
  // Listen for settings update events for instant updates
  useEffect(() => {
    const handleSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{showSummaryButton?: boolean}>;
      if (customEvent.detail?.showSummaryButton !== undefined) {
        setShowButton(customEvent.detail.showSummaryButton);
      }
    };
    
    window.addEventListener("settingsUpdated", handleSettingsUpdated);
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdated);
    };
  }, []);
  
  // Don't show anything until localStorage check is complete
  if (!initialSettingsChecked) {
    return null;
  }
  
  // If settings are checked and button should be shown
  if (showButton) {
    return <ArticleSummary {...props} />;
  }
  
  return null;
}

export function ArticleSummary({ articleContent, articleTitle }: ArticleSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSummarySettings>({
    showSummaryButton: true,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Check localStorage first for instant settings on initial load
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem("summarySettings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as UserSummarySettings;
        if (parsedSettings.showSummaryButton !== undefined) {
          setSettings(prevSettings => ({
            ...prevSettings,
            showSummaryButton: parsedSettings.showSummaryButton
          }));
        }
      }
    } catch (error) {
      console.error("Error reading stored summary settings:", error);
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json() as Partial<UserSummarySettings>;
          if (data.showSummaryButton !== undefined) {
            setSettings({
              showSummaryButton: data.showSummaryButton,
            });
            
            // Save to localStorage for quick access on next load
            localStorage.setItem("summarySettings", JSON.stringify({ 
              showSummaryButton: data.showSummaryButton 
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching summary settings:", error);
      }
    };

    void fetchSettings();
  }, []);

  // Listen for settings updates from other components
  useEffect(() => {
    const handleSettingsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{showSummaryButton?: boolean}>;
      if (customEvent.detail?.showSummaryButton !== undefined) {
        setSettings(prev => ({
          ...prev,
          showSummaryButton: customEvent.detail.showSummaryButton!
        }));
        
        // Save to localStorage for quick access on next load
        localStorage.setItem("summarySettings", JSON.stringify({ 
          showSummaryButton: customEvent.detail.showSummaryButton 
        }));
      }
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdated);
    
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdated);
    };
  }, []);

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

  // English dialog texts
  const dialogTexts = {
    dialogTitle: "Article Summary",
    loadingText: "Generating summary...",
    errorTitle: "Error",
    tryAgainText: "Try Again"
  };

  // Hide button if settings say to hide
  const shouldHideButton = !settings.showSummaryButton;
  
  if (shouldHideButton) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={toggleSummary}
        className="cursor-pointer rounded-full border border-gray-200 bg-white p-3 text-gray-500 shadow-md transition-all duration-200 hover:bg-gray-100"
        aria-label="Generate article summary"
      >
        <SparklesIcon className="h-6 w-6 relative"/>
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
              {dialogTexts.dialogTitle}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              aria-label="Close dialog"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-[100px]">
            {isLoading ? (
              <div className="flex h-32 flex-col items-center justify-center">
                <ArrowPathIcon className="mb-2 h-8 w-8 animate-spin text-gray-400" />
                <p className="text-center text-gray-500">
                  {dialogTexts.loadingText}
                </p>
              </div>
            ) : error ? (
              <div className="space-y-4">
                <h4 className="text-md font-semibold text-red-500">
                  {dialogTexts.errorTitle}
                </h4>
                <p className="text-red-400">{error}</p>
                <button
                  onClick={() => void generateSummary()}
                  className="mt-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  {dialogTexts.tryAgainText}
                </button>
              </div>
            ) : (
              <div className="prose max-h-[400px] overflow-y-auto text-gray-700">
                {summary && (
                  <div
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  ></div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 