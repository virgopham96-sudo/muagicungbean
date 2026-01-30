import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { UserSettings } from '../types';

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

  useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Cấu hình Affiliate</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-orange-50 p-3 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-shopee shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Nhập Affiliate ID (hoặc username) của bạn. Hệ thống sẽ tự động gắn tag này vào link Shopee.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate ID / Username</label>
            <input
              type="text"
              name="affiliateId"
              value={formData.affiliateId}
              onChange={handleChange}
              placeholder="VD: my_affiliate_id"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub ID (Tuỳ chọn)</label>
            <input
              type="text"
              name="subId"
              value={formData.subId || ''}
              onChange={handleChange}
              placeholder="VD: facebook_campaign_1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-shopee focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="universalLinkEnabled"
              name="universalLinkEnabled"
              checked={formData.universalLinkEnabled}
              onChange={handleChange}
              className="w-5 h-5 text-shopee rounded focus:ring-shopee border-gray-300"
            />
            <label htmlFor="universalLinkEnabled" className="text-sm text-gray-700 cursor-pointer select-none">
              Sử dụng định dạng Universal Link (Khuyên dùng)
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-shopee hover:bg-shopee-dark text-white rounded-lg font-medium shadow-md shadow-orange-200 flex items-center gap-2 transition transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};
