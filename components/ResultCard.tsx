import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Share2, Sparkles, QrCode, Tag, ShoppingCart, Send, Wand2, X } from 'lucide-react';
import { ConvertedLink, Platform, MarketingContent } from '../types';

interface ResultCardProps {
  result: ConvertedLink;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showMarketingModal, setShowMarketingModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [marketingContent, setMarketingContent] = useState<MarketingContent | null>(null);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);

  const displayUrl = result.shortUrl || result.affiliateUrl;
  const rawUrl = result.rawLink || result.affiliateUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawUrl);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
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

  const handleGenerateCopy = async (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsGeneratingCopy(true);
    try {
      const res = await fetch('/api/marketing-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productUrl: displayUrl,
          productName: result.productName || 'Sản phẩm Shopee',
          platform
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMarketingContent(json.data);
      }
    } catch (e) {
      console.error('Failed to generate marketing copy', e);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleCopyFullPost = () => {
    if (!marketingContent) return;
    const fullPost = `${marketingContent.caption}\n\n👉 Mua ngay tại: ${displayUrl}\n\n${marketingContent.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullPost);
    setCopiedPost(true);
    setTimeout(() => setCopiedPost(false), 2000);
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

          <button
            onClick={() => {
              setShowMarketingModal(true);
              if (!marketingContent) handleGenerateCopy('facebook');
            }}
            className="py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:opacity-95 transition transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tạo Bài Viết
          </button>

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

      {/* AI Copywriting Modal */}
      {showMarketingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Trợ lý AI Viết Bài Quảng Cáo (Gemini)</h3>
              </div>
              <button
                onClick={() => setShowMarketingModal(false)}
                className="p-1 rounded-full hover:bg-white/20 transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Platform selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Chọn nền tảng đăng bài:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['facebook', 'zalo', 'tiktok', 'instagram'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleGenerateCopy(p)}
                      disabled={isGeneratingCopy}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition border ${
                        selectedPlatform === p
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Post Content */}
              {isGeneratingCopy ? (
                <div className="py-12 text-center text-gray-500 space-y-3">
                  <Sparkles className="w-8 h-8 text-purple-600 animate-bounce mx-auto" />
                  <p className="text-xs font-semibold">Gemini đang sáng tạo nội dung bài viết...</p>
                </div>
              ) : marketingContent ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
                  <div className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {marketingContent.caption}
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Link mua hàng:
                    </p>
                    <p className="text-xs text-shopee font-mono font-bold">{displayUrl}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px] text-purple-600 font-semibold">
                    {marketingContent.hashtags.map((h, idx) => (
                      <span key={idx}>{h}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleCopyRaw()}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1"
              >
                {copiedRaw ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy link gốc
              </button>
              <button
                onClick={handleCopyFullPost}
                disabled={!marketingContent}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 transition transform active:scale-95 shadow-md ${
                  copiedPost
                    ? 'bg-green-600'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95'
                }`}
              >
                {copiedPost ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {copiedPost ? 'Đã Copy Toàn Bộ Bài!' : 'Copy Bài Đăng kèm Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
