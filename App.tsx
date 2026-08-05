import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, ShoppingBag, Zap, Settings, History, Trash2, ArrowRight, RefreshCw, Check, Info, Sparkles, AlertCircle } from 'lucide-react';
import { ResultCard } from './components/ResultCard';
import { SettingsModal } from './components/SettingsModal';
import { UserSettings, ConvertedLink } from './types';
import { convertShopeeUrl } from './services/shortenerService';

const DEFAULT_SETTINGS: UserSettings = {
  apiKey: 'afp_live_76815641dfd20657de287c40ccad2b9bcf785b24569ebc2d04fc6e0dae1fc7aa',
  toolId: 'cmsfs1mwt03lc01qyh2i7p0sq',
  affiliateId: '17362210029',
  subId: 'WebTool',
  universalLinkEnabled: true,
};

function App() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('affipad_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_SETTINGS;
  });

  const [urlInput, setUrlInput] = useState('');
  const [currentResult, setCurrentResult] = useState<ConvertedLink | null>(null);
  const [history, setHistory] = useState<ConvertedLink[]>(() => {
    const saved = localStorage.getItem('affipad_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'convert' | 'history'>('convert');

  useEffect(() => {
    localStorage.setItem('affipad_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('affipad_history', JSON.stringify(history));
  }, [history]);

  const handleConvert = async () => {
    setError('');
    const input = urlInput.trim();

    if (!input) {
      setError('Vui lòng nhập link sản phẩm Shopee');
      return;
    }

    if (!input.includes('shopee') && !input.includes('shp.ee')) {
      setError('Link không hợp lệ. Hãy dán link từ shopee.vn hoặc vn.shp.ee');
      return;
    }

    setLoading(true);

    try {
      const result = await convertShopeeUrl({
        url: input,
        settings,
        subIdOverride: undefined // Default to WebTool via settings
      });

      setCurrentResult(result);
      setHistory(prev => [result, ...prev.filter(item => item.affiliateUrl !== result.affiliateUrl).slice(0, 29)]);
      setUrlInput('');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xử lý link');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử rút gọn link?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-gray-900 pb-12 overflow-x-hidden">
      {/* Curved Background Banner */}
      <div className="absolute top-0 left-0 w-full h-52 bg-gradient-to-br from-[#ee4d2d] via-[#f05335] to-[#ff7337] z-0 rounded-b-[2rem] shadow-md"></div>

      <div className="relative z-10 container mx-auto px-4 pt-4 max-w-lg">
        {/* Header Bar */}
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight leading-none">Mua gì cùng Bean</h1>
              <span className="text-[10px] text-white/90 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                Shopee Affiliate Link
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-white/15 hover:bg-white/25 rounded-xl backdrop-blur-md transition text-white"
            title="Cấu hình API"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl mb-3 text-white text-xs font-bold">
          <button
            onClick={() => setActiveTab('convert')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'convert' ? 'bg-white text-shopee shadow-sm' : 'hover:bg-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Tạo Link
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history' ? 'bg-white text-shopee shadow-sm' : 'hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Lịch Sử ({history.length})
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab === 'convert' ? (
          <div className="space-y-3">
            {/* Input Form Card */}
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Dán link sản phẩm Shopee
                </label>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-gray-900 text-white text-[10px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl z-20 leading-relaxed">
                    Hỗ trợ tất cả link Shopee: shopee.vn, vn.shp.ee, s.shopee.vn. Tự động tối ưu cho App Shopee.
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-shopee">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://shopee.vn/..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-shopee/10 focus:border-shopee focus:bg-white outline-none transition-all text-xs font-medium"
                  onKeyDown={(e) => e.key === 'Enter' && handleConvert()}
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-red-500 text-xs mt-2 font-medium bg-red-50 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Convert Action Button */}
              <button
                onClick={handleConvert}
                disabled={loading}
                className="w-full mt-3 bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-200 transition-all transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang tạo link...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    TẠO LINK TIẾP THỊ LIÊN KẾT
                  </>
                )}
              </button>
            </div>

            {/* Conversion Result */}
            {currentResult && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-1.5 mb-1.5 ml-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Kết quả chuyển đổi mới nhất
                  </h2>
                </div>
                <ResultCard result={currentResult} />
              </div>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-shopee" />
                Lịch sử chuyển đổi ({history.length})
              </h2>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-[10px] text-red-500 font-semibold hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Xóa tất cả
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <History className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs">Chưa có lịch sử chuyển đổi link nào</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {history.map((item, index) => (
                  <ResultCard key={index} result={item} />
                ))}
              </div>
            )}
          </div>
        )}


      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
}

export default App;
