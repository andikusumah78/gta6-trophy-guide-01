// Leonida Trophy Guide — entry program (Node 22, standard library only).
// The guide itself is plain static files under app/: index.html opens in a
// desktop browser, app.js loads app/data/trophies.json, and nothing is
// fetched from the network. This program hands the guide in: it copies
// app/ and screenshots/ into the output directory and writes
// /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library. vendor/makefun-frontend.ts is the kit's copy, unchanged.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyGuide() {
  if (!existsSync(join(repoRoot, 'app', 'index.html'))) {
    throw new Error('app/index.html is missing — the guide cannot be handed in without it.');
  }
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  const shots = join(outputDir, 'screenshots');
  mkdirSync(shots, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shots, { recursive: true });
  }
}

function writeDossier() {
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

copyGuide();
writeDossier();
