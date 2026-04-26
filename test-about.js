import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/sections/page/about',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.substring(0, 500));
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
