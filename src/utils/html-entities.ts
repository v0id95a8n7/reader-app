/**
 * Utility functions for handling HTML entities
 */

/**
 * Decodes HTML entities in a string
 * For example, converts &amp; to &, &#x27; to ', &#x2F; to /, etc.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  
  
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
    
    
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&sbquo;/g, '‚')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&bdquo;/g, '„')
    .replace(/&hellip;/g, '…')
    .replace(/&bull;/g, '•')
    .replace(/&middot;/g, '·')
    
    
    .replace(/&nbsp;/g, ' ')
    .replace(/&ensp;/g, ' ')
    .replace(/&emsp;/g, ' ')
    .replace(/&thinsp;/g, ' ')
    
    
    .replace(/&euro;/g, '€')
    .replace(/&pound;/g, '£')
    .replace(/&yen;/g, '¥')
    .replace(/&cent;/g, '¢')
    
    
    .replace(/&plusmn;/g, '±')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&sum;/g, '∑')
    .replace(/&radic;/g, '√')
    .replace(/&infin;/g, '∞')
    
    
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&agrave;/g, 'à')
    .replace(/&egrave;/g, 'è')
    .replace(/&igrave;/g, 'ì')
    .replace(/&ograve;/g, 'ò')
    .replace(/&ugrave;/g, 'ù')
    .replace(/&Agrave;/g, 'À')
    .replace(/&Egrave;/g, 'È')
    .replace(/&Igrave;/g, 'Ì')
    .replace(/&Ograve;/g, 'Ò')
    .replace(/&Ugrave;/g, 'Ù')
    
    
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (match, hex: string) => String.fromCharCode(Number(parseInt(hex, 16))));
} 