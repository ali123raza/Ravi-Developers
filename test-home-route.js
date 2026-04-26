import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/sections/page/home',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Data length:', data.length);
    if (res.statusCode !== 200) {
      console.log('Response:', data);
    } else {
      console.log('First 200 chars:', data.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
