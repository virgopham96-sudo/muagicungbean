import React, { useState, useEffect } from 'react';
import { X, Save, Key, Wrench, Layers, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { UserSettings, AffipadTool } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [tools, setTools] = useState<AffipadTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setFormData(settings);
    if (isOpen) {
      fetchTools(settings.apiKey);
    }
  }, [settings, isOpen]);

  const fetchTools = async (keyToUse: string) => {
    setLoadingTools(true);
    setApiStatus('idle');
    try {
      const res = await fetch(`/api/tools?apiKey=${encodeURIComponent(keyToUse)}`);
      const json = await res.json();
      if (json.success && json.data?.tools) {
        setTools(json.data.tools);
        setApiStatus('valid');
        setStatusMessage(`Kết nối Affipad API thành công (${json.data.tools.length} công cụ)`);
        // If current toolId is not set or not in tools, select first tool
        if (!formData.toolId && json.data.tools.length > 0) {
          setFormData(prev => ({ ...prev, toolId: json.data.tools[0].id }));
        }
      } else {
        setApiStatus('invalid');
        setStatusMessage(json.error || 'API Key không hợp lệ hoặc không thể tải danh sách Tool');
      }
    } catch (err: any) {
      setApiStatus('invalid');
      setStatusMessage('Không thể kết nối với máy chủ API Affipad');
    } finally {
      setLoadingTools(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'apiKey' && value.trim()) {
        fetchTools(value.trim());
      }
      return updated;
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-shopee/10 text-shopee rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Cấu hình Affipad API</h2>
              <p className="text-xs text-gray-500">Tự động chuyển đổi link tiếp thị liên kết</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status Alert */}
          {apiStatus === 'valid' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2.5 text-green-700 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
          {apiStatus === 'invalid' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Affipad API Key */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Affipad API Key
              </label>
              <button 
                type="button" 
                onClick={() => fetchTools(formData.apiKey)}
                className="text-[10px] text-shopee font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loadingTools ? 'animate-spin' : ''}`} />
                Kiểm tra API
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="afp_live_..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:ring-2 focus:ring-shopee/20 focus:border-shopee outline-none transition"
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400">
              Mã API live dùng để gọi dịch vụ rút gọn link Affipad.
            </p>
          </div>

          {/* Select Tool ID */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Công cụ chuyển đổi (Tool ID)
            </label>
            {loadingTools ? (
              <div className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-400 italic flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-shopee" />
                Đang tải danh sách công cụ Affipad...
              </div>
            ) : tools.length > 0 ? (
              <select
                name="toolId"
                value={formData.toolId || (tools[0]?.id || '')}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:ring-2 focus:ring-shopee/20 focus:border-shopee outline-none transition"
              >
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (ID: {t.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="toolId"
                value={formData.toolId || ''}
                onChange={handleChange}
                placeholder="cmsfs1mwt03lc01qyh2i7p0sq"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-900 focus:ring-2 focus:ring-shopee/20 focus:border-shopee outline-none transition"
              />
            )}
          </div>

          {/* Sub ID Settings */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Sub ID 1 (Mặc định)
              </label>
              <input
                type="text"
                name="subId"
                value={formData.subId || ''}
                onChange={handleChange}
                placeholder="VD: WebTool"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-shopee/20 focus:border-shopee outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Sub ID 2 (Tùy chọn)
              </label>
              <input
                type="text"
                name="subId2"
                value={formData.subId2 || ''}
                onChange={handleChange}
                placeholder="VD: FB_Campaign"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-shopee/20 focus:border-shopee outline-none transition"
              />
            </div>
          </div>

          {/* Affiliate ID fallback */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Affiliate ID Shopee (Fallback)
            </label>
            <input
              type="text"
              name="affiliateId"
              value={formData.affiliateId}
              onChange={handleChange}
              placeholder="17362210029"
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:ring-2 focus:ring-shopee/20 focus:border-shopee outline-none transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-shopee to-[#ff7337] text-white rounded-xl text-xs font-bold shadow-md shadow-orange-100 hover:opacity-95 flex items-center gap-1.5 transition transform active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};
