export interface UserSettings {
  affiliateId: string;
  subId?: string;
  universalLinkEnabled: boolean;
}

export interface ConvertedLink {
  originalUrl: string;
  affiliateUrl: string;
  timestamp: number;
  productName?: string;
}

export interface MarketingContent {
  caption: string;
  hashtags: string[];
}

export type Platform = 'facebook' | 'tiktok' | 'instagram' | 'twitter';
