/**
 * Patches pglite-prisma-adapter to fix Bytes column handling.
 *
 * The adapter's parsePgBytes returns Uint8Array, which serializes as a JSON
 * object {"0":104,"1":101,...} across the JS-WASM boundary to the Prisma
 * query engine. The engine expects either a plain number[] or a base64 string.
 *
 * Fix: use plain number[] values when returning Bytes to Prisma, and restore
 * Prisma's JSON-serialized keyed byte objects to Uint8Array before PGlite.
 *
 * Upstream issue: https://github.com/nicksrandall/pglite-prisma-adapter
 */
const fs = require('fs');
const path = require('path');

const files = [
    'node_modules/pglite-prisma-adapter/dist/index.mjs',
    'node_modules/pglite-prisma-adapter/dist/index.cjs',
    'packages/happy-server/node_modules/pglite-prisma-adapter/dist/index.mjs',
    'packages/happy-server/node_modules/pglite-prisma-adapter/dist/index.cjs',
];

let patched = 0;

for (const file of files) {
    const filePath = path.resolve(__dirname, '..', file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Replace Uint8Array.from with Array.from in parsePgBytes and normalizeByteaArray
    content = content.replace(
        /Uint8Array\.from\(\s*\{\s*length:\s*hexString\.length\s*\/\s*2\s*\}/g,
        'Array.from({ length: hexString.length / 2 }'
    );

    // mapArg handles Prisma Bytes writes. Prisma may JSON-serialize a
    // Uint8Array into a keyed object before it reaches the adapter; PGlite's
    // bytea serializer only accepts a real Uint8Array.
    content = content.replace(
        /if \(ArrayBuffer\.isView\(arg\)\) return Array\.from\(new Uint8Array\(arg\.buffer, arg\.byteOffset, arg\.byteLength\)\);/g,
        'if (ArrayBuffer.isView(arg)) return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);'
    );
    if (!content.includes('argType.scalarType === "bytes" && typeof arg === "object"')) {
        content = content.replace(
            /if \(ArrayBuffer\.isView\(arg\)\) return new Uint8Array\(arg\.buffer, arg\.byteOffset, arg\.byteLength\);/g,
            'if (argType.scalarType === "bytes" && typeof arg === "object") return Uint8Array.from(Object.values(arg));\n\tif (ArrayBuffer.isView(arg)) return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);'
        );
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        patched++;
    }
}

if (patched > 0) {
    console.log(`[patch] Fixed pglite-prisma-adapter Bytes column handling (${patched} file(s))`);
}
