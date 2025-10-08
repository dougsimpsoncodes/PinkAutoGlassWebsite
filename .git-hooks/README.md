# Git Hooks

This directory contains optional Git hooks to improve code quality and prevent regressions.

## Available Hooks

### `pre-push`
Runs verification checks before pushing code to the remote repository.

**Checks performed:**
1. ✅ Build succeeds (`npm run build`)
2. ✅ Brand URLs redirect correctly (`npm run verify:brands`)
3. ✅ Schema markup is valid (`npm run verify:schema`)

**Installation:**

**Option 1: Copy to `.git/hooks/`**
```bash
cp .git-hooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

**Option 2: Configure Git to use `.git-hooks/` directory (recommended)**
```bash
git config core.hooksPath .git-hooks
```

This sets the hooks directory for the repository, so any hooks added to `.git-hooks/` will be automatically used.

**Option 3: Global configuration (applies to all repos)**
```bash
# Set globally
git config --global core.hooksPath ~/.git-hooks

# Then create symlink
mkdir -p ~/.git-hooks
ln -s $(pwd)/.git-hooks/pre-push ~/.git-hooks/pre-push
```

## Disabling Hooks

If you need to bypass the pre-push hook temporarily:

```bash
# Skip all hooks
git push --no-verify

# Or set environment variable
SKIP_HOOKS=1 git push
```

**Note:** Only skip hooks when absolutely necessary, as they help catch issues before they reach production.

## Hook Behavior

The pre-push hook will:
- ✅ Run automatically on `git push`
- ✅ Build the project to ensure no compilation errors
- ✅ Start a local server to test redirects and URLs
- ✅ Verify all brand URL redirects are working
- ✅ Validate schema markup on all page types
- ✅ Clean up server process after tests
- ❌ Prevent push if any check fails

**Typical run time:** 30-60 seconds (includes build + verification)

## Troubleshooting

**Hook not running:**
- Verify hook is executable: `ls -l .git/hooks/pre-push`
- Check Git config: `git config core.hooksPath`
- Ensure hook file has no `.sample` extension

**Build fails:**
- Fix TypeScript/compilation errors
- Run `npm run build` manually to see errors
- Commit fixes before pushing

**Verification fails:**
- Check specific error in hook output
- Run `npm run verify:brands` manually
- Run `npm run verify:schema` manually
- Fix issues and commit before pushing

**Server port already in use:**
- Stop any running Next.js servers: `pkill -f "next start"`
- Verify port 3000 is available: `lsof -i :3000`

## CI/CD Integration

These same verification scripts should run in CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build

- name: Start server
  run: npm run start &

- name: Wait for server
  run: sleep 5

- name: Verify brand URLs
  run: npm run verify:brands

- name: Verify schema
  run: npm run verify:schema
```

## Customization

To modify the pre-push hook:

1. Edit `.git-hooks/pre-push`
2. Test changes: `.git-hooks/pre-push`
3. Commit to version control
4. Other team members get updates automatically (if using `core.hooksPath`)

## Team Setup

For team consistency, add this to your project setup documentation:

```bash
# After cloning the repository
git config core.hooksPath .git-hooks
```

Or add to `package.json` scripts:

```json
{
  "scripts": {
    "postinstall": "git config core.hooksPath .git-hooks || true"
  }
}
```

This ensures all team members use the same hooks automatically after `npm install`.
