import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface ArticleTableOfContentsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  settings: {
    fontSize: number;
    fontFamily: string;
  };
}

export function ArticleTableOfContents({ containerRef, settings }: ArticleTableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    
    const headingElements = containerRef.current.querySelectorAll('h2, h3, h4');
    
    
    let idCounter = 0;
    
    const extractedHeadings: Heading[] = Array.from(headingElements)
      .filter(heading => {
        
        return heading.textContent;
      })
      .map(heading => {
        
        const headingId = heading.id || `heading-${idCounter++}`;
        
        
        if (!heading.id) {
          heading.id = headingId;
        }
        
        const headingText = heading.textContent ?? '';
        
        return {
          id: headingId,
          text: headingText,
          level: parseInt(heading.tagName.substring(1), 10)
        };
      });
    
    setHeadings(extractedHeadings);
    
    
    if (extractedHeadings.length === 0) return;
    
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px'
      }
    );
    
    
    headingElements.forEach(heading => {
      if (heading.id) {
        observer.observe(heading);
      }
    });
    
    return () => {
      headingElements.forEach(heading => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  }, [containerRef]);
  
  
  if (headings.length === 0) {
    return null;
  }
  
  
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
    <div className={`article-toc mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 ${getFontFamilyClass()}`}>
      <h3 className="text-lg font-bold mb-3 text-gray-700">Contents</h3>
      <nav>
        <ul className="space-y-1">
          {headings.map((heading, index) => (
            <li 
              key={`${heading.id}-${index}`}
              className={`toc-item ${heading.level > 2 ? 'ml-4' : ''}`}
            >
              <a
                href={`#${heading.id}`}
                className={`
                  block py-1 px-2 rounded transition-colors text-sm
                  ${activeId === heading.id 
                    ? 'bg-gray-200 text-gray-800 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'}
                `}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    
                    window.history.pushState(null, '', `#${heading.id}`);
                    setActiveId(heading.id);
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 