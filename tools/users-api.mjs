import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const port = Number(process.env.USERS_API_PORT || 4201);
const usersFilePath = path.resolve(process.cwd(), 'src/app/json/users.json');

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

async function readUsersFile() {
  const raw = await readFile(usersFilePath, 'utf8');
  const parsed = JSON.parse(raw);
  const users = Array.isArray(parsed?.users) ? parsed.users : [];
  return users
    .map((user) => ({ name: String(user?.name ?? '').trim() }))
    .filter((user) => user.name.length > 0);
}

async function writeUsersFile(users) {
  const payload = {
    users: users.map((user) => ({ name: user.name })),
  };
  await writeFile(usersFilePath, `${JSON.stringify(payload, null, 4)}\n`, 'utf8');
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `localhost:${port}`}`);

  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname !== '/api/users') {
    sendJson(res, 404, { error: 'Not found' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const users = await readUsersFile();
      sendJson(res, 200, { users });
      return;
    }

    if (req.method === 'PUT') {
      const body = await parseRequestBody(req);
      const incomingUsers = Array.isArray(body?.users) ? body.users : [];
      const users = incomingUsers
        .map((user) => ({ name: String(user?.name ?? '').trim() }))
        .filter((user) => user.name.length > 0);

      await writeUsersFile(users);
      sendJson(res, 200, { users });
      return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, {
      error: 'Users API error',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(port, () => {
  console.log(`Users API running at http://localhost:${port}/api/users`);
  console.log(`Writing to ${usersFilePath}`);
});
