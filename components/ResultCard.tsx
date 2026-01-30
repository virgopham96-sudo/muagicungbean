import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { ConvertedLink } from '../types';
import { shortenUrl } from '../services/shortenerService';

interface ResultCardProps {
  result: ConvertedLink;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string>('');
  const [isShortening, setIsShortening] = useState(false);

  // Automatically shorten link when result changes
  useEffect(() => {
    let isMounted = true;
    const processLink = async () => {
      // Check if the URL is already a Shopee short link.
      // If it is, do NOT shorten it again with TinyURL.
      // Double redirection (TinyURL -> vn.shp.ee -> Shopee App) often breaks Deep Linking on mobile.
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

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <LinkIcon className="w-3 h-3" /> Link Rút Gọn
        </span>
        <span className="text-xs text-gray-400">{new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>

      {/* Main Link Area */}
      <div className="p-6">
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full relative">
              <input
                readOnly
                value={isShortening ? 'Đang tạo link rút gọn...' : displayUrl}
                className={`w-full border-2 rounded-lg px-4 py-3 pr-12 font-mono text-base font-semibold focus:outline-none shadow-sm transition-colors ${
                  isShortening 
                    ? 'bg-gray-50 text-gray-400 border-gray-100 italic' 
                    : 'bg-white text-shopee border-shopee/20'
                }`}
              />
              {!isShortening && displayUrl && (
                <a 
                  href={displayUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-shopee hover:text-shopee-dark"
                  title="Mở link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <button
              onClick={handleCopy}
              disabled={isShortening}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                copied 
                  ? 'bg-green-500 text-white shadow-green-200' 
                  : isShortening
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-shopee text-white hover:bg-shopee-dark shadow-orange-200'
              }`}
            >
              {isShortening ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              {copied ? 'Đã Copy' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};