import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const dist = new URL('../dist/', import.meta.url);
const budgets = JSON.parse(await readFile(new URL('./bundle-budgets.json', import.meta.url), 'utf8'));
const files = (await readdir(dist)).filter(file => file.endsWith('.js'));
let failed = false;
for (const file of new Set([...files, ...Object.keys(budgets)])) {
  const budget = budgets[file];
  if (!budget || !files.includes(file)) {
    console.error(`${file}: missing ${budget ? 'build output' : 'bundle budget'}`);
    failed = true;
    continue;
  }
  const source = await readFile(new URL(file, dist));
  const bytes = source.byteLength;
  const gzip = gzipSync(source).byteLength;
  console.log(`${file}: ${bytes}/${budget.bytes} bytes; gzip ${gzip}/${budget.gzip} bytes`);
  if (bytes > budget.bytes || gzip > budget.gzip) failed = true;
}
if (failed) throw new Error('Bundle budget check failed. Review size changes before updating budgets.');
