import { GoogleGenAI, Type } from "@google/genai";
import { Platform, MarketingContent } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
// Note: In a production environment, API calls should be proxied through a backend to protect the key.
// For this frontend-only demo, we assume the environment variable is injected safely.
const ai = new GoogleGenAI({ apiKey });

export const generateMarketingCopy = async (
  productUrl: string,
  platform: Platform
): Promise<MarketingContent> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  // Extract a potential product name from the slug to help the AI context
  // e.g., shopee.vn/Ao-thun-nam-dep-i.123.456 -> "Ao thun nam dep"
  let contextHint = "Unknown Product";
  try {
    const urlObj = new URL(productUrl);
    const pathSegments = urlObj.pathname.split('/');
    const slug = pathSegments.find(s => s.length > 5 && s.includes('-'));
    if (slug) {
      // Remove the ID part at the end (usually after the last dash or 'i.')
      contextHint = slug.split('.')[0].replace(/-/g, ' ');
    }
  } catch (e) {
    console.warn("Could not parse URL for context hint", e);
  }

  const prompt = `
    I have a Shopee product link: ${productUrl}. 
    Based on the URL structure, the product seems to be: "${contextHint}".
    
    Please act as an expert social media marketer. Write a catchy, engaging, and high-converting caption for this product for ${platform}.
    
    Requirements:
    1. Language: Vietnamese.
    2. Tone: Enthusiastic, urgency (FOMO), and friendly.
    3. Include emojis relevant to the product.
    4. Include 5-8 relevant hashtags.
    5. The output must be JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: {
              type: Type.STRING,
              description: "The main body of the social media post.",
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of hashtags without the hash symbol.",
            }
          },
          required: ["caption", "hashtags"],
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const data = JSON.parse(text);
    return {
      caption: data.caption,
      hashtags: data.hashtags.map((tag: string) => tag.startsWith('#') ? tag : `#${tag}`),
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback in case of error
    return {
      caption: `🔥 Deal hot trên Shopee ngay lúc này! Mọi người nhanh tay check ngay sản phẩm "${contextHint}" này nhé. Giá siêu tốt, chất lượng tuyệt vời! 👇`,
      hashtags: ["#Shopee", "#Sale", "#DealHot", "#MuaSamOnline"]
    };
  }
};
