import http from 'http';

function testPage(page) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/sections?page=${page}`,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${page}: Status ${res.statusCode}, Length: ${data.length}`);
        resolve({ page, status: res.statusCode, data: data.substring(0, 100) });
      });
    });

    req.on('error', (e) => {
      console.log(`${page}: Error - ${e.message}`);
      resolve({ page, status: 'error', error: e.message });
    });

    req.end();
  });
}

async function run() {
  const pages = ['home', 'about', 'contact', 'gallery'];
  
  for (const page of pages) {
    await testPage(page);
  }
}

run();
