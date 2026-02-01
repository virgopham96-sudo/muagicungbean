import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { ConvertedLink } from '../types';
import { shortenUrl } from '../services/shortenerService';

interface ResultCardProps {
  result: ConvertedLink;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [isShortening, setIsShortening] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const processLink = async () => {
      const isShopeeShortLink = result.affiliateUrl.includes('shp.ee') || 
                                result.affiliateUrl.includes('vn.shp.ee') || 
                                result.affiliateUrl.includes('s.shopee.vn');

      if (isShopeeShortLink) {
        if (isMounted) {
          setDisplayUrl(result.affiliateUrl);
          setIsShortening(false);
        }
        return;
      }

      setIsShortening(true);
      setDisplayUrl('');
      
      try {
        const short = await shortenUrl(result.affiliateUrl);
        if (isMounted) setDisplayUrl(short);
      } catch (error) {
        console.error("Shortening failed, falling back to original", error);
        if (isMounted) setDisplayUrl(result.affiliateUrl);
      } finally {
        if (isMounted) setIsShortening(false);
      }
    };

    processLink();
    
    return () => {
      isMounted = false;
    };
  }, [result]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Link mua hàng Shopee',
          url: displayUrl
        });
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col gap-5">
          {/* Main Short Link Display */}
          <div className="relative">
            <input
              readOnly
              value={isShortening ? 'Đang tạo link rút gọn...' : displayUrl}
              className={`w-full bg-gray-50 border-2 rounded-2xl px-6 py-5 pr-14 font-mono text-base font-bold focus:outline-none transition-all ${
                isShortening 
                  ? 'text-gray-400 border-gray-100 italic' 
                  : 'text-shopee border-shopee/10 bg-shopee/[0.02]'
              }`}
            />
            {!isShortening && displayUrl && (
              <a 
                href={displayUrl} 
                target="_blank" 
                rel="noreferrer"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-shopee p-1.5 rounded-xl hover:bg-shopee/10 transition-colors"
                title="Mở link thử"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCopy}
              disabled={isShortening}
              className={`px-6 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                copied 
                  ? 'bg-green-500 text-white shadow-green-100' 
                  : isShortening
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-shopee text-white hover:shadow-orange-200 hover:brightness-105'
              }`}
            >
              {isShortening ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              {copied ? 'ĐÃ COPY' : 'COPY LINK'}
            </button>

            <button
              onClick={handleShare}
              disabled={isShortening}
              className="px-6 py-5 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md shadow-gray-200 disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
              CHIA SẺ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};