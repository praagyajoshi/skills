import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const SKIPPED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.aws-sam',
  '.turbo',
  '.next',
  '.claude',
  '.scratch',
]);
const STANDARDS = 'docs/coding-standards.md';
const TOPICS = 'docs/best-practices';
const ROUTER_HEADING = '## Topic best practices';

const root = resolve(process.argv[2] ?? '.');
const extraFiles = process.argv.slice(3).map((file) => resolve(file));
const failures: string[] = [];

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && entry.name === '.claude') {
      const nested = join(path, 'CLAUDE.md');
      return existsSync(nested) ? [nested] : [];
    }
    if (entry.isDirectory()) return SKIPPED_DIRECTORIES.has(entry.name) ? [] : walk(path);
    return [path];
  });
}

function display(path: string): string {
  return relative(root, path) || '.';
}

function proseOf(markdown: string): string {
  return markdown.replace(/^(```|~~~)[\s\S]*?^\1/gm, '').replace(/`[^`\n]*`/g, '');
}

function slugOf(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');
}

function anchorsOf(path: string): Set<string> {
  const anchors = new Set<string>();
  const counts = new Map<string, number>();
  for (const match of proseOf(readFileSync(path, 'utf8')).matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const slug = slugOf(match[1] ?? '');
    const seen = counts.get(slug) ?? 0;
    anchors.add(seen === 0 ? slug : `${slug}-${seen}`);
    counts.set(slug, seen + 1);
  }
  return anchors;
}

function linksOf(path: string): string[] {
  const links: string[] = [];
  for (const match of proseOf(readFileSync(path, 'utf8')).matchAll(
    /\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g,
  )) {
    const target = match[1];
    if (target !== undefined && !/^[a-z][a-z0-9+.-]*:/i.test(target)) links.push(target);
  }
  return links;
}

function resolvedLink(from: string, target: string): { file: string; anchor: string | undefined } {
  const [pathPart, anchor] = target.split('#', 2);
  const decoded = decodeURIComponent(pathPart ?? '');
  return { file: decoded === '' ? from : resolve(dirname(from), decoded), anchor };
}

function checkLinks(path: string): void {
  for (const target of linksOf(path)) {
    const { file, anchor } = resolvedLink(path, target);
    if (!existsSync(file)) {
      failures.push(`${display(path)}: broken link ${target}`);
      continue;
    }
    if (
      anchor !== undefined &&
      anchor !== '' &&
      statSync(file).isFile() &&
      file.endsWith('.md') &&
      !anchorsOf(file).has(anchor.toLowerCase())
    ) {
      failures.push(`${display(path)}: missing anchor ${target}`);
    }
  }
}

function linksToStandards(path: string): boolean {
  const standards = join(root, STANDARDS);
  return linksOf(path).some((target) => {
    const { file } = resolvedLink(path, target);
    return file === standards || /coding[-_]standards/i.test(target);
  });
}

function routerSection(markdown: string): string {
  const start = markdown.indexOf(ROUTER_HEADING);
  if (start === -1) return '';
  const rest = markdown.slice(start + ROUTER_HEADING.length);
  const next = rest.search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next);
}

const files = walk(root);
const agentFiles = files.filter((file) => file.endsWith('/AGENTS.md'));
const claudeFiles = files.filter((file) => file.endsWith('/CLAUDE.md'));
const localClaudeFiles = files.filter((file) => file.endsWith('/CLAUDE.local.md'));
const topicDirectory = join(root, TOPICS);
const topicFiles = files.filter((file) => dirname(file) === topicDirectory && file.endsWith('.md'));
const standardsPath = join(root, STANDARDS);

for (const file of claudeFiles)
  failures.push(`${display(file)}: CLAUDE.md present; merge into AGENTS.md and delete`);
if (agentFiles.length === 0) failures.push('AGENTS.md: missing at the root');
for (const file of [...agentFiles, ...topicFiles]) {
  if (linksToStandards(file)) failures.push(`${display(file)}: links to coding standards`);
}

if (existsSync(standardsPath)) {
  const router = routerSection(readFileSync(standardsPath, 'utf8'));
  if (topicFiles.length > 0 && router === '')
    failures.push(`${STANDARDS}: missing "${ROUTER_HEADING}" section`);
  const routed = new Set(
    linksOf(standardsPath)
      .filter((target) => router.includes(target))
      .map((target) => resolvedLink(standardsPath, target).file),
  );
  for (const topic of topicFiles) {
    if (!routed.has(topic))
      failures.push(`${display(topic)}: not linked from "${ROUTER_HEADING}" in ${STANDARDS}`);
  }
} else {
  failures.push(`${STANDARDS}: missing`);
}

const checked = new Set([
  ...agentFiles,
  ...topicFiles,
  ...(existsSync(standardsPath) ? [standardsPath] : []),
  ...extraFiles,
]);
for (const file of checked) {
  if (existsSync(file)) checkLinks(file);
  else failures.push(`${display(file)}: listed file does not exist`);
}

console.log(`Checked ${checked.size} files under ${root}`);
for (const failure of failures) console.log(`FAIL ${failure}`);
for (const file of localClaudeFiles)
  console.log(
    `WARN ${display(file)}: CLAUDE.local.md hides AGENTS.md from its owner in Claude Code`,
  );
if (failures.length === 0) console.log('OK');
process.exitCode = failures.length === 0 ? 0 : 1;
