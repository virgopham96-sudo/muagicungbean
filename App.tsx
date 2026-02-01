import React, { useState } from 'react';
import { Link as LinkIcon, ShoppingBag, Zap, Info } from 'lucide-react';
import { ResultCard } from './components/ResultCard';
import { UserSettings, ConvertedLink } from './types';

// Constants
const DEFAULT_SETTINGS: UserSettings = {
  affiliateId: '17362210029',
  subId: 'WebTool',
  universalLinkEnabled: true,
};

// Helper to extract product name from URL
const extractProductName = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('shp.ee') || urlObj.hostname.includes('s.shopee.vn')) {
      return 'Sản phẩm từ Link rút gọn';
    }
    const pathname = urlObj.pathname;
    let slug = pathname.replace('/universal-link', '');
    if (slug.startsWith('/')) slug = slug.substring(1);
    if (!slug) return 'Trang chủ Shopee';
    if (slug.includes('-i.')) {
      slug = slug.split('-i.')[0];
    } else {
      const parts = slug.split('/');
      slug = parts[parts.length - 1];
    }
    const formattedName = slug.replace(/-/g, ' ').trim();
    return formattedName ? formattedName.charAt(0).toUpperCase() + formattedName.slice(1) : 'Sản phẩm Shopee';
  } catch (e) {
    return 'Link Shopee';
  }
};

function App() {
  const [urlInput, setUrlInput] = useState('');
  const [currentResult, setCurrentResult] = useState<ConvertedLink | null>(null);
  const [error, setError] = useState('');

  const convertLink = () => {
    setError('');
    const input = urlInput.trim();
    
    if (!input) {
      setError('Vui lòng nhập link Shopee');
      return;
    }
    
    if (!input.includes('shopee') && !input.includes('shp.ee')) {
      setError('Link không hợp lệ. Hãy dán link từ shopee.vn hoặc vn.shp.ee');
      return;
    }

    try {
      let affiliateUrl = '';
      const isShortLink = input.includes('shp.ee') || input.includes('s.shopee.vn');
      
      // Standardize Affiliate ID (ensure an_ prefix for tracking)
      const cleanId = DEFAULT_SETTINGS.affiliateId.startsWith('an_') 
        ? DEFAULT_SETTINGS.affiliateId 
        : `an_${DEFAULT_SETTINGS.affiliateId}`;

      const params = new URLSearchParams();
      params.append('utm_source', cleanId);
      params.append('utm_medium', 'affiliates');
      params.append('utm_campaign', '-');
      if (DEFAULT_SETTINGS.subId) params.append('utm_content', DEFAULT_SETTINGS.subId);
      params.append('deep_and_deferred', '1');

      if (isShortLink) {
        const separator = input.includes('?') ? '&' : '?';
        affiliateUrl = `${input}${separator}${params.toString()}`;
      } else {
        const urlObj = new URL(input);
        const path = urlObj.pathname.startsWith('/universal-link') 
          ? urlObj.pathname.replace('/universal-link', '') 
          : urlObj.pathname;
        
        affiliateUrl = `https://shopee.vn/universal-link${path}?${params.toString()}`;
      }

      const newResult: ConvertedLink = {
        originalUrl: input,
        affiliateUrl: affiliateUrl,
        timestamp: Date.now(),
        productName: extractProductName(input),
      };

      setCurrentResult(newResult);
      setUrlInput(''); // Clear input for next use
    } catch (e) {
      setError('Có lỗi xảy ra khi xử lý link. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-20">
      {/* Dynamic Header Background */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-br from-[#ee4d2d] to-[#ff7337] z-0 rounded-b-[3rem] shadow-lg"></div>

      <div className="relative z-10 container mx-auto px-4 pt-10 max-w-xl">
        {/* Logo & Title */}
        <div className="text-center mb-10 text-white">
          <div className="inline-flex bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-4 shadow-inner">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Mua gì cùng Bean</h1>
          <p className="text-white/90 font-medium">Chuyển đổi link Affiliate Shopee</p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-white/50">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Dán link sản phẩm vào đây
            </label>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-300 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-800 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl z-20">
                Sử dụng link gốc (link dài) để đạt hiệu quả tốt nhất.
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://shopee.vn/..."
              className="w-full pl-14 pr-4 py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-shopee/10 focus:border-shopee focus:bg-white outline-none transition-all text-base font-medium"
              onKeyDown={(e) => e.key === 'Enter' && convertLink()}
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-3 font-medium animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <button
            onClick={convertLink}
            className="w-full mt-6 bg-gradient-to-r from-shopee to-[#ff7337] hover:brightness-105 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-100 transition-all transform active:scale-[0.98] flex justify-center items-center gap-3"
          >
            <Zap className="w-6 h-6 fill-white" />
            TẠO LINK RÚT GỌN
          </button>
        </div>

        {/* Result Area - Only shows the most recent conversion */}
        {currentResult && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4 ml-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Link đã chuyển đổi</h2>
            </div>
            <ResultCard result={currentResult} />
          </div>
        )}

        <div className="mt-16 text-center">
            <div className="inline-block p-1 px-3 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Mua gì cùng Bean ✦ v2.2
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;