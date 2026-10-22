import {build} from 'esbuild';
import {readFile, mkdir, copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Keep WebGL out of the critical path. Its content hash travels with the
// lightweight film controller, so a new deployment cannot reuse an old scene.
await mkdir('assets/licenses', {recursive:true});
await copyFile('node_modules/three/LICENSE', 'assets/licenses/three-MIT.txt');
await build({entryPoints:['scene-type.js'], bundle:true, minify:true, format:'esm',
  target:'es2022', outfile:'scene-type.bundle.js',
  banner:{js:'/* Three.js MIT license: assets/licenses/three-MIT.txt */'}});
const hash = createHash('sha256').update(await readFile('scene-type.bundle.js')).digest('hex').slice(0,10);
await build({entryPoints:['experience.js'], bundle:true, minify:true,
  target:'es2022', outfile:'experience.bundle.js',
  define:{__SPATIAL_TYPE_URL__:JSON.stringify(`./scene-type.bundle.js?v=${hash}`)}});
await import('./cache-assets.mjs');
