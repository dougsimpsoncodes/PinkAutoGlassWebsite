#!/usr/bin/env node
// One-shot Gemini code review via API. Follows the same .env.local + SDK pattern as
// scripts/gemini-review.mjs and scripts/gemini-snippets.mjs in this repo.
//
// usage: node /tmp/gemini-code-review.mjs <prompt.txt> <diff-or-bundle.txt> [more-files...]
//
// Loads GEMINI_API_KEY from ./.env.local (run from a repo that has it),
// sends the concatenated prompt + artifacts to gemini-2.5-pro, prints the response.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) throw new Error(`env file not found: ${envPath}`);
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error('GEMINI_API_KEY missing in .env.local'); process.exit(1); }

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('usage: node gemini-code-review.mjs <prompt.txt> <artifact1> [artifact2...]');
  process.exit(1);
}

const [promptPath, ...artifactPaths] = args;
const userPrompt = readFileSync(promptPath, 'utf-8');

let combined = userPrompt + '\n\n---\nArtifacts (full text):\n\n';
for (const p of artifactPaths) {
  if (!existsSync(p)) { combined += `(missing: ${p})\n\n`; continue; }
  combined += `===== ${p} =====\n${readFileSync(p, 'utf-8')}\n\n`;
}

console.error(`[gemini] sending ${combined.length} chars to gemini-2.5-pro...`);
const t0 = Date.now();

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  generationConfig: { temperature: 0.3, maxOutputTokens: 16384 },
});

const result = await model.generateContent(combined);
const text = result.response.text();
const cand = result.response.candidates?.[0] || {};
console.error(`[gemini] response in ${(Date.now() - t0) / 1000}s, ${text.length} chars, finishReason=${cand.finishReason}`);
if (result.response.usageMetadata) {
  const u = result.response.usageMetadata;
  console.error(`[gemini] tokens: prompt=${u.promptTokenCount} output=${u.candidatesTokenCount} total=${u.totalTokenCount}`);
}
console.log(text);
