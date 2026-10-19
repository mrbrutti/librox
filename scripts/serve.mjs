import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat, realpath} from 'node:fs/promises';
import {dirname, extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8767);
const types = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json',
  '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp',
  '.jpg':'image/jpeg', '.mp4':'video/mp4', '.mp3':'audio/mpeg',
  '.woff2':'font/woff2', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8'
};

// Local media needs byte ranges: browsers otherwise cannot reliably seek a
// partially buffered film. Raw captures, dotfiles and dependencies stay private.
createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {'Allow':'GET, HEAD'}).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.split('/').some(part => part.startsWith('.') || part === 'node_modules')) {
      res.writeHead(404).end();
      return;
    }
    let filename = resolve(root, '.' + pathname);
    let info = await stat(filename);
    if (info.isDirectory()) { filename = resolve(filename, 'index.html'); info = await stat(filename); }
    filename = await realpath(filename);
    if (!filename.startsWith(root + sep) || !info.isFile()) { res.writeHead(404).end(); return; }

    const headers = {
      'Content-Type': types[extname(filename)] || 'application/octet-stream',
      'Accept-Ranges':'bytes', 'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    };
    let start = 0;
    let end = info.size - 1;
    let status = 200;
    if (req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!range || (!range[1] && !range[2]) || !info.size) {
        res.writeHead(416, {'Content-Range':`bytes */${info.size}`}).end(); return;
      }
      start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
      end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
        res.writeHead(416, {'Content-Range':`bytes */${info.size}`}).end(); return;
      }
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
      status = 206;
    }
    headers['Content-Length'] = Math.max(0, end - start + 1);
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || !info.size) { res.end(); return; }
    const stream = createReadStream(filename, {start, end});
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(404);
    res.end();
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Librox preview: http://localhost:${port}/index.html\n`);
});
