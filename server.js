// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve dashboard.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.index.html'));
});

// API route to fetch products from Shopify
app.get('/api/products', async (req, res) => {
  try {
    const shopifyUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2023-07/products.json`;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    const response = await axios.get(shopifyUrl, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching products from Shopify');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
