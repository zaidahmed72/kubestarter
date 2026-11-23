const express = require('express');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
const orders = new Map();
app.get('/health/live', (req, res) => res.json({ status: 'ok', service: 'orders' }));
app.get('/health/ready', (req, res) => res.json({ status: 'ready' }));
app.post('/orders', async (req, res) => {
  const { productId, quantity } = req.body || {};
  if (typeof productId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return res.status(400).json({ error: 'productId and quantity (1–99) are required' });
  const base = process.env.CATALOG_URL || 'http://catalog:4101';
  let response;
  try { response = await fetch(`${base}/products/${encodeURIComponent(productId)}`, { signal: AbortSignal.timeout(2500) }); }
  catch { return res.status(503).json({ error: 'Catalog service is unavailable' }); }
  if (response.status === 404) return res.status(404).json({ error: 'Product not found' });
  if (!response.ok) return res.status(502).json({ error: 'Catalog service returned an unexpected response' });
  const { item: product } = await response.json();
  if (quantity > product.stock) return res.status(409).json({ error: 'Insufficient stock' });
  const order = { id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, productId: product.id, productName: product.name, unitPrice: product.price, quantity, total: Number((product.price * quantity).toFixed(2)), status: 'accepted', createdAt: new Date().toISOString() };
  orders.set(order.id, order);
  return res.status(201).json({ order });
});
app.get('/orders/:id', (req, res) => {
  const order = orders.get(req.params.id);
  return order ? res.json({ order }) : res.status(404).json({ error: 'Order not found' });
});
const port = Number(process.env.PORT || 4102);
app.listen(port, '0.0.0.0', () => console.log(`Orders service listening on ${port}`));
