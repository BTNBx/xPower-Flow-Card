import { build, context } from 'esbuild';
import { readFileSync, mkdirSync } from 'fs';

const src = 'xpower-flow-card.js';
const code = readFileSync(src, 'utf8');
const version = (code.match(/const V\s*=\s*['"]([^'"]+)['"]/) || [, '0.0.0'])[1];
const watch = process.argv.includes('--watch');

const banner = `// xPower Flow Card v${version}\n// Copyright (C) 2025 BTNBx — MIT License\n`;

mkdirSync('dist', { recursive: true });

const opts = {
    entryPoints: [src],
    outfile: 'dist/xpower-flow-card.js',
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
    const s = statSync('dist/xpower-flow-card.js');
    console.log(`Output: dist/xpower-flow-card.js v${version} (${(s.size / 1024).toFixed(1)} KB)`);
}
