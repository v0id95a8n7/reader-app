import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '~/utils/auth';

export async function GET(request: NextRequest) {
  try {
    
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }
    
    
    try {
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); 
      
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); 
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch article' },
          { status: 500 }
        );
      }
      
      
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) { 
        return NextResponse.json(
          { error: 'Article is too large to process' },
          { status: 413 }
        );
      }
      
      
      const reader = response.body?.getReader();
      if (!reader) {
        return NextResponse.json(
          { error: 'Failed to read article content' },
          { status: 500 }
        );
      }
      
      
      const chunks: Uint8Array[] = [];
      let totalSize = 0;
      const maxSize = 5 * 1024 * 1024; 
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        chunks.push(value);
        totalSize += value.length;
        
        if (totalSize > maxSize) {
          void reader.cancel('Article is too large');
          return NextResponse.json(
            { error: 'Article is too large to process' },
            { status: 413 }
          );
        }
      }
      
      
      const allChunks = new Uint8Array(totalSize);
      let position = 0;
      
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }
      
      
      const decoder = new TextDecoder('utf-8');
      const html = decoder.decode(allChunks);
      
      
      const processedHtml = preprocessHtml(html, url);
      
      
      return NextResponse.json({
        url,
        title: extractTitle(processedHtml, url),
        excerpt: extractExcerpt(processedHtml),
        siteName: extractSiteName(processedHtml, url),
        html: processedHtml,
        hasVideo: detectVideos(processedHtml),
      });
    } catch (error) {
      console.error('Error parsing article:', error);
      
      
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out while fetching the article' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to parse article' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Parse article error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}


function preprocessHtml(html: string, baseUrl: string): string {
  
  const originalHtml = html;
  
  
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  
  html = html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  
  let baseUrlObj: URL;
  try {
    baseUrlObj = new URL(baseUrl);
  } catch (e) {
    
    console.error("Invalid base URL:", e);
    return html;
  }
  
  
  if (typeof DOMParser === 'undefined') {
    return html;  
  }
  
  
  const parser = new DOMParser();
  let doc;
  
  try {
    doc = parser.parseFromString(html, 'text/html');
    
    
    const parserErrors = doc.querySelectorAll('parsererror');
    if (parserErrors.length > 0) {
      console.error("HTML parsing error, using original HTML");
      return originalHtml;
    }
    
    
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src) {
        try {
          
          if (!src.startsWith('http') && !src.startsWith('data:')) {
            const absoluteUrl = new URL(src, baseUrlObj).href;
            img.setAttribute('src', absoluteUrl);
          }
          
          
          img.setAttribute('loading', 'lazy');
          
          
          img.style.maxWidth = '100%';
        } catch (e) {
          console.error("Error processing image URL:", e);
        }
      }
    });
    
    
    const links = doc.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        try {
          
          if (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
            const absoluteUrl = new URL(href, baseUrlObj).href;
            link.setAttribute('href', absoluteUrl);
          }
          
          
          if (href.startsWith('http')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          }
        } catch (e) {
          console.error("Error processing link URL:", e);
        }
      }
    });
    
    
    const iframes = doc.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src) {
        try {
          
          if (!src.startsWith('http')) {
            const absoluteUrl = new URL(src, baseUrlObj).href;
            iframe.setAttribute('src', absoluteUrl);
          }
          
          
          if (src.includes('youtube.com') && src.startsWith('http:')) {
            iframe.setAttribute('src', src.replace('http:', 'https:'));
          }
          
          
          iframe.setAttribute('allowfullscreen', 'true');
          iframe.setAttribute('loading', 'lazy');
          void iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        } catch (e) {
          console.error("Error processing iframe URL:", e);
        }
      }
    });
    
    
    fixLists(doc);
    
    
    return doc.documentElement.outerHTML;
  } catch (e) {
    console.error("Error processing HTML:", e);
    return originalHtml;
  }
}


function fixLists(doc: Document) {
  
  const nestedLists = doc.querySelectorAll('ul ul, ul ol, ol ul, ol ol');
  nestedLists.forEach(nestedList => {
    
    const parent = nestedList.parentElement;
    if (parent && parent.tagName !== 'LI') {
      
      const previousLi = nestedList.previousElementSibling;
      if (previousLi && previousLi.tagName === 'LI') {
        
        previousLi.appendChild(nestedList);
      }
    }
  });
  
  
  const emptyLists = doc.querySelectorAll('ul:empty, ol:empty');
  emptyLists.forEach(emptyList => {
    emptyList.remove();
  });
  
  
  const lists = doc.querySelectorAll('ul, ol');
  lists.forEach(list => {
    
    const children = Array.from(list.children);
    for (const child of children) {
      if (child.tagName !== 'LI') {
        
        const li = doc.createElement('li');
        li.appendChild(child.cloneNode(true));
        list.replaceChild(li, child);
      }
    }
  });
}


