#!/usr/bin/env node
/**
 * Validates satellite inventory and question-content coverage before any
 * portfolio batch tooling relies on it.
 *
 * Usage: node scripts/validate-satellite-inventory.mjs
 */

import { existsSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const inventoryPath = resolve(__dirname, '../data/satellite-inventory.json')
const questionContentPath = resolve(__dirname, '../data/satellite-question-content.json')
const eligibleQuestionGroups = new Set(['A', 'B'])

const { satellites } = JSON.parse(readFileSync(inventoryPath, 'utf-8'))
const questionContent = existsSync(questionContentPath)
  ? JSON.parse(readFileSync(questionContentPath, 'utf-8')).sites ?? {}
  : {}

let errors = 0
let ok = 0
const seenDomains = new Set()
const seenDirs = new Set()
const inventoryDirs = new Set(satellites.map((site) => site.dir))

for (const site of satellites) {
  if (seenDomains.has(site.domain)) {
    console.error(`DUPLICATE domain: ${site.domain}`)
    errors++
  }
  seenDomains.add(site.domain)

  if (seenDirs.has(site.dir)) {
    console.error(`DUPLICATE dir: ${site.dir}`)
    errors++
  }
  seenDirs.add(site.dir)

  if (!site.repoPath) {
    console.error(`MISSING repoPath field: ${site.domain}`)
    errors++
    continue
  }
  if (!existsSync(site.repoPath)) {
    console.error(`MISSING on disk [${site.domain}]: ${site.repoPath}`)
    errors++
  } else {
    console.log(`ok  ${site.domain}  →  ${site.repoPath}`)
    ok++
  }

  if (eligibleQuestionGroups.has(site.group) && !questionContent[site.dir]) {
    console.error(`MISSING question content coverage [${site.domain}]: ${site.dir}`)
    errors++
  }
}

for (const [dir, content] of Object.entries(questionContent)) {
  if (!inventoryDirs.has(dir)) {
    console.error(`ORPHAN question content: ${dir}`)
    errors++
  }

  if (!['generated', 'manual'].includes(content.generationMode)) {
    console.error(`INVALID generationMode [${dir}]: ${content.generationMode}`)
    errors++
  }

  if (content.generationMode === 'generated') {
    const required = [
      'type',
      'questionsPageHeading',
      'questionsPageIntro',
      'questionsMetaTitle',
      'questionsMetaDescription',
    ]
    for (const field of required) {
      if (!content[field]) {
        console.error(`MISSING generated content field [${dir}]: ${field}`)
        errors++
      }
    }

    if (!['co', 'az', 'national'].includes(content.type)) {
      console.error(`INVALID generated content type [${dir}]: ${content.type}`)
      errors++
    }

    if ((content.type === 'co' || content.type === 'az') && (!content.city || !content.citySlug)) {
      console.error(`MISSING city/citySlug for local content [${dir}]`)
      errors++
    }

    if (typeof content.chipOnly !== 'boolean') {
      console.error(`MISSING boolean chipOnly [${dir}]`)
      errors++
    }

    if (typeof content.mobileOnly !== 'boolean') {
      console.error(`MISSING boolean mobileOnly [${dir}]`)
      errors++
    }
  }
}

console.log(`\n${ok} repo paths ok, ${errors} validation errors`)
if (errors > 0) {
  console.error('\nFAIL: fix the issues above before running any batch tooling')
  process.exit(1)
}
console.log('PASS: satellite inventory and question-content coverage are valid')
