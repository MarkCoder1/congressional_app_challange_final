const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return sendJSON(res, 204, null);
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Only handle /items and /items/:id
  if (!pathname.startsWith('/items')) {
    return sendJSON(res, 404, { error: 'Not found' });
  }

  try {
    // GET /items  → list all
    if (req.method === 'GET' && pathname === '/items') {
      const data = readData();
      return sendJSON(res, 200, data);
    }

    // GET /items/:id  → get one
    if (req.method === 'GET' && pathname.startsWith('/items/')) {
      const id = pathname.split('/')[2];
      const data = readData();
      const item = data.find(i => String(i.id) === id);

      if (!item) {
        return sendJSON(res, 404, { error: 'Item not found' });
      }
      return sendJSON(res, 200, item);
    }

    // POST /items  → create
    if (req.method === 'POST' && pathname === '/items') {
      const body = await parseBody(req);
      const data = readData();

      const newItem = {
        id: Date.now().toString(),
        ...body,
        createdAt: new Date().toISOString(),
      };

      data.push(newItem);
      writeData(data);
      return sendJSON(res, 201, newItem);
    }

    // PUT /items/:id  → update
    if (req.method === 'PUT' && pathname.startsWith('/items/')) {
      const id = pathname.split('/')[2];
      const body = await parseBody(req);
      const data = readData();
      const index = data.findIndex(i => String(i.id) === id);

      if (index === -1) {
        return sendJSON(res, 404, { error: 'Item not found' });
      }

      data[index] = {
        ...data[index],
        ...body,
        id: data[index].id, // keep original id
        updatedAt: new Date().toISOString(),
      };

      writeData(data);
      return sendJSON(res, 200, data[index]);
    }

    // DELETE /items/:id  → delete
    if (req.method === 'DELETE' && pathname.startsWith('/items/')) {
      const id = pathname.split('/')[2];
      const data = readData();
      const index = data.findIndex(i => String(i.id) === id);

      if (index === -1) {
        return sendJSON(res, 404, { error: 'Item not found' });
      }

      const deleted = data.splice(index, 1)[0];
      writeData(data);
      return sendJSON(res, 200, deleted);
    }

    // Method not allowed
    sendJSON(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    sendJSON(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`CRUD API running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET    /items');
  console.log('  GET    /items/:id');
  console.log('  POST   /items');
  console.log('  PUT    /items/:id');
  console.log('  DELETE /items/:id');
});