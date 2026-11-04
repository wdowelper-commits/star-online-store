import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    whatsapp: '03027628552',
    admin_user: 'admin',
  });
});

// Server-side AI Assistant Endpoint using @google/genai
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const systemInstruction = `You are Zenvo AI (زن وو اسسٹنٹ), the expert AI shopping, order, and vendor assistant for Zenvo Marketplace in Pakistan.
You are fluent in Urdu (اردو), Roman Urdu, and English. You communicate warmly, respectfully, and concisely.

Important Platform Rules & Context:
1. Official WhatsApp Helpline & Orders: 03027628552 (International: +923027628552). Customers can place orders directly on WhatsApp or receive their order bill on WhatsApp with 1 click.
2. Admin Panel Login: Username: "admin" | Password: "admin123@#". Administrators can manage products, approve vendors, inspect orders, and customize showcase images.
3. Payment Method: 100% Cash on Delivery (COD) across Pakistan. Customers inspect parcels upon doorstep delivery and pay cash with zero advance risk.
4. Product Images: Vendors and administrators can add product images by pasting an Image URL OR by uploading image files directly from their phone or computer.
5. Hero Showcase Images: The two showcase cards on the homepage can be customized anytime by clicking "Customize Showcase Images" and entering URLs or uploading images.

Respond naturally to customer queries. If asked in Urdu or Roman Urdu, reply in polite Roman Urdu or Urdu as requested. Keep responses concise, clear, and action-oriented.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item && item.content && (item.role === 'user' || item.role === 'model')) {
            contents.push({
              role: item.role,
              parts: [{ text: String(item.content) }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 4000)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const reply = response.text || 'Assalam-o-Alaikum! Main aapki kis tarah madad kar sakta hoon?';
      return res.json({ reply });
    } catch (err: any) {
      console.warn('Gemini API call failed or timed out, falling back to local contextual knowledge:', err?.message);
    }
  }

  // Resilient fallback assistant response based on user query
  const query = message.toLowerCase();
  let fallbackReply = '';

  if (query.includes('admin') || query.includes('login') || query.includes('password') || query.includes('credential')) {
    fallbackReply = `🔒 *Zenvo Admin Panel Credentials:*\n• **Username:** \`admin\` (or \`admin@zenvo.com\`)\n• **Password:** \`admin123@#\`\n\nAap Login page par ja kar "Autofill" button par click kar ke foran admin dashboard access kar sakte hain.`;
  } else if (query.includes('whatsapp') || query.includes('order') || query.includes('03027628552') || query.includes('phone') || query.includes('contact')) {
    fallbackReply = `📱 *WhatsApp Order & Helpline (03027628552):*\nZenvo ka official WhatsApp number **03027628552** hai.\n\n• Cart ya Checkout page par "Direct WhatsApp Order" button par click karein.\n• Aapka pura bill, items, aur address automatically WhatsApp message ban kar **03027628552** par send ho jaye ga!`;
  } else if (query.includes('image') || query.includes('tasveer') || query.includes('upload') || query.includes('url') || query.includes('showcase')) {
    fallbackReply = `🖼️ *Images Customization & Product Upload:*\n• **Showcase Images:** Homepage par "Customize Showcase Images" button dabayein aur apni marzi ka Image URL ya file upload karein.\n• **Product Add:** Vendor panel mein "Add Product" par ja kar aap Image URL paste bhi kar sakte hain aur device se image files upload bhi kar sakte hain!`;
  } else if (query.includes('cod') || query.includes('cash') || query.includes('delivery') || query.includes('payment')) {
    fallbackReply = `🚚 *Cash on Delivery (COD) Guarantee:*\nPure Pakistan mein Cash on Delivery dastiyab hai. Kisi advance payment ki zaroorat nahi hoti. Parcel receive hone aur tasdeeq ke baad rider ko cash adaa karein!`;
  } else {
    fallbackReply = `Assalam-o-Alaikum! Main Zenvo AI Assistant hoon.\n\nMain aapki madad kar sakta hoon:\n• **WhatsApp Orders:** Official number **03027628552** par 1-click order.\n• **Admin Panel:** Username \`admin\` aur password \`admin123@#\`.\n• **Products & Images:** Image URL ya file upload se naye products aur showcase images lagana.\n• **Cash on Delivery:** Pure Pakistan mein doorstep COD delivery.\n\nAap mujh se mazeed kya poochna chahte hain?`;
  }

  return res.json({ reply: fallbackReply });
});

// Setup Vite middleware in dev or serve static dist in prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Zenvo Multi-Vendor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