function extractTitle(html: string, fallbackUrl: string): string {
  
  const ogTitleMatch = (/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i.exec(html)) ??
                       (/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i.exec(html));
  
  if (ogTitleMatch?.[1]) {
    
    const title = decodeHtmlEntities(ogTitleMatch[1].trim());
    return title;
  }
  
  
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (titleMatch?.[1]) {
    
    const title = decodeHtmlEntities(titleMatch[1].trim());
    return title;
  }
  
  
  const h1Match = /<h1[^>]*>([^<]+)<\/h1>/i.exec(html);
  if (h1Match?.[1]) {
    
    const title = decodeHtmlEntities(h1Match[1].trim());
    return title;
  }
  
  
  try {
    const domain = new URL(fallbackUrl).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return fallbackUrl;
  }
}


function extractExcerpt(html: string): string | undefined {
  
  const ogDescriptionMatch = (/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i.exec(html)) ??
                             (/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i.exec(html));
  
  if (ogDescriptionMatch?.[1]) {
    
    const description = decodeHtmlEntities(ogDescriptionMatch[1].trim());
    return description;
  }
  
  
  const descriptionMatch = (/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i.exec(html)) ?? 
                           (/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i.exec(html));
  
  if (descriptionMatch?.[1]) {
    
    const description = decodeHtmlEntities(descriptionMatch[1].trim());
    return description;
  }
  
  
  try {
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      
      const schemaDescription = doc.querySelector('[itemprop="description"]');
      if (schemaDescription?.textContent) {
        const text = decodeHtmlEntities(schemaDescription.textContent.trim());
        return text.length > 150 ? `${text.substring(0, 147)}...` : text;
      }
      
      
      const paragraphs = doc.querySelectorAll('p');
      for (const p of Array.from(paragraphs)) {
        
        if (p.closest('header') || p.closest('footer') || p.closest('nav')) {
          continue;
        }
        
        
        if (p.textContent && p.textContent.trim().length > 50) {
          const text = decodeHtmlEntities(p.textContent.trim());
          return text.length > 150 ? `${text.substring(0, 147)}...` : text;
        }
      }
      
      
      for (const p of Array.from(paragraphs)) {
        if (p.textContent && p.textContent.trim().length > 0) {
          const text = decodeHtmlEntities(p.textContent.trim());
          return text.length > 150 ? `${text.substring(0, 147)}...` : text;
        }
      }
    }
  } catch (e) {
    console.error("Error extracting excerpt using DOM:", e);
  }
  
  
  const paragraphMatch = /<p[^>]*>([^<]+)<\/p>/i.exec(html);
  
  if (paragraphMatch?.length > 1) {
    const text = decodeHtmlEntities(paragraphMatch[1].trim());
    return text.length > 150 ? `${text.substring(0, 147)}...` : text;
  }
  
  return undefined;
}


function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#39;/g, "'")
    .replace(/&#47;/g, '/')
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&hellip;/g, '...')
    .replace(/&#(\d+);/g, (match, dec: string) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (match, hex: string) => String.fromCharCode(Number(parseInt(hex, 16))));
}


function extractSiteName(html: string, url: string): string | undefined {
  
  const ogSiteNameMatch = (/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i.exec(html)) ??
                          (/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["'][^>]*>/i.exec(html));
  
  if (ogSiteNameMatch?.[1]) {
    return ogSiteNameMatch[1].trim();
  }
  
  
  const twitterSiteMatch = (/<meta[^>]*name=["']twitter:site["'][^>]*content=["']([^"']+)["'][^>]*>/i.exec(html)) ??
                           (/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:site["'][^>]*>/i.exec(html));
  
  if (twitterSiteMatch?.[1]) {
    const site = twitterSiteMatch[1].trim();
    return site.startsWith('@') ? site.substring(1) : site;
  }
  
  
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}


function detectVideos(html: string): boolean {
  
  const hasVideoTag = /<video[^>]*>/i.test(html);
  
  
  const hasYouTubeEmbed = /youtube\.com\/embed/i.test(html) || /youtu\.be/i.test(html);
  
  
  const hasVimeoEmbed = /player\.vimeo\.com/i.test(html);
  
  
  const hasOtherVideoEmbed = /video/i.test(html) && /<iframe[^>]*>/i.test(html);
  
  return hasVideoTag || hasYouTubeEmbed || hasVimeoEmbed || hasOtherVideoEmbed;
} 