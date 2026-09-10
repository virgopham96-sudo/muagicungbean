import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const OLD_AFFIPAD_KEY = 'afp_live_76815641dfd20657de287c40ccad2b9bcf785b24569ebc2d04fc6e0dae1fc7aa';
const ACTIVE_AFFIPAD_KEY = 'afp_live_a2928dda5f5d6d5f99cc20102a4a65398d271cffee83f0909a52ce1e27fddca4';
const envKey = process.env.AFFIPAD_API_KEY;
const DEFAULT_AFFIPAD_KEY = (envKey && envKey !== OLD_AFFIPAD_KEY) ? envKey : ACTIVE_AFFIPAD_KEY;
const OLD_TOOL_ID = 'cmsfs1mwt03lc01qyh2i7p0sq';

// Default toolId for the new key (cmtv6oi9t00hj01t99lyqgrd7)
let cachedToolId: string | null = 'cmtv6oi9t00hj01t99lyqgrd7';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get tools from Affipad API
  async function getAffipadTools(apiKey: string) {
    const key = apiKey || DEFAULT_AFFIPAD_KEY;
    const response = await fetch('https://api.affipad.com/v1/tools', {
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Affipad GET /v1/tools error (${response.status}): ${errText}`);
    }
    const data = await response.json();
    return data;
  }

  // 1. Endpoint: Get available Affipad tools
  app.get('/api/tools', async (req, res) => {
    try {
      const apiKey = (req.query.apiKey as string) || DEFAULT_AFFIPAD_KEY;
      const toolsData = await getAffipadTools(apiKey);
      res.json(toolsData);
    } catch (err: any) {
      console.error('Error fetching tools:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Endpoint: Convert Shopee link using Affipad API
  app.post('/api/convert', async (req, res) => {
    try {
      const { url, apiKey, toolId, subId, subIds } = req.body;
      let targetApiKey = apiKey || DEFAULT_AFFIPAD_KEY;
      if (targetApiKey === OLD_AFFIPAD_KEY) {
        targetApiKey = DEFAULT_AFFIPAD_KEY;
      }

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'Vui lòng cung cấp URL sản phẩm Shopee hợp lệ' });
      }

      let activeToolId = toolId;
      if (!activeToolId || activeToolId === OLD_TOOL_ID) {
        if (cachedToolId && targetApiKey === DEFAULT_AFFIPAD_KEY) {
          activeToolId = cachedToolId;
        } else {
          const toolsRes = await getAffipadTools(targetApiKey);
          const tools = toolsRes?.data?.tools;
          if (Array.isArray(tools) && tools.length > 0) {
            activeToolId = tools[0].id;
            if (targetApiKey === DEFAULT_AFFIPAD_KEY) {
              cachedToolId = activeToolId;
            }
          } else {
            return res.status(400).json({ success: false, error: 'Không tìm thấy Công cụ (Tool) nào trong tài khoản Affipad API của bạn.' });
          }
        }
      }

      // Documentation from https://docs.affipad.com/api:
      // url: string (required)
      // toolId: string (required)
      // useCache: boolean (optional, default true)
      // useShortLink: boolean (optional, default true)
      // subIds: string[] (optional, max 5, alphanumeric only)
      let targetSubIds: string[] = [];
      if (Array.isArray(subIds) && subIds.length > 0) {
        targetSubIds = subIds.map((s: any) => String(s).trim()).filter(Boolean);
      } else if (subId && typeof subId === 'string' && subId.trim()) {
        targetSubIds = [subId.trim()];
      } else {
        targetSubIds = ['WebTool'];
      }

      const payload: any = {
        url: url.trim(),
        toolId: activeToolId,
        useCache: true,
        useShortLink: true,
        subIds: targetSubIds.slice(0, 5)
      };

      console.log(`[Affipad API] Converting link via toolId=${activeToolId}:`, url);

      const affipadResponse = await fetch('https://api.affipad.com/v1/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${targetApiKey}`
        },
        body: JSON.stringify(payload)
      });

      const resText = await affipadResponse.text();
      let resJson: any;
      try {
        resJson = JSON.parse(resText);
      } catch (e) {
        throw new Error(`Phản hồi từ Affipad không hợp lệ: ${resText.substring(0, 200)}`);
      }

      if (!affipadResponse.ok || !resJson.success) {
        const errorMsg = resJson?.error?.message || `Lỗi từ Affipad API (${affipadResponse.status})`;
        return res.status(affipadResponse.status || 400).json({
          success: false,
          error: errorMsg,
          details: resJson
        });
      }

      const results = resJson.data?.results || [];
      const resultObj = results[0] || {};
      const convertedAffiliateUrl = resultObj.shortUrl || resultObj.link || '';

      return res.json({
        success: true,
        data: {
          originalUrl: url,
          affiliateUrl: convertedAffiliateUrl,
          rawLink: resultObj.link || '',
          shortUrl: resultObj.shortUrl || '',
          affiliateId: resultObj.affiliateId || '',
          shopId: resultObj.shopId || '',
          itemId: resultObj.itemId || '',
          timestamp: Date.now(),
          productName: resultObj.productInfo?.title || undefined,
          productImage: resultObj.productInfo?.image || undefined,
          price: resultObj.productInfo?.price || undefined,
          cached: resJson.data?.cached || false
        }
      });

    } catch (err: any) {
      console.error('[API /api/convert Error]', err);
      res.status(500).json({ success: false, error: err.message || 'Lỗi hệ thống khi chuyển đổi link' });
    }
  });

  // 3. Endpoint: Marketing Content Generation using Gemini API
  app.post('/api/marketing-copy', async (req, res) => {
    try {
      const { productUrl, productName, platform } = req.body;
      const geminiKey = process.env.GEMINI_API_KEY;

      if (!geminiKey || geminiKey === 'PLACEHOLDER_API_KEY') {
        return res.json({
          success: true,
          data: {
            caption: `🔥 Siêu deal hot trên Shopee! Click mua ngay sản phẩm "${productName || 'giá cực hời'}" kẻo hết! Số lượng có hạn, săn voucher giảm giá cực sốc ngay nào! 👇`,
            hashtags: ['#ShopeeAffiliate', '#DealHot', '#SănSale', '#ShopeeCheck']
          }
        });
      }

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = `
        Tạo một bài viết quảng cáo bán hàng hấp dẫn, kích thích mua sắm bằng tiếng Việt cho nền tảng ${platform || 'Facebook'}.
        Tên/Mô tả sản phẩm: "${productName || 'Sản phẩm Shopee'}".
        URL Sản phẩm: ${productUrl}.

        Yêu cầu:
        1. Giọng văn: Hào hứng, ngắn gọn, gọi mở hành động (CTA), tạo cảm giác bỏ lỡ (FOMO).
        2. Thêm emoji phù hợp và nổi bật.
        3. Gợi ý 5-8 hashtag phổ biến.
        4. Trả về đúng định dạng JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              caption: { type: Type.STRING },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['caption', 'hashtags']
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Gemini không trả về nội dung');
      }

      const parsed = JSON.parse(text);
      res.json({
        success: true,
        data: {
          caption: parsed.caption,
          hashtags: parsed.hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`)
        }
      });
    } catch (err: any) {
      console.error('[Gemini Copywriting Error]', err);
      res.json({
        success: true,
        data: {
          caption: `🔥 Deal hot Shopee! Mua ngay sản phẩm này kẻo hết slot ưu đãi nhé mọi người! 👇`,
          hashtags: ['#Shopee', '#DealHot', '#Affiliate', '#Sale']
        }
      });
    }
  });

  // Vite / Static setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
