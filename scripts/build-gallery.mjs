#!/usr/bin/env node
// Scans assets/gallary/ for images and regenerates manifest.json.
// Existing captions and per-image fit overrides are preserved by filename.

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const galleryDir = join(repoRoot, 'assets', 'gallary');
const manifestPath = join(galleryDir, 'manifest.json');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function loadExisting() {
  if (!existsSync(manifestPath)) return { images: [] };
  try {
    const data = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (!Array.isArray(data.images)) return { images: [] };
    return data;
  } catch (err) {
    console.warn('[build-gallery] Could not parse existing manifest, starting fresh:', err.message);
    return { images: [] };
  }
}

function captionFromFilename(file) {
  const stem = basename(file, extname(file))
    .replace(/^[\d]+[-_]+/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!stem) return '';
  return stem.replace(/\b\w/g, (c) => c.toUpperCase());
}

function main() {
  if (!existsSync(galleryDir)) {
    console.error('[build-gallery] Gallery directory not found:', galleryDir);
    process.exit(1);
  }

  const existing = loadExisting();
  const byFile = new Map(existing.images.map((entry) => [entry.file, entry]));

  const files = readdirSync(galleryDir)
    .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))
    .filter((f) => {
      const full = join(galleryDir, f);
      return statSync(full).isFile();
    })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const images = files.map((file) => {
    const prev = byFile.get(file);
    if (prev) {
      return {
        file,
        caption: prev.caption ?? captionFromFilename(file),
        fit: prev.fit ?? 'contain',
        ...(prev.featured ? { featured: true } : {}),
      };
    }
    return {
      file,
      caption: captionFromFilename(file),
      fit: 'contain',
    };
  });

  const next = { generated: new Date().toISOString(), images };
  writeFileSync(manifestPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  console.log(`[build-gallery] Wrote ${images.length} entries to ${manifestPath}`);
}

main();
