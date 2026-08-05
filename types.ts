export interface AffipadTool {
  id: string;
  name: string;
  slug?: string;
  toolType?: {
    slug: string;
  };
}

export interface UserSettings {
  apiKey: string;
  toolId?: string;
  affiliateId: string;
  subId?: string;
  subId2?: string;
  universalLinkEnabled: boolean;
}

export interface ConvertedLink {
  originalUrl: string;
  affiliateUrl: string;
  rawLink?: string;
  shortUrl?: string;
  affiliateId?: string;
  shopId?: string;
  itemId?: string;
  timestamp: number;
  productName?: string;
  productImage?: string;
  price?: string | number;
  subId?: string;
  affipadConverted?: boolean;
}

export interface MarketingContent {
  caption: string;
  hashtags: string[];
}

export type Platform = 'facebook' | 'tiktok' | 'instagram' | 'twitter' | 'zalo';

