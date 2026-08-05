import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Share2, QrCode, Tag, ShoppingCart } from 'lucide-react';
import { ConvertedLink } from '../types';

interface ResultCardProps {
  result: ConvertedLink;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const displayUrl = result.shortUrl || result.affiliateUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: result.productName || 'Sản phẩm Shopee',
          text: `Mua ngay sản phẩm trên Shopee với giá cực ưu đãi:`,
          url: displayUrl
        });
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetUrl = result.shortUrl || result.affiliateUrl || result.rawLink;
    if (!targetUrl) return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      try {
        if (window.top && window.top !== window) {
          window.top.location.href = targetUrl;
          return;
        }
      } catch (err) {
        // Fallback for cross-origin frame restriction
      }
      window.location.href = targetUrl;
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // QR Code URL using api.qrserver.com
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(displayUrl)}`;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-[#ff7337] px-4 py-2.5 flex items-center justify-between text-white text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span>Link Shopee Rút Gọn</span>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
          Ready to Share
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Product Details Header if present */}
        {result.productName && (
          <div className="flex items-start gap-2.5 pb-2 border-b border-gray-100">
            <div className="p-2 bg-orange-50 text-shopee rounded-xl shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-gray-900 truncate">
                {result.productName}
              </h3>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">
                {result.originalUrl}
              </p>
            </div>
          </div>
        )}

        {/* Display Converted Short URL */}
        <div>
          <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Link tiếp thị liên kết (Rút gọn)
          </label>
          <div className="relative flex items-center">
            <input
              readOnly
              value={displayUrl}
              className="w-full bg-orange-50/60 border border-orange-200 text-shopee rounded-xl px-3.5 py-2.5 pr-10 font-mono text-xs font-bold focus:outline-none"
            />
            <a
              href={displayUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute right-2.5 p-1 text-shopee hover:bg-shopee/10 rounded-lg transition"
              title="Mở link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCopyLink}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition transform active:scale-95 shadow-sm ${
              copiedLink
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-shopee to-[#ff7337] text-white'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Đã Copy!' : 'Copy Link'}
          </button>

          <a
            href={displayUrl}
            onClick={handleBuyNow}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition transform active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Mua Ngay
          </a>

          <button
            onClick={() => setShowQr(!showQr)}
            className="py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-gray-800 transition transform active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5" />
            Mã QR
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-gray-500 font-mono">
          {result.shopId && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 text-gray-400" /> Shop: {result.shopId}
            </span>
          )}
          {result.itemId && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-md">Item: {result.itemId}</span>
          )}
          {result.affiliateId && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-md">ID: {result.affiliateId}</span>
          )}
          <button
            onClick={handleShare}
            className="ml-auto text-shopee font-semibold hover:underline flex items-center gap-1 text-[10px]"
          >
            <Share2 className="w-3 h-3" /> Chia sẻ
          </button>
        </div>

        {/* Collapsible QR Code View */}
        {showQr && (
          <div className="pt-3 border-t border-gray-100 text-center animate-in fade-in duration-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Quét mã QR để truy cập link Shopee
            </p>
            <div className="inline-block p-2 bg-white border border-gray-200 rounded-xl shadow-md">
              <img src={qrCodeUrl} alt="QR Code Link Shopee" className="w-40 h-40 mx-auto" />
            </div>
            <div className="mt-2">
              <a
                href={qrCodeUrl}
                download="shopee-qr.png"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-shopee font-bold hover:underline"
              >
                Tải về ảnh QR Code
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
