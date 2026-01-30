import React, { useState } from 'react';
import { Link as LinkIcon, ShoppingBag, Zap } from 'lucide-react';
import { ResultCard } from './components/ResultCard';
import { UserSettings, ConvertedLink } from './types';

// Constants
// Hardcoded settings as requested by the user
const DEFAULT_SETTINGS: UserSettings = {
  affiliateId: '17362210029',
  subId: 'Web Tool',
  universalLinkEnabled: true,
};

// Helper to extract product name from URL
const extractProductName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Check for short link domains
    if (urlObj.hostname.includes('shp.ee') || urlObj.hostname.includes('s.shopee.vn')) {
      return 'Sản phẩm Shopee (Link rút gọn)';
    }

    // Typical Shopee URL: https://shopee.vn/Ten-San-Pham-i.123.456
    const pathname = urlObj.pathname;
    
    // Attempt to find the slug part
    // 1. Remove universal-link prefix if present
    // 2. Remove leading slash
    let slug = pathname.replace('/universal-link', '');
    if (slug.startsWith('/')) slug = slug.substring(1);

    // If empty or root, return generic
    if (!slug) return 'Trang chủ Shopee';

    // Usually the slug ends with -i.shopId.productId
    // We split by -i. to get the name part
    if (slug.includes('-i.')) {
      slug = slug.split('-i.')[0];
    } else {
      // Sometimes it might just be the last segment if structure differs
      const parts = slug.split('/');
      slug = parts[parts.length - 1];
    }

    // Format: Replace hyphens with spaces and capitalize first letter
    const formattedName = slug.replace(/-/g, ' ').trim();
    if (!formattedName) return 'Sản phẩm Shopee';
    
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  } catch (e) {
    return 'Link Shopee';
  }
};

function App() {
  const [urlInput, setUrlInput] = useState('');
  // Use constant settings directly since configuration UI is removed
  const settings = DEFAULT_SETTINGS;
  
  const [currentResult, setCurrentResult] = useState<ConvertedLink | null>(null);
  const [error, setError] = useState('');

  const convertLink = () => {
    setError('');
    
    // Basic validation
    if (!urlInput.trim()) {
      setError('Vui lòng nhập link Shopee');
      return;
    }
    // Check for valid shopee domains including s.shopee.vn
    if (!urlInput.includes('shopee') && !urlInput.includes('shp.ee')) {
      setError('Link không hợp lệ. Vui lòng nhập link Shopee (shopee.vn, s.shopee.vn hoặc shp.ee)');
      return;
    }

    // --- CONVERSION LOGIC ---
    let affiliateUrl = '';
    const isShortLink = urlInput.includes('shp.ee') || urlInput.includes('s.shopee.vn');

    if (settings.universalLinkEnabled) {
      // Construction for Universal Link (Deep Link) pattern
      
      try {
        const urlObj = new URL(urlInput);
        
        // Handle short links (shp.ee or s.shopee.vn)
        // For short links, we CANNOT convert to universal-link structure because we don't know the product ID.
        // We simply append the UTM source.
        if (isShortLink) {
           const separator = urlInput.includes('?') ? '&' : '?';
           affiliateUrl = `${urlInput}${separator}utm_source=${settings.affiliateId}`;
        } else {
           // Standard shopee.vn link (long form) -> Convert to Universal Link
           const path = urlObj.pathname;
           // Universal Link base
           const baseUniversal = 'https://shopee.vn/universal-link';
           
           // Construct new params
           const params = new URLSearchParams();
           params.append('utm_source', settings.affiliateId);
           if (settings.subId) params.append('utm_content', settings.subId);
           params.append('deep_and_deferred', '1');
           
           affiliateUrl = `${baseUniversal}${path}?${params.toString()}`;
        }
      } catch (e) {
        // Fallback simple append
        const separator = urlInput.includes('?') ? '&' : '?';
        affiliateUrl = `${urlInput}${separator}utm_source=${settings.affiliateId}`;
      }
    } else {
      // Simple UTM Append for everything if Universal Link is disabled
      const separator = urlInput.includes('?') ? '&' : '?';
      let suffix = `utm_source=${settings.affiliateId}`;
      if (settings.subId) suffix += `&utm_content=${settings.subId}`;
      affiliateUrl = `${urlInput}${separator}${suffix}`;
    }

    const newResult: ConvertedLink = {
      originalUrl: urlInput,
      affiliateUrl: affiliateUrl,
      timestamp: Date.now(),
      productName: extractProductName(urlInput),
    };

    setCurrentResult(newResult);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-shopee to-shopee-dark z-0"></div>

      <div className="relative z-10 container mx-auto px-4 pt-8 max-w-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mua gì cùng Bean</h1>
              <p className="text-white/80 text-sm">Luôn sẵn sàng đồng hành mua sắm cùng bạn</p>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
            Dán link Shopee cần chuyển đổi
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://shopee.vn/..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-shopee focus:border-transparent outline-none transition text-base"
              onKeyDown={(e) => e.key === 'Enter' && convertLink()}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mt-2 ml-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>{error}</p>}

          <button
            onClick={convertLink}
            className="w-full mt-4 bg-gradient-to-r from-shopee to-shopee-dark hover:from-shopee-light hover:to-shopee text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition transform active:scale-[0.99] flex justify-center items-center gap-2"
          >
            <Zap className="w-5 h-5" fill="currentColor" />
            Chuyển Đổi Ngay
          </button>
        </div>

        {/* Result Area */}
        {currentResult && (
          <div className="mb-10">
            <ResultCard result={currentResult} />
          </div>
        )}

        <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">Powered by React ✦ Tailwind</p>
        </div>
      </div>
    </div>
  );
}

export default App;