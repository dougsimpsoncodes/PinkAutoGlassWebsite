#!/usr/bin/env node
/**
 * Validates satellite-inventory.json against the local filesystem.
 * Fails with exit code 1 if any repoPath does not exist.
 * Run before relying on the inventory for any batch operation.
 *
 * Usage: node scripts/validate-satellite-inventory.mjs
 */

import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const inventoryPath = resolve(__dirname, '../data/satellite-inventory.json')

const { satellites } = JSON.parse(readFileSync(inventoryPath, 'utf-8'))

let missing = 0
let ok = 0

for (const site of satellites) {
  if (!site.repoPath) {
    console.error(`MISSING repoPath field: ${site.domain}`)
    missing++
    continue
  }
  if (!existsSync(site.repoPath)) {
    console.error(`MISSING on disk [${site.domain}]: ${site.repoPath}`)
    missing++
  } else {
    console.log(`ok  ${site.domain}  →  ${site.repoPath}`)
    ok++
  }
}

console.log(`\n${ok} ok, ${missing} missing`)
if (missing > 0) {
  console.error('\nFAIL: fix the paths above before running any batch tooling')
  process.exit(1)
}
console.log('PASS: all repo paths exist')
