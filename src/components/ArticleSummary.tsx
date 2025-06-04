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

interface ChatMessage {
  id: string;
  type: 'question' | 'answer' | 'error';
  content: string;
  timestamp: Date;
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
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isFollowUpLoading, setIsFollowUpLoading] = useState(false);
  const [settings, setSettings] = useState<UserSummarySettings>({
    showSummaryButton: true,
  });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Generate a unique key for this article's chat history
  const chatStorageKey = `articleChat_${articleTitle}_${articleContent.slice(0, 100).replace(/[^a-zA-Z0-9]/g, '')}`;
  
  // Clear summary and chat when navigating to a different article
  useEffect(() => {
    // Reset state when article changes
    setSummary(null);
    setChatMessages([]);
    setError(null);
    setIsOpen(false);
    setFollowUpQuestion("");
    setIsFollowUpLoading(false);
    
    // Also clear localStorage for the previous article
    try {
      // Clear all article chat histories
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('articleChat_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing chat histories:", error);
    }
  }, [articleContent, articleTitle]);
  
  // Load chat history from localStorage after clearing state
  useEffect(() => {
    try {
      const storedChat = localStorage.getItem(chatStorageKey);
      if (storedChat) {
        const parsedChat = JSON.parse(storedChat) as ChatMessage[];
        setChatMessages(parsedChat);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  }, [chatStorageKey]);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatMessages.length > 0) {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(chatMessages));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [chatMessages, chatStorageKey]);
  
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

  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim() || !summary) return;

    const questionText = followUpQuestion.trim();
    const questionId = Date.now().toString();
    
    // Add question to chat
    const questionMessage: ChatMessage = {
      id: questionId,
      type: 'question',
      content: questionText,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, questionMessage]);
    setFollowUpQuestion(""); // Clear input immediately
    setIsFollowUpLoading(true);

    try {
      const response = await fetch("/api/summarize/followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: articleContent,
          title: articleTitle,
          summary: summary,
          question: questionText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponseData;
        throw new Error(errorData.error ?? "Failed to get answer");
      }

      const data = await response.json() as { answer: string };
      
      // Add answer to chat
      const answerMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: data.answer,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, answerMessage]);
    } catch (err) {
      console.error("Error getting follow-up answer:", err);
      
      // Add error to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: err instanceof Error ? err.message : "Failed to get answer",
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleFollowUpQuestion();
    }
  };

  const toggleSummary = () => {
    if (isOpen) {
      setIsOpen(false);
      // Only clear the input field, preserve chat history
      setFollowUpQuestion("");
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
        // Only clear the input field, preserve chat history
        setFollowUpQuestion("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isFollowUpLoading]);

  // Additional auto-scroll after AI response is complete
  useEffect(() => {
    if (!isFollowUpLoading && chatMessages.length > 0) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isFollowUpLoading, chatMessages]);

  // Additional auto-scroll specifically after AI responses complete
  useEffect(() => {
    if (!isFollowUpLoading && chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (lastMessage && (lastMessage.type === 'answer' || lastMessage.type === 'error')) {
        // Use setTimeout to ensure DOM has updated
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 100);
      }
    }
  }, [isFollowUpLoading, chatMessages]);

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
        className="rounded-full border border-gray-200 bg-white p-3 text-gray-500 shadow-lg transition-all duration-200 hover:bg-gray-50 cursor-pointer"
        aria-label="Generate article summary"
      >
        <SparklesIcon className="h-6 w-6 relative"/>
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          className="font-nunito absolute bottom-full right-0 mb-2 w-[28rem] max-w-[90vw] max-h-[600px] transform rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col"
        >
          <div className="flex-shrink-0 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-nunito text-lg font-bold text-gray-700">
                {dialogTexts.dialogTitle}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Only clear the input field, preserve chat history
                  setFollowUpQuestion("");
                }}
                className="rounded-md border border-gray-300 bg-white p-1 text-gray-700 hover:bg-gray-50 cursor-pointer"
                aria-label="Close dialog"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
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
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {dialogTexts.tryAgainText}
                </button>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full">
                <div className="prose text-gray-700">
                  {summary && (
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: summary }}
                    ></div>
                  )}
                </div>
                
                {/* Chat Section */}
                {summary && (
                  <div className="border-t border-gray-100 pt-4 flex flex-col flex-1 min-h-0">
                    {/* Chat Messages */}
                    <div 
                      ref={chatScrollRef}
                      className="flex-1 overflow-y-auto space-y-3 mb-3"
                    >
                      {chatMessages.map((message) => (
                        <div key={message.id} className={`flex ${
                          message.type === 'question' ? 'justify-end' : 'justify-start'
                        }`}>
                          <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            message.type === 'question' 
                              ? 'bg-blue-500 text-white rounded-br-md' 
                              : message.type === 'error'
                              ? 'bg-red-500 text-white rounded-bl-md'
                              : 'bg-gray-200 text-gray-800 rounded-bl-md'
                          }`}>
                            <div 
                              className="text-sm leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {/* Loading indicator */}
                      {isFollowUpLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 text-gray-800 rounded-xl rounded-bl-md px-4 py-2 max-w-[80%]">
                            <div className="flex items-center text-sm">
                              <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                              Thinking...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Input Section */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={followUpQuestion}
                        onChange={(e) => setFollowUpQuestion(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a follow-up question..."
                        className="font-nunito flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 focus:outline-none"
                        disabled={isFollowUpLoading}
                      />
                      <button
                        onClick={() => void handleFollowUpQuestion()}
                        disabled={!followUpQuestion.trim() || isFollowUpLoading}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isFollowUpLoading ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          "Ask"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 