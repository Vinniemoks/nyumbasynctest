/**
 * Subresource Integrity (SRI) Helper
 * Ensures external resources haven't been tampered with
 */

export const TRUSTED_CDNS = {
  fontAwesome: {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    integrity: 'sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg==',
    crossorigin: 'anonymous'
  },
  googleFonts: {
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    // Google Fonts doesn't support SRI, but we can verify the domain
    trusted: true
  }
};

/**
 * Generate SRI hash for a resource
 */
export async function generateSRIHash(url) {
  try {
    const response = await fetch(url);
    const content = await response.text();
    
    // Convert to ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // Generate SHA-384 hash
    const hashBuffer = await crypto.subtle.digest('SHA-384', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashBase64 = btoa(String.fromCharCode.apply(null, hashArray));
    
    return `sha384-${hashBase64}`;
  } catch (error) {
    console.error('Failed to generate SRI hash:', error);
    return null;
  }
}

/**
 * Validate external script/link tags have SRI
 */
export function validateExternalResources() {
  if (typeof document === 'undefined') return { passed: [], failed: [] };

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Check all external scripts
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      const integrity = script.getAttribute('integrity');
      const crossorigin = script.getAttribute('crossorigin');

      if (!integrity) {
        results.failed.push({
          type: 'script',
          src,
          reason: 'Missing integrity attribute'
        });
      } else if (!crossorigin) {
        results.warnings.push({
          type: 'script',
          src,
          reason: 'Missing crossorigin attribute'
        });
      } else {
        results.passed.push({ type: 'script', src });
      }
    }
  });

  // Check all external stylesheets
  document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      const integrity = link.getAttribute('integrity');
      const crossorigin = link.getAttribute('crossorigin');

      if (!integrity && !TRUSTED_CDNS.googleFonts.url.includes(new URL(href).hostname)) {
        results.failed.push({
          type: 'stylesheet',
          href,
          reason: 'Missing integrity attribute'
        });
      } else if (!crossorigin) {
        results.warnings.push({
          type: 'stylesheet',
          href,
          reason: 'Missing crossorigin attribute'
        });
      } else {
        results.passed.push({ type: 'stylesheet', href });
      }
    }
  });

  return results;
}
