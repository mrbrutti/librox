import {build} from 'esbuild';
import {readFile, writeFile, mkdir, copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {suggestedMarkup} from '../book-cover.mjs';

await build({entryPoints:['books.js'], bundle:true, minify:true,
  target:'es2022', outfile:'books.bundle.js'});
const booksHTML = await readFile('books.html', 'utf8');
await writeFile('books.html', booksHTML.replace(/<!-- suggested-books:start -->[\s\S]*?<!-- suggested-books:end -->/,
  `<!-- suggested-books:start -->\n${suggestedMarkup()}\n            <!-- suggested-books:end -->`));

// Keep WebGL out of the critical path. Its content hash travels with the
// lightweight film controller, so a new deployment cannot reuse an old scene.
await mkdir('assets/licenses', {recursive:true});
await copyFile('node_modules/three/LICENSE', 'assets/licenses/three-MIT.txt');
await build({entryPoints:['scene-type-worker.js'], bundle:true, minify:true, format:'esm',
  target:'es2022', outfile:'scene-type-worker.bundle.js',
  banner:{js:'/* Three.js MIT license: assets/licenses/three-MIT.txt */'}});
const workerHash = createHash('sha256').update(await readFile('scene-type-worker.bundle.js')).digest('hex').slice(0,10);
await build({entryPoints:['scene-type-client.js'], bundle:true, minify:true, format:'esm',
  target:'es2022', outfile:'scene-type.bundle.js',
  define:{__SPATIAL_WORKER_URL__:JSON.stringify(`./scene-type-worker.bundle.js?v=${workerHash}`)}});
const hash = createHash('sha256').update(await readFile('scene-type.bundle.js')).digest('hex').slice(0,10);
await build({entryPoints:['experience.js'], bundle:true, minify:true,
  target:'es2022', outfile:'experience.bundle.js',
  define:{__SPATIAL_TYPE_URL__:JSON.stringify(`./scene-type.bundle.js?v=${hash}`)}});
// Keep the small homepage stylesheet on the HTML response's first trip.
// Subpages retain the shared, cacheable CSS file.
const css = (await Promise.all(['librox.css','experience.css'].map(file => readFile(file,'utf8')))).join('\n');
const html = await readFile('index.html','utf8');
await writeFile('index.html', html.replace(/<!-- studio-styles:start -->[\s\S]*?<!-- studio-styles:end -->/,
  `<!-- studio-styles:start -->\n    <style>\n${css}\n    </style>\n    <!-- studio-styles:end -->`));
await import('./cache-assets.mjs');
