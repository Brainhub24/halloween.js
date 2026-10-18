// Fails when the public surface of the library (CSS variables, body classes
// and attributes found in src/) is missing from the docs or from SKILL.md,
// so adding an option without documenting it breaks `npm run check`.
import { readFileSync, readdirSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

const styles = read('src/styles.ts');
const docs = readdirSync(new URL('../docs/', import.meta.url), { recursive: true })
  .filter((f) => f.endsWith('.md'))
  .map((f) => read(`docs/${f}`))
  .join('\n');
const skill = read('demo/SKILL.md');

const cssVariables = [...new Set(styles.match(/--halloween-[a-z-]+/g) ?? [])].filter(
  (name) =>
    !name.startsWith('--halloween-preset-') &&
    name !== '--halloween-badge-push' &&
    name !== '--halloween-x',
);
const bodyClasses = [
  ...new Set((styles.match(/body\.halloween-[a-z-]+/g) ?? []).map((m) => m.slice('body.'.length))),
];
const tokens = [
  'halloween',
  'halloween-badge',
  'halloween-eyes',
  'halloween-witches',
  'halloween-spider-drop',
  'halloween-tombstones',
  'data-halloween-start',
  'data-halloween-end',
  'data-halloween-badge-slot',
  ...cssVariables,
  ...bodyClasses,
];

if (cssVariables.length < 15 || !bodyClasses.includes('halloween-intensity-party')) {
  console.error('FAIL could not find the expected tokens in src/styles.ts');
  process.exit(1);
}

let failed = false;
for (const [label, text] of [
  ['docs/', docs],
  ['demo/SKILL.md', skill],
]) {
  const missing = tokens.filter((t) => !text.includes(t));
  if (missing.length > 0) {
    failed = true;
    console.error(`FAIL ${label} does not mention: ${missing.join(', ')}`);
  } else {
    console.log(`OK   ${label} covers ${tokens.length} public tokens`);
  }
}

if (!/^---\nname: halloween-js\ndescription: .+\n---\n/.test(skill)) {
  failed = true;
  console.error('FAIL demo/SKILL.md front matter is missing name or description');
}
if (styles.includes('halloween-intensity-normal')) {
  failed = true;
  console.error('FAIL a halloween-intensity-normal class now exists; update the docs');
}
if (failed) process.exit(1);
