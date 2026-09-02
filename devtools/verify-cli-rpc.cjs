#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('acorn');

const entry = fs.realpathSync(path.resolve(process.argv[2] || ''));
const root = path.dirname(entry);
const pending = [entry];
const visited = new Set();

function localModule(from, specifier) {
  if (!specifier.startsWith('.')) return null;
  const unresolved = path.resolve(path.dirname(from), specifier);
  const candidates = path.extname(unresolved)
    ? [unresolved]
    : [unresolved + '.mjs', path.join(unresolved, 'index.mjs')];
  const existing = candidates.find((candidate) => fs.existsSync(candidate));
  if (!existing) throw new Error(`missing reachable module: ${specifier}`);
  const resolved = fs.realpathSync(existing);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`reachable module escapes installed dist: ${specifier}`);
  }
  return resolved;
}

function inspectSyntax(node, moduleSpecifiers, registration) {
  if (!node || typeof node !== 'object') return;
  if (
    (node.type === 'ImportDeclaration' ||
      node.type === 'ExportNamedDeclaration' ||
      node.type === 'ExportAllDeclaration') &&
    typeof node.source?.value === 'string'
  ) {
    moduleSpecifiers.add(node.source.value);
  } else if (node.type === 'ImportExpression' && typeof node.source?.value === 'string') {
    moduleSpecifiers.add(node.source.value);
  } else if (node.type === 'CallExpression' && node.arguments?.[0]?.value === 'list-saved-projects') {
    const callee = node.callee;
    const property = callee?.type === 'MemberExpression'
      ? (callee.computed ? callee.property?.value : callee.property?.name)
      : null;
    if (property === 'registerHandler') registration.found = true;
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const child of value) inspectSyntax(child, moduleSpecifiers, registration);
    } else if (value && typeof value === 'object' && typeof value.type === 'string') {
      inspectSyntax(value, moduleSpecifiers, registration);
    }
  }
}

try {
  while (pending.length > 0) {
    const current = pending.pop();
    if (visited.has(current)) continue;
    visited.add(current);
    const source = fs.readFileSync(current, 'utf8');
    const syntax = parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      allowHashBang: true,
    });
    const moduleSpecifiers = new Set();
    const registration = { found: false };
    inspectSyntax(syntax, moduleSpecifiers, registration);
    if (registration.found) {
      process.stdout.write(current);
      process.exit(0);
    }
    for (const specifier of moduleSpecifiers) {
      const resolved = localModule(current, specifier);
      if (resolved && !visited.has(resolved)) pending.push(resolved);
    }
  }
  process.exit(1);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
}
