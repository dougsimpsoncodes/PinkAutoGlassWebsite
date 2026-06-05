import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'embed');
const entryPoint = path.join(projectRoot, 'src', 'embed', 'satellite-quoter-entry.tsx');
const outfile = path.join(outputDir, 'satellite-quoter.v1.js');
const cssEntry = path.join(projectRoot, 'src', 'embed', 'satellite-quoter.css');
const cssOutfile = path.join(outputDir, 'satellite-quoter.v1.css');
const tailwindBin = path.join(projectRoot, 'node_modules', '.bin', 'tailwindcss');

const publicEnv = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || '',
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
  NEXT_PUBLIC_STICKY_CALLBAR: process.env.NEXT_PUBLIC_STICKY_CALLBAR || '',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

await mkdir(outputDir, { recursive: true });

execFileSync(
  tailwindBin,
  [
    '-i', cssEntry,
    '-o', cssOutfile,
    '--config', path.join(projectRoot, 'tailwind.config.cjs'),
    ...(process.env.NODE_ENV === 'production' ? ['--minify'] : []),
  ],
  {
    cwd: projectRoot,
    stdio: 'inherit',
  }
);

await build({
  entryPoints: [entryPoint],
  outfile,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2018'],
  jsx: 'automatic',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  legalComments: 'none',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
  },
  tsconfig: path.join(projectRoot, 'tsconfig.json'),
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  banner: {
    js: `/* Pink Auto Glass satellite quoter embed bundle */
var process = globalThis.process || { env: ${JSON.stringify(publicEnv)} };`,
  },
});

// Compute content hash and write manifest for version visibility.
// Satellite sites and ops can check /embed/satellite-quoter.manifest.json
// to confirm which bundle version is live and detect stale deploys.
//
// builtAt is preserved from the existing manifest when the JS hash is unchanged
// so re-running the embed build on identical source never produces a diff.
const jsContent = await readFile(outfile);
const hash = createHash('sha256').update(jsContent).digest('hex').slice(0, 12);
const manifestPath = path.join(outputDir, 'satellite-quoter.manifest.json');

let existingHash = null;
let existingBuiltAt = null;
try {
  const existing = JSON.parse(await readFile(manifestPath, 'utf8'));
  existingHash = existing.hash ?? null;
  existingBuiltAt = existing.builtAt ?? null;
} catch {
  // No existing manifest — first build or deleted; builtAt will be set fresh below.
}

const manifest = {
  version: 'v1',
  hash,
  builtAt: hash === existingHash && existingBuiltAt ? existingBuiltAt : new Date().toISOString(),
  js: '/embed/satellite-quoter.v1.js',
  css: '/embed/satellite-quoter.v1.css',
};
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Built satellite quoter embed: ${path.relative(projectRoot, outfile)}`);
console.log(`Built satellite quoter styles: ${path.relative(projectRoot, cssOutfile)}`);
console.log(`Manifest: hash=${hash} builtAt=${manifest.builtAt}`);
