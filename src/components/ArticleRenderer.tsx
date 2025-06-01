import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { decodeHtmlEntities } from '~/utils/html-entities';

export interface ArticleRendererProps {
  content: string;
  originalUrl: string;
  settings: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    textAlign: "left" | "center" | "right" | "justify";
    showImages: boolean;
    showVideos: boolean;
  };
  onLinkClick?: (url: string) => void;
}


function applyStyles(element: Element | null, styles: Record<string, string | number>): void {
  if (!element || !(element instanceof HTMLElement)) return;
  
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(
      property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`),
      String(value)
    );
  });
}

export function ArticleRenderer({ content, settings, originalUrl: _originalUrl, onLinkClick: _onLinkClick }: ArticleRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  
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
  
  
  const processedContent = (() => {
    if (typeof window === 'undefined') return content; 
    
    
    const tempDiv = document.createElement('div');
    
    
    tempDiv.innerHTML = DOMPurify.sanitize(content, {
      ADD_TAGS: ['iframe'], 
      ADD_ATTR: [
        'allowfullscreen', 
        'frameborder', 
        'target', 
        'src', 
        'width', 
        'height',
        'allow',
        'loading'
      ],
    });
    
    
    const textNodes = [];
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
      if (textNode.nodeValue) {
        textNode.nodeValue = decodeHtmlEntities(textNode.nodeValue ?? '');
      }
    });
    
    
    const svgElements = tempDiv.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.remove();
    });
    
    
    const processIframes = () => {
      const iframes = tempDiv.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        const src = iframe.getAttribute('src') ?? '';
        
        
        const isYouTube = src.includes('youtube.com') ?? src.includes('youtu.be');
        
        const isVimeo = src.includes('vimeo.com');
        const isVideo = isYouTube ?? isVimeo ?? src.includes('video');
        
        if (isVideo) {
          
          const wrapper = document.createElement('div');
          wrapper.className = 'video-container';
          if (wrapper instanceof HTMLElement) {
            wrapper.style.position = 'relative';
            wrapper.style.paddingBottom = '56.25%'; 
            wrapper.style.height = '0';
            wrapper.style.overflow = 'hidden';
            wrapper.style.maxWidth = '100%';
            wrapper.style.marginTop = '1.5rem';
            wrapper.style.marginBottom = '1.5rem';
            wrapper.style.borderRadius = '4px';
            wrapper.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
          }
          
          
          if (!settings.showVideos && wrapper instanceof HTMLElement) {
            wrapper.style.display = 'none';
          }
          
          
          if (iframe instanceof HTMLElement) {
            iframe.style.position = 'absolute';
            iframe.style.top = '0';
            iframe.style.left = '0';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
          }
          
          
          iframe.setAttribute('allowfullscreen', 'true');
          iframe.setAttribute('loading', 'lazy');
          
          
          if (isYouTube && src.startsWith('http:')) {
            iframe.setAttribute('src', src.replace('http:', 'https:'));
          }
          
          
          iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
          
          
          const parent = iframe.parentNode;
          if (parent) {
            
            wrapper.appendChild(iframe.cloneNode(true));
            
            parent.replaceChild(wrapper, iframe);
          }
        }
      });
    };
    
    
    processIframes();
    
    
    const videoElements = tempDiv.querySelectorAll('video');
    videoElements.forEach(video => {
      
      if (!settings.showVideos) {
        applyStyles(video, { display: 'none' });
        
        
        const nextElement = video.nextElementSibling;
        if (nextElement && 
            (nextElement.tagName === 'FIGCAPTION' || 
             nextElement.classList.contains('caption') ||
             nextElement.classList.contains('video-caption'))) {
          applyStyles(nextElement, { display: 'none' });
        }
      } else {
        
        applyStyles(video, {
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          margin: '1.5rem auto',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderRadius: '4px'
        });
        
        
        video.setAttribute('controls', 'true');
        video.setAttribute('preload', 'metadata');
      }
    });
    
    
    const figures = tempDiv.querySelectorAll('figure');
    figures.forEach(figure => {
      const img = figure.querySelector('img');
      const svg = figure.querySelector('svg');
      const figcaption = figure.querySelector('figcaption');
      const video = figure.querySelector('video');
      const iframe = figure.querySelector('iframe');
      
      
      applyStyles(figure, {
        margin: '1.5rem 0',
        textAlign: 'center'
      });
      
      
      if (svg) {
        figure.remove();
        return;
      }
      
      
      if ((video || iframe) && !settings.showVideos) {
        applyStyles(figure, { display: 'none' });
        return;
      }
      
      
      if (img) {
        const src = img.getAttribute('src') ?? '';
        const type = img.getAttribute('type') ?? '';
        const isSvg = src.toLowerCase().endsWith('.svg') || type.includes('svg') || (img.parentElement?.tagName === 'SVG');
        
        if (isSvg) {
          
          figure.remove();
        } else if (!settings.showImages) {
          
          applyStyles(figure, { display: 'none' });
        } else {
          
          applyStyles(img, {
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            borderRadius: '4px'
          });
          
          
          img.setAttribute('loading', 'lazy');
          
          
          if (figcaption) {
            applyStyles(figcaption, {
              marginTop: '0.5rem',
              fontSize: `${settings.fontSize - 2}px`,
              color: '#666',
              fontStyle: 'italic',
              textAlign: 'center'
            });
          }
        }
      } else if (figcaption && !settings.showImages && !video && !iframe) {
        
        applyStyles(figure, { display: 'none' });
      }
    });
    
    
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src') ?? '';
      const type = img.getAttribute('type') ?? '';
      
      
      const isSvg = src.toLowerCase().endsWith('.svg') || 
                    type.includes('svg') || 
                    (img.parentElement?.tagName === 'SVG');
      
      if (isSvg) {
        
        img.remove();
      } else if (!settings.showImages) {
        
        applyStyles(img, { display: 'none' });
        
        
        const nextElement = img.nextElementSibling;
        if (nextElement && 
            (nextElement.tagName === 'FIGCAPTION' || 
             nextElement.classList.contains('caption') ||
             nextElement.classList.contains('image-caption'))) {
          applyStyles(nextElement, { display: 'none' });
        }
        
        
        const parent = img.parentElement;
        if (parent) {
          const caption = parent.querySelector('figcaption, .caption, .image-caption');
          if (caption) {
            applyStyles(caption, { display: 'none' });
          }
        }
      } else {
        
        applyStyles(img, {
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          margin: '1.5rem auto',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          borderRadius: '4px'
        });
        
        
        img.setAttribute('loading', 'lazy');
        
        
        img.setAttribute('onerror', "this.onerror=null; this.style.display='none';");
      }
    });
    
    
    if (!settings.showImages) {
      const captions = tempDiv.querySelectorAll('figcaption, .caption, .image-caption');
      captions.forEach(caption => {
        
        const parentFigure = caption.closest('figure');
        const hasVideo = parentFigure && (parentFigure.querySelector('video') ?? parentFigure.querySelector('iframe'));
        
        if (!hasVideo || !settings.showVideos) {
          applyStyles(caption, { display: 'none' });
        }
      });
    }
    
    
    const preElements = tempDiv.querySelectorAll('pre');
    preElements.forEach(pre => {
      applyStyles(pre, {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        overflowX: 'auto',
        marginBottom: '1.5rem',
        fontSize: `${settings.fontSize - 2}px`,
        fontFamily: 'monospace',
        border: '1px solid #edf0f2',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      });
    });
    
    
    const codeElements = tempDiv.querySelectorAll('code:not(pre code)');
    codeElements.forEach(code => {
      applyStyles(code, {
        fontFamily: 'monospace',
        fontSize: '0.875em',
        backgroundColor: '#f8f9fa',
        padding: '0.2em 0.4em',
        color: '#5a6270',
        borderRadius: '3px'
      });
    });
    
    
    const tables = tempDiv.querySelectorAll('table');
    tables.forEach(table => {
      
      const wrapper = document.createElement('div');
      wrapper.style.overflowX = 'auto';
      wrapper.style.marginBottom = '1.5rem';
      
      
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = `${settings.fontSize - 1}px`;
      
      
      const cells = table.querySelectorAll('th, td');
      cells.forEach((cell) => {
        applyStyles(cell, {
          border: '1px solid #edf0f2',
          padding: '0.5rem',
          textAlign: 'left',
          verticalAlign: 'top'
        });
      });
      
      
      const headerCells = table.querySelectorAll('th');
      headerCells.forEach((cell) => {
        cell.style.backgroundColor = '#f8f9fa';
        cell.style.fontWeight = 'bold';
      });
      
      
      const parent = table.parentNode;
      if (parent && parent instanceof HTMLElement && parent.tagName !== 'DIV') {
        wrapper.appendChild(table.cloneNode(true));
        parent.replaceChild(wrapper, table);
      }
    });
    
    
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      link.style.color = '#5a6270';
      link.style.textDecoration = 'none';
      link.style.borderBottom = '1px solid #e1e5ea';
      link.style.transition = 'all 0.2s';
      
      
      if (link.getAttribute('href')?.startsWith('http')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
      applyStyles(list, {
        paddingLeft: '1.5rem',
        marginBottom: '1.25rem',
        color: '#424750',
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight.toString()
      });
      
      
      if (list.tagName === 'UL') {
        applyStyles(list, { 
          listStyleType: 'disc',
          
          webkitPaddingStart: '1.5rem'
        });
      } else {
        applyStyles(list, { listStyleType: 'decimal' });
      }
      
      
      const listItems = list.querySelectorAll('li');
      listItems.forEach(item => {
        item.style.marginTop = '0.5rem';
        item.style.marginBottom = '0.5rem';
        item.style.paddingRight = '0.5rem';
        
        
        item.style.display = 'list-item';
      });
    });
    
    
    const nestedLists = tempDiv.querySelectorAll('li > ul, li > ol');
    nestedLists.forEach(nestedList => {
      applyStyles(nestedList, {
        marginTop: '0.5rem',
        marginBottom: '0.5rem',
        paddingLeft: '1.5rem'
      });
      
      if (nestedList.tagName === 'UL') {
        applyStyles(nestedList, { listStyleType: 'circle' });
        
        
        const deepNestedUl = nestedList.querySelectorAll('li > ul');
        deepNestedUl.forEach(deepList => {
          applyStyles(deepList, {
            listStyleType: 'square',
            paddingLeft: '1.5rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          });
        });
      } else {
        applyStyles(nestedList, { listStyleType: 'lower-alpha' });
        
        
        const deepNestedOl = nestedList.querySelectorAll('li > ol');
        deepNestedOl.forEach(deepList => {
          applyStyles(deepList, {
            listStyleType: 'lower-roman',
            paddingLeft: '1.5rem',
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          });
        });
      }
    });
    
    
    const listItems = tempDiv.querySelectorAll('li');
    listItems.forEach(item => {
      item.style.marginTop = '0.5rem';
      item.style.marginBottom = '0.5rem';
      
      
      item.style.paddingRight = '0.5rem';
      item.style.position = 'relative';
      
      
      if (item.innerHTML.trim() === '') {
        item.style.display = 'none'; 
      }
      
      
      const hasBlockElements = item.querySelector('p, div, table, blockquote, pre');
      if (hasBlockElements) {
        
        item.style.marginBottom = '0.75rem';
        
        
        const blockElements = item.querySelectorAll('p, div, table, blockquote, pre');
        blockElements.forEach(element => {
          applyStyles(element, {
            marginTop: '0.5rem',
            marginBottom: '0.5rem'
          });
        });
      }
    });
    
    
    const blockquotes = tempDiv.querySelectorAll('blockquote');
    blockquotes.forEach(quote => {
      quote.style.borderLeft = '4px solid #e1e5ea';
      quote.style.paddingLeft = '1.25rem';
      quote.style.marginLeft = '0';
      quote.style.marginRight = '0';
      quote.style.marginTop = '1.5rem';
      quote.style.marginBottom = '1.5rem';
      quote.style.fontStyle = 'italic';
      quote.style.color = '#5a6270';
    });
    
    
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      applyStyles(heading, {
        fontWeight: 'bold',
        color: '#2c3038',
        marginTop: '2rem',
        marginBottom: '1rem',
        lineHeight: '1.3'
      });
      
      
      switch (heading.tagName) {
        case 'H1':
          applyStyles(heading, {
            fontSize: `${settings.fontSize * 1.8}px`,
            borderBottom: '1px solid #e1e5ea',
            paddingBottom: '0.5rem'
          });
          break;
        case 'H2':
          applyStyles(heading, {
            fontSize: `${settings.fontSize * 1.5}px`,
            borderBottom: '1px solid #e1e5ea',
            paddingBottom: '0.3rem'
          });
          break;
        case 'H3':
          applyStyles(heading, { fontSize: `${settings.fontSize * 1.3}px` });
          break;
        case 'H4':
          applyStyles(heading, { fontSize: `${settings.fontSize * 1.1}px` });
          break;
        case 'H5':
          applyStyles(heading, { 
            fontSize: `${settings.fontSize * 1.0}px`,
            textTransform: 'uppercase'
          });
          break;
        case 'H6':
          applyStyles(heading, {
            fontSize: `${settings.fontSize * 0.9}px`,
            color: '#5a6270'
          });
          break;
      }
      
      
      const headingText = heading.textContent ?? '';
      const id = headingText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      if (id) {
        heading.id = id;
      }
    });
    
    
    const paragraphs = tempDiv.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.style.marginBottom = '1.25rem';
      p.style.fontSize = `${settings.fontSize}px`;
      p.style.lineHeight = settings.lineHeight.toString();
      p.style.textAlign = settings.textAlign;
      p.style.color = '#424750';
    });
    
    return tempDiv.innerHTML;
  })();
  
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    
    const tableWrappers = container.querySelectorAll('.table-wrapper .table-wrapper');
    tableWrappers.forEach(wrapper => {
      const parent = wrapper.parentElement;
      if (parent?.classList.contains('table-wrapper')) {
        
        const table = wrapper.querySelector('table');
        if (table) {
          parent.appendChild(table);
          wrapper.remove();
        }
      }
    });
    
    
    const svgElements = container.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.remove();
    });
    
    
    if (!settings.showImages) {
      const captions = container.querySelectorAll('figcaption, .caption, .image-caption');
      captions.forEach(caption => {
        
        const parentFigure = caption.closest('figure');
        const hasVideo = parentFigure && (parentFigure.querySelector('video') ?? parentFigure.querySelector('iframe'));
        
        if (!hasVideo || !settings.showVideos) {
          applyStyles(caption, { display: 'none' });
        }
      });
    }
    
    
    if (!settings.showVideos) {
      const videos = container.querySelectorAll('video, iframe');
      videos.forEach(video => {
        applyStyles(video, { display: 'none' });
        
        
        const parentFigure = video.closest('figure');
        if (parentFigure) {
          applyStyles(parentFigure, { display: 'none' });
        }
      });
      
      
      const videoContainers = container.querySelectorAll('.video-container');
      videoContainers.forEach(container => {
        applyStyles(container, { display: 'none' });
      });
    }
    
    
    const images = container.querySelectorAll('img:not(.no-zoom)');
    images.forEach(img => {
      if (settings.showImages) {
        applyStyles(img, { cursor: 'pointer' });
        img.addEventListener('click', () => {
          const overlay = document.createElement('div');
          
          
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.zIndex = '9999';
          overlay.style.cursor = 'pointer';
          
          const zoomedImg = document.createElement('img');
          
          
          if (img instanceof HTMLImageElement) {
            zoomedImg.src = img.src;
          }
          
          zoomedImg.style.maxWidth = '90%';
          zoomedImg.style.maxHeight = '90%';
          zoomedImg.style.objectFit = 'contain';
          zoomedImg.style.borderRadius = '4px';
          
          overlay.appendChild(zoomedImg);
          document.body.appendChild(overlay);
          
          overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
          });
        });
      }
    });
    
  }, [settings.showImages, settings.showVideos]);
  
  return (
    <div 
      ref={containerRef}
      className={`article-content ${getFontFamilyClass()}`}
      style={{
        fontSize: `${settings.fontSize}px`,
        lineHeight: `${settings.lineHeight}`,
        textAlign: settings.textAlign,
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
} 