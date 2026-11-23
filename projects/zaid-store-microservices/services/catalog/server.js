const express = require('express');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
const products = [
  { id: 'p-101', name: 'Everyday Backpack', category: 'Accessories', price: 49.99, stock: 24 },
  { id: 'p-102', name: 'Insulated Bottle', category: 'Outdoors', price: 22.5, stock: 40 },
  { id: 'p-103', name: 'Desk Lamp', category: 'Home', price: 34, stock: 15 }
];
app.get('/health/live', (req, res) => res.json({ status: 'ok', service: 'catalog' }));
app.get('/health/ready', (req, res) => res.json({ status: 'ready' }));
app.get('/products', (req, res) => res.json({ items: products }));
app.get('/products/:id', (req, res) => {
  const item = products.find(p => p.id === req.params.id);
  return item ? res.json({ item }) : res.status(404).json({ error: 'Product not found' });
});
const port = Number(process.env.PORT || 4101);
app.listen(port, '0.0.0.0', () => console.log(`Catalog service listening on ${port}`));
