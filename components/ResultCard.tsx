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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col gap-2">
          {/* Super Compact Display */}
          <div className="relative">
            <input
              readOnly
              value={isShortening ? 'Đang xử lý...' : displayUrl}
              className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-2.5 pr-10 font-mono text-xs font-bold focus:outline-none transition-all ${
                isShortening 
                  ? 'text-gray-400 border-gray-50 italic' 
                  : 'text-shopee border-shopee/5 bg-shopee/[0.02]'
              }`}
            />
            {!isShortening && displayUrl && (
              <a 
                href={displayUrl} 
                target="_blank" 
                rel="noreferrer"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-shopee p-1 rounded-lg hover:bg-shopee/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Compressed Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              disabled={isShortening}
              className={`py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : isShortening
                    ? 'bg-gray-100 text-gray-300'
                    : 'bg-shopee text-white active:scale-95'
              }`}
            >
              {isShortening ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? 'Xong' : 'Copy'}
            </button>

            <button
              onClick={handleShare}
              disabled={isShortening}
              className="py-3 bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Share2 className="w-3 h-3" />
              Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};