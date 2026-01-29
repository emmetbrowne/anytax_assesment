const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        const filePath = path.join(__dirname, 'transfer-page.html');
        const content = fs.readFileSync(filePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

module.exports = server;
