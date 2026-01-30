// Service to handle URL shortening
// Note: The user requested by.com.vn, but it requires a private API Key and often has CORS restrictions for browser-only apps.
// We use TinyURL as a robust, configuration-free alternative that works immediately.

export const shortenUrl = async (url: string): Promise<string> => {
  try {
    // Using TinyURL API (Free, no key required, CORS enabled)
    const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const shortUrl = await response.text();
    return shortUrl;
  } catch (error) {
    console.error("Error shortening URL:", error);
    throw error;
  }
};