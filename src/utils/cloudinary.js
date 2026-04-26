/**
 * Appends Cloudinary auto-optimization parameters to a raw image URL.
 * If the URL is not a Cloudinary URL, it is returned as-is.
 *
 * @param {string | null | undefined} url - Raw image URL from the backend
 * @param {string} [transformations='f_auto,q_auto,w_800'] - Cloudinary transformation string
 * @returns {string} Optimized URL or original URL
 */
export function optimizeImageUrl(url, transformations = 'f_auto,q_auto,w_800') {
  if (!url) return '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // Insert transformation params before the version or file segment
  // Pattern: .../upload/{transformations}/v...
  return url.replace('/upload/', `/upload/${transformations}/`);
}
