import {readFile, writeFile, readdir, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Static hosting must not reuse an old film or stylesheet after a redesign.
const hashes = new Map();
for (const name of await readdir('.')) {
  if (!name.endsWith('.html')) continue;
  const source = await readFile(name, 'utf8');
  const pattern = /((?:href|src|poster|srcset|data-wide|data-portrait|data-wide-poster|data-portrait-poster|data-wide-mask|data-portrait-mask)=")([^"?\s#]+\.(?:css|js|mp4|webp|png|svg|json))(?:\?v=[^"\s]*)?(")/g;
  let output = source;
  for (const match of source.matchAll(pattern)) {
    const asset = match[2];
    if (/^[a-z]+:/i.test(asset)) continue;
    if (!hashes.has(asset)) {
      if (!(await stat(asset)).isFile()) continue;
      hashes.set(asset, createHash('sha256').update(await readFile(asset)).digest('hex').slice(0, 10));
    }
    output = output.replace(match[0], match[1] + asset + '?v=' + hashes.get(asset) + match[3]);
  }
  if (output !== source) await writeFile(name, output);
}
