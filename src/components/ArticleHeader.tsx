import React from 'react';

interface ArticleHeaderProps {
  title: string;
  byline?: string | null;
  siteName?: string | null;
  publishedTime?: string | null;
  excerpt?: string | null;
  url: string;
  settings: {
    fontSize: number;
    fontFamily: string;
  };
}

export function ArticleHeader({
  title,
  byline,
  siteName,
  publishedTime,
  excerpt,
  url,
  settings
}: ArticleHeaderProps) {
  
  const formattedDate = publishedTime ? new Date(publishedTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  
  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const domain = getDomainFromUrl(url);

  
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'PT Serif':
        return 'font-pt-serif';
      case 'PT Sans':
        return 'font-pt-sans';
      case 'PT Mono':
        return 'font-pt-mono';
      default:
        return 'font-pt-serif';
    }
  };

  return (
    <header className={`article-header ${getFontFamilyClass()} mb-8`}>
      {/* Article title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
        {title}
      </h1>
      
      {/* Article metadata */}
      <div className="article-meta text-sm text-gray-500 mb-4">
        {/* Author */}
        {byline && (
          <div className="article-byline mb-1">
            <span className="font-medium">Author: </span>
            <span>{byline}</span>
          </div>
        )}
        
        {/* Publication date */}
        {formattedDate && (
          <div className="article-date mb-1">
            <span className="font-medium">Published: </span>
            <span>{formattedDate}</span>
          </div>
        )}
        
        {/* Source */}
        <div className="article-source mb-1">
          <span className="font-medium">Source: </span>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {siteName ?? domain}
          </a>
        </div>
      </div>
      
      {/* Excerpt */}
      {excerpt && (
        <div className="article-excerpt my-6 p-4 bg-gray-50 border-l-4 border-gray-300 text-gray-700 italic rounded">
          {excerpt}
        </div>
      )}
      
      <hr className="my-6 border-gray-200" />
    </header>
  );
} 