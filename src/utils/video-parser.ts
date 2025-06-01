/**
 * Заглушка для будущего функционала обработки видео
 * В настоящее время функционал отключен и будет реализован позже
 */

export function isVideoUrl(_url: string): boolean {
  return false;
}

export function getVideoEmbedUrl(_url: string): string | null {
  return null;
}

export function createVideoEmbedHtml(_url: string): string | null {
  return null;
}

export function replaceVideoLinksWithEmbeds(html: string): string {
  return html;
}

export function processVideoLinks(html: string): string {
  return html;
} 