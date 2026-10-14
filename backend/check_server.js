const http = require('http');
http.get('http://127.0.0.1:4000/', (res) => {
  console.log('Status:', res.statusCode);
}).on('error', (e) => {
  console.error('Error:', e.message);
});
