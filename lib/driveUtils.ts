/**
 * Formats Google Drive share links into direct image URLs.
 * Handles formats like:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 */
export function formatDriveImageUrl(url: string): string {
  if (!url) return "";

  // If it's already a direct Google usercontent URL or standard local/external image URL
  if (url.includes("lh3.googleusercontent.com/d/")) {
    return url;
  }

  // Extract ID from /file/d/FILE_ID/ pattern
  const fileDPattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const dMatch = url.match(fileDPattern);
  if (dMatch && dMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${dMatch[1]}`;
  }

  // Extract ID from ?id=FILE_ID pattern
  const idQueryPattern = /[?&]id=([a-zA-Z0-9_-]+)/;
  const idMatch = url.match(idQueryPattern);
  if (idMatch && idMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  return url;
}
