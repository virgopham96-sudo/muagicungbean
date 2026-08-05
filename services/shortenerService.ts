import { ConvertedLink, UserSettings } from '../types';

export interface ConvertOptions {
  url: string;
  settings: UserSettings;
  subIdOverride?: string;
}

export const convertShopeeUrl = async (options: ConvertOptions): Promise<ConvertedLink> => {
  const { url, settings, subIdOverride } = options;
  const inputUrl = url.trim();

  if (!inputUrl) {
    throw new Error('Vui lòng nhập link sản phẩm Shopee');
  }

  const subIdToUse = subIdOverride || settings.subId || 'WebTool';
  const subIds = settings.subId2 ? [subIdToUse, settings.subId2] : [subIdToUse];

  try {
    const response = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: inputUrl,
        apiKey: settings.apiKey,
        toolId: settings.toolId,
        subId: subIdToUse,
        subIds: subIds
      })
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.error || 'Lỗi khi gọi Affipad API');
    }

    return {
      originalUrl: json.data.originalUrl,
      affiliateUrl: json.data.affiliateUrl,
      rawLink: json.data.rawLink,
      shortUrl: json.data.shortUrl,
      affiliateId: json.data.affiliateId,
      shopId: json.data.shopId,
      itemId: json.data.itemId,
      timestamp: json.data.timestamp || Date.now(),
      productName: json.data.productName,
      productImage: json.data.productImage,
      price: json.data.price,
      subId: subIdToUse,
      affipadConverted: true
    };
  } catch (error: any) {
    console.warn("Affipad API request failed, falling back to local link builder:", error);
    
    // Fallback: Build standard Shopee Affiliate URL locally
    const cleanId = settings.affiliateId.startsWith('an_')
      ? settings.affiliateId
      : `an_${settings.affiliateId}`;

    const params = new URLSearchParams();
    params.append('utm_source', cleanId);
    params.append('utm_medium', 'affiliates');
    params.append('utm_campaign', '-');
    if (subIdToUse) params.append('utm_content', subIdToUse);
    params.append('deep_and_deferred', '1');

    const isShortLink = inputUrl.includes('shp.ee') || inputUrl.includes('s.shopee.vn');
    let affiliateUrl = '';

    if (isShortLink) {
      const separator = inputUrl.includes('?') ? '&' : '?';
      affiliateUrl = `${inputUrl}${separator}${params.toString()}`;
    } else {
      try {
        const urlObj = new URL(inputUrl);
        const path = urlObj.pathname.startsWith('/universal-link')
          ? urlObj.pathname.replace('/universal-link', '')
          : urlObj.pathname;
        affiliateUrl = `https://shopee.vn/universal-link${path}?${params.toString()}`;
      } catch (e) {
        affiliateUrl = `https://shopee.vn/universal-link?${params.toString()}`;
      }
    }

    return {
      originalUrl: inputUrl,
      affiliateUrl,
      rawLink: affiliateUrl,
      shortUrl: affiliateUrl,
      timestamp: Date.now(),
      subId: subIdToUse,
      affipadConverted: false
    };
  }
};
