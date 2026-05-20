async function test() {
  try {
    const slug = 'controllrer';
    console.log(`Fetching single product by public slug route: "/api/products/slug/${slug}"...`);
    const res = await fetch(`http://127.0.0.1:5001/api/products/slug/${slug}`);
    const data = await res.json();
    console.log('Response status:', res.status);
    console.log('Response data:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
