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
      setUrlInput('');
    } catch (e) {
      setError('Có lỗi xảy ra khi xử lý link. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-4 overflow-x-hidden">
      {/* Reduced Header Height for better mobile fit */}
      <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-[#ee4d2d] to-[#ff7337] z-0 rounded-b-[1.5rem] shadow-lg"></div>

      <div className="relative z-10 container mx-auto px-4 pt-4 max-w-md">
        {/* Even more compact Logo & Title */}
        <div className="text-center mb-4 text-white">
          <div className="inline-flex bg-white/20 p-2.5 rounded-xl backdrop-blur-md mb-2 shadow-inner">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Mua gì cùng Bean</h1>
          <p className="text-white/80 text-[10px] font-medium uppercase tracking-wider">Shopee Affiliate Link</p>
        </div>

        {/* Compressed Input Card */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-3 border border-white/50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Dán link sản phẩm
            </label>
            <div className="group relative">
              <Info className="w-3 h-3 text-gray-300 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 text-white text-[9px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl z-20">
                Tự động tối ưu cho App Shopee.
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="shopee.vn/..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-shopee/5 focus:border-shopee focus:bg-white outline-none transition-all text-sm font-medium"
              onKeyDown={(e) => e.key === 'Enter' && convertLink()}
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-1.5 text-red-500 text-[9px] mt-1.5 font-medium">
              <div className="w-1 h-1 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <button
            onClick={convertLink}
            className="w-full mt-3 bg-gradient-to-r from-shopee to-[#ff7337] text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-orange-100 transition-all transform active:scale-95 flex justify-center items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            TẠO LINK RÚT GỌN
          </button>
        </div>

        {/* Result Area - Minimized for one-screen view */}
        {currentResult && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-1.5 mb-1.5 ml-2">
              <div className="w-1 h-1 rounded-full bg-green-500"></div>
              <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Kết quả rút gọn</h2>
            </div>
            <ResultCard result={currentResult} />
          </div>
        )}

        <div className="mt-6 text-center">
            <div className="inline-block p-1 px-3 bg-gray-100 rounded-full text-[8px] font-bold text-gray-400 uppercase tracking-widest">
              v2.4 ✦ Mobile Optimized
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;