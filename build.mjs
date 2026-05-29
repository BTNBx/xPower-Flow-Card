import { build, context } from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const watch = process.argv.includes('--watch');

const banner = `// xPower Flow Card v${pkg.version}\n// Copyright (C) 2025 BTNBx — MIT License\n`;

const opts = {
  entryPoints: ['src/xpower-flow-card.js'],
  outfile: 'xpower-flow-card.js',
  bundle: false,
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  banner: { js: banner },
  logLevel: 'info',
};

if (watch) {
  const ctx = await context(opts);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await build(opts);
  const { statSync } = await import('fs');
  const s = statSync('xpower-flow-card.js');
  console.log(`Output: xpower-flow-card.js (${(s.size / 1024).toFixed(1)} KB)`);
}
