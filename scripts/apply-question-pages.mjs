#!/usr/bin/env node
/**
 * Applies the long-tail question-page network to all 18 remaining satellite sites.
 *
 * For each satellite:
 *   1. Creates src/app/questions/[slug]/ and src/app/questions/
 *   2. Copies the identical page templates from windshield-denver (pilot)
 *   3. Patches src/app/sitemap.ts to include question pages
 *   4. Patches src/app/page.tsx to add Common Questions section
 *   5. Creates feat/question-pages-seo-network branch, commits, pushes
 *
 * Run: node scripts/apply-question-pages.mjs
 * Dry run: node scripts/apply-question-pages.mjs --dry-run
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const DRY_RUN = process.argv.includes('--dry-run')
const SITES_DIR = '/Users/dougsimpson/clients/pink-auto-glass/sites'
const PILOT_DIR = join(SITES_DIR, 'windshield-denver')

// Template files (identical across all satellites)
const TEMPLATE_SLUG_PAGE = join(PILOT_DIR, 'src/app/questions/[slug]/page.tsx')
const TEMPLATE_INDEX_PAGE = join(PILOT_DIR, 'src/app/questions/page.tsx')

// All 18 remaining satellites (windshield-denver is the already-committed pilot)
const SATELLITES = [
  'mobile-windshield-denver',
  'windshield-chip-repair-denver',
  'windshield-chip-repair-boulder',
  'aurora-windshield',
  'coloradospringswindshield',
  'autoglasscoloradosprings',
  'mobilewindshieldcoloradosprings',
  'windshieldreplacementfortcollins',
  'windshield-chip-repair-phoenix',
  'mobile-windshield-phoenix',
  'windshield-chip-repair-mesa',
  'windshield-chip-repair-tempe',
  'windshield-chip-repair-scottsdale',
  'windshield-cost-calculator',
  'windshield-price-compare',
  'new-windshield-cost',
  'windshield-cost-phoenix',
  'new-windshield-near-me',
  'cheapest-windshield',
]

// ── Sitemap patch ─────────────────────────────────────────────────────────────

function patchSitemap(content) {
  // 1. Add questions import after the first import line
  if (!content.includes("from '@/data/questions'") && !content.includes('from "@/data/questions"')) {
    content = content.replace(
      /^(import type \{ MetadataRoute \} from ['"]next['"])/m,
      `$1\nimport { questions } from '@/data/questions'`
    )
  }

  // 2. Add questionDate const before 'return ['
  if (!content.includes('questionDate')) {
    content = content.replace(
      '  return [',
      `  const questionDate = new Date("2026-06-04")\n  return [`
    )
  }

  // 3. Add question entries before the closing ] of the sitemap array
  if (!content.includes('/questions')) {
    const questionBlock = `
    { url: \`\${baseUrl}/questions\`, lastModified: questionDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    ...questions.map((q) => ({
      url: \`\${baseUrl}/questions/\${q.slug}\`,
      lastModified: questionDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),`

    // Find last occurrence of a sitemap entry line ending with `},` and insert after it
    // Pattern: the closing `  ]` followed by `\n}` at the end of the file
    content = content.replace(
      /(\n  \]\n\})\s*$/,
      `${questionBlock}\n  ]\n}`
    )
  }

  return content
}

// ── Homepage patch ────────────────────────────────────────────────────────────

const COMMON_QUESTIONS_SECTION = `
      {/* Common Questions */}
      <section className="py-10 sm:py-14 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Common Questions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {questions.slice(0, 4).map((q) => (
              <Link
                key={q.slug}
                href={\`/questions/\${q.slug}\`}
                className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-gray-700">{q.question}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/questions" className="text-blue-700 font-medium hover:text-blue-800 transition-colors inline-flex items-center gap-1 text-sm">
              See all questions <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
`

function patchHomepage(content, siteDir) {
  // Skip if already patched
  if (content.includes('{/* Common Questions */}')) {
    return { content, patched: false, reason: 'already patched' }
  }

  // 1. Add questions import (after last import line block)
  if (!content.includes("from '@/data/questions'") && !content.includes('from "@/data/questions"')) {
    // Find the last import line and insert after it
    const lastImportIdx = content.lastIndexOf('\nimport ')
    const endOfLastImport = content.indexOf('\n', lastImportIdx + 1)
    if (lastImportIdx !== -1 && endOfLastImport !== -1) {
      content = content.slice(0, endOfLastImport + 1)
        + `import { questions } from "@/data/questions"\n`
        + content.slice(endOfLastImport + 1)
    }
  }

  // 2. Add ChevronRight to lucide-react import if missing
  if (!content.includes('ChevronRight')) {
    // Find the lucide-react import line
    content = content.replace(
      /(\{ [^}]+ \}) from ["']lucide-react["']/,
      (match, imports) => {
        // Add ChevronRight to the import list
        const cleaned = imports.replace(/^\{ /, '').replace(/ \}$/, '')
        return `{ ${cleaned}, ChevronRight } from "lucide-react"`
      }
    )
  }

  // 3. Inject Common Questions section before FAQ section
  // Try anchor 1: {/* FAQ */}
  if (content.includes('\n      {/* FAQ */}')) {
    content = content.replace('\n      {/* FAQ */}', COMMON_QUESTIONS_SECTION + '\n      {/* FAQ */}')
    return { content, patched: true, reason: 'before {/* FAQ */}' }
  }

  // Try anchor 2: <FAQSection
  if (content.includes('\n      <FAQSection')) {
    content = content.replace('\n      <FAQSection', COMMON_QUESTIONS_SECTION + '\n      <FAQSection')
    return { content, patched: true, reason: 'before <FAQSection' }
  }

  // Try anchor 3: {/* Final CTA */}
  if (content.includes('\n      {/* Final CTA */}')) {
    content = content.replace('\n      {/* Final CTA */}', COMMON_QUESTIONS_SECTION + '\n      {/* Final CTA */}')
    return { content, patched: true, reason: 'before Final CTA' }
  }

  return { content, patched: false, reason: 'no anchor found — needs manual patch' }
}

// ── Git helpers ───────────────────────────────────────────────────────────────

function git(siteDir, cmd) {
  return execSync(`git -C "${siteDir}" ${cmd}`, { encoding: 'utf-8', stdio: 'pipe' }).trim()
}

function ensureBranch(siteDir, branch) {
  try {
    const current = git(siteDir, 'branch --show-current')
    if (current === branch) return
    // Check if branch exists
    try {
      git(siteDir, `checkout ${branch}`)
    } catch {
      git(siteDir, `checkout -b ${branch}`)
    }
  } catch (e) {
    git(siteDir, `checkout -b ${branch}`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

const results = { success: [], skipped: [], failed: [] }

for (const satellite of SATELLITES) {
  const siteDir = join(SITES_DIR, satellite)

  if (!existsSync(siteDir)) {
    console.log(`⚠️  Skipping ${satellite} — directory not found`)
    results.skipped.push({ satellite, reason: 'directory not found' })
    continue
  }

  const questionsDataFile = join(siteDir, 'src/data/questions.ts')
  if (!existsSync(questionsDataFile)) {
    console.log(`⚠️  Skipping ${satellite} — src/data/questions.ts not found (run satellite-question-bank.mjs first)`)
    results.skipped.push({ satellite, reason: 'questions.ts not found' })
    continue
  }

  console.log(`\n── ${satellite} ──`)

  try {
    // Step 1: Create question page directories
    const slugDir = join(siteDir, 'src/app/questions/[slug]')
    const questionsDir = join(siteDir, 'src/app/questions')
    if (!DRY_RUN) {
      mkdirSync(slugDir, { recursive: true })
      mkdirSync(questionsDir, { recursive: true })
    }

    // Step 2: Copy template files
    const slugTarget = join(siteDir, 'src/app/questions/[slug]/page.tsx')
    const indexTarget = join(siteDir, 'src/app/questions/page.tsx')
    if (!DRY_RUN) {
      copyFileSync(TEMPLATE_SLUG_PAGE, slugTarget)
      copyFileSync(TEMPLATE_INDEX_PAGE, indexTarget)
    }
    console.log(`  ✅ Template files copied`)

    // Step 3: Patch sitemap.ts
    const sitemapPath = join(siteDir, 'src/app/sitemap.ts')
    if (existsSync(sitemapPath)) {
      const original = readFileSync(sitemapPath, 'utf-8')
      const patched = patchSitemap(original)
      if (patched !== original) {
        if (!DRY_RUN) writeFileSync(sitemapPath, patched, 'utf-8')
        console.log(`  ✅ sitemap.ts patched`)
      } else {
        console.log(`  ⏭  sitemap.ts already has question pages or patch failed`)
      }
    } else {
      console.log(`  ⚠️  sitemap.ts not found`)
    }

    // Step 4: Patch page.tsx
    const pagePath = join(siteDir, 'src/app/page.tsx')
    if (existsSync(pagePath)) {
      const original = readFileSync(pagePath, 'utf-8')
      const { content: patched, patched: didPatch, reason } = patchHomepage(original, siteDir)
      if (didPatch) {
        if (!DRY_RUN) writeFileSync(pagePath, patched, 'utf-8')
        console.log(`  ✅ page.tsx patched (${reason})`)
      } else {
        console.log(`  ⚠️  page.tsx: ${reason}`)
      }
    } else {
      console.log(`  ⚠️  page.tsx not found`)
    }

    if (DRY_RUN) {
      console.log(`  [DRY RUN] would commit and push`)
      results.success.push(satellite)
      continue
    }

    // Step 5: Git operations
    ensureBranch(siteDir, 'feat/question-pages-seo-network')

    // Check if there's anything to commit
    const status = git(siteDir, 'status --short')
    if (!status.trim()) {
      console.log(`  ⏭  Nothing to commit — already up to date`)
      results.skipped.push({ satellite, reason: 'nothing to commit' })
      continue
    }

    git(siteDir, 'add src/app/questions src/app/sitemap.ts src/app/page.tsx src/data/questions.ts')

    const commitMsg = `feat(seo): add question pages — long-tail SEO network

Adds /questions/[slug] static pages and /questions index for long-tail
SEO targeting. FAQPage + BreadcrumbList schema on each page. LeadForm CTA.
Homepage gains Common Questions section linking to top 4 question pages.
Sitemap updated with all question page URLs.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

    git(siteDir, `commit -m "${commitMsg.replace(/"/g, '\\"')}"`)
    console.log(`  ✅ Committed`)

    git(siteDir, 'push -u origin feat/question-pages-seo-network')
    console.log(`  ✅ Pushed to origin/feat/question-pages-seo-network`)

    results.success.push(satellite)

  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`)
    results.failed.push({ satellite, error: err.message })
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════')
console.log(`✅ Success (${results.success.length}): ${results.success.join(', ')}`)
if (results.skipped.length) {
  console.log(`⏭  Skipped (${results.skipped.length}): ${results.skipped.map(s => `${s.satellite} (${s.reason})`).join(', ')}`)
}
if (results.failed.length) {
  console.log(`❌ Failed  (${results.failed.length}): ${results.failed.map(s => `${s.satellite}: ${s.error}`).join('\n')}`)
  process.exit(1)
}
console.log('══════════════════════════════════════════')
