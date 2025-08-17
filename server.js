// server.js
import express from 'express';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/dashboard', express.static('dashboard'));

const SHOP = process.env.SHOPIFY_STORE;
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOP_SECRET = process.env.SHOPIFY_API_SECRET;
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';

function verifyShopifyWebhook(req) {
  const hmac = req.headers['x-shopify-hmac-sha256'] || '';
  const body = JSON.stringify(req.body);
  const digest = crypto.createHmac('sha256', SHOP_SECRET || '').update(body, 'utf8').digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
  } catch (e) {
    return false;
  }
}

async function shopifyRequest(path, method='GET', body=null) {
  const url = `https://${SHOP}/admin/api/2025-07/${path}`;
  const opts = { method, headers: { 'X-Shopify-Access-Token': ADMIN_TOKEN, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  const text = await resp.text();
  try { return JSON.parse(text); } catch(e) { return { raw: text }; }
}

// basic health
app.get('/health', (req, res) => res.json({ ok: true }));

// products list
app.get('/api/products', async (req, res) => {
  try { const data = await shopifyRequest('products.json'); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// orders list
app.get('/api/orders', async (req, res) => {
  try { const data = await shopifyRequest('orders.json'); res.json(data); } 
  catch (e) { res.status(500).json({ error: e.message }); }
});

// update inventory
app.post('/api/update-inventory', async (req, res) => {
  try {
    const { inventory_item_id, location_id, available } = req.body;
    const resp = await shopifyRequest('inventory_levels/set.json', 'POST', { location_id, inventory_item_id, available });
    res.json(resp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// chat endpoint (simple proxy to OpenAI Completion)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    if (!OPENAI_KEY) return res.status(500).json({ reply: 'OpenAI API key not configured on server.' });
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an e-commerce assistant that may use Shopify data.' },
          { role: 'user', content: message }
        ],
        max_tokens: 500
      })
    });
    const j = await openaiResp.json();
    const reply = j.choices?.[0]?.message?.content || j.error || 'No reply';
    res.json({ reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// webhook receiver
app.post('/webhook', (req, res) => {
  if (!verifyShopifyWebhook(req)) return res.status(401).send('Invalid webhook');
  const topic = req.headers['x-shopify-topic'] || 'unknown';
  console.log('Webhook:', topic, req.body);
  res.status(200).send('OK');
});

// simple dashboard to show connectivity
app.get('/', async (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dashboard', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
