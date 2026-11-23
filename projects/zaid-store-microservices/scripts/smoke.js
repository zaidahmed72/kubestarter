async function smoke() {
  const response = await fetch('http://localhost:4102/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 'p-101', quantity: 2 })
  });
  const body = await response.json();
  if (!response.ok || body.order?.total !== 99.98) throw new Error(`Expected a $99.98 order, received ${response.status}: ${JSON.stringify(body)}`);
  const missing = await fetch('http://localhost:4102/orders', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: 'missing', quantity: 1 })
  });
  if (missing.status !== 404) throw new Error(`Expected missing product to return 404, received ${missing.status}`);
  console.log('Microservices smoke passed: valid order and missing product handling');
}

smoke().catch(error => { console.error(error.message); process.exit(1); });
