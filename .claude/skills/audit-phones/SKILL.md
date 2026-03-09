# /audit-phones — Satellite Phone Number Audit

Scans all satellite site source directories and verifies phone numbers match
the expected market. Fixes any mismatches found.

## Arguments

$ARGUMENTS = optional site directory name to audit just one site (e.g., `coloradospringswindshield`).
Leave blank to audit ALL sites.

## Instructions

### 1. Run the audit script

```bash
node /Users/dougsimpson/.openclaw/workspace/PinkAutoGlassWebsite/scripts/audit-satellite-phones.js
```

Report the full output to the user.

### 2. If all pass

Print: "✓ All satellite sites have correct phone numbers. No action needed."
Done.

### 3. If any fail

For each failing site, run this Python fix script (replace SITE_DIR and WRONG/CORRECT numbers as appropriate):

```python
import os, re

site_dir = "/Users/dougsimpson/.openclaw/workspace/SITE_DIR/src"

# Standard replacements — adjust WRONG_DIGITS and CORRECT_DIGITS for the market
WRONG_DIGITS  = "4807127465"   # e.g. Phoenix number on a Denver site
CORRECT_DIGITS = "7209187465"  # e.g. correct Denver number

replacements = [
    (rf'tel:{WRONG_DIGITS}', f'tel:{CORRECT_DIGITS}'),
    (rf'tel:\+1{WRONG_DIGITS}', f'tel:+1{CORRECT_DIGITS}'),
    (rf'\({WRONG_DIGITS[:3]}\) {WRONG_DIGITS[3:6]}-{WRONG_DIGITS[6:]}',
     f'({CORRECT_DIGITS[:3]}) {CORRECT_DIGITS[3:6]}-{CORRECT_DIGITS[6:]}'),
    (rf'\+1{WRONG_DIGITS}', f'+1{CORRECT_DIGITS}'),
    (WRONG_DIGITS, CORRECT_DIGITS),
]

changed_files = []
for root, dirs, files in os.walk(site_dir):
    dirs[:] = [d for d in dirs if d not in ('node_modules', '.next')]
    for fname in files:
        if not (fname.endswith('.tsx') or fname.endswith('.ts')):
            continue
        fpath = os.path.join(root, fname)
        content = open(fpath).read()
        original = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        if content != original:
            open(fpath, 'w').write(content)
            changed_files.append(fpath.replace(site_dir, ''))

print(f"Fixed {len(changed_files)} files:")
for f in changed_files:
    print(f"  {f}")
```

After fixing each site:
1. `cd /Users/dougsimpson/.openclaw/workspace/SITE_DIR && npm run build`
2. Fix any TypeScript errors
3. `git add -A && git commit -m "Fix: correct phone number for MARKET market"`
4. `vercel --prod --scope dougsimpsoncodes-projects`

### 4. Re-run the audit to confirm

```bash
node /Users/dougsimpson/.openclaw/workspace/PinkAutoGlassWebsite/scripts/audit-satellite-phones.js
```

Must show 0 failed before declaring done.

### 5. Report

Print a table showing:
- How many sites audited
- How many were already correct
- How many were fixed (and list which ones)
- How many files were changed per site

## Market → Phone Reference

| Market | Display | E.164 | Digits |
|--------|---------|-------|--------|
| Denver / Colorado (all CO sites) | (720) 918-7465 | +17209187465 | 7209187465 |
| Phoenix / Arizona | (480) 712-7465 | +14807127465 | 4807127465 |
| Multi-market (carglassprices, windshieldrepairprices) | Both — intentional | — | — |
