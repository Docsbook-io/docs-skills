// install.mjs — installs the docs-sync pre-push git hook into the current repo.
// Copies hooks/pre-push from this skill directory into <repo-root>/.git/hooks/,
// marks it executable, and warns if the claude CLI is not on PATH.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import process from "node:process";

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let force = false;
let dryRun = false;

for (const arg of args) {
  if (arg === "--force") {
    force = true;
  } else if (arg === "--dry-run") {
    dryRun = true;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`
Usage: node install.mjs [options]

Installs the docs-sync pre-push git hook into the nearest git repository.

Options:
  --force      Overwrite an existing hook without creating a backup
  --dry-run    Print what would happen without writing any files
  --help, -h   Show this help message
`);
    process.exit(0);
  } else {
    console.error(`[docs-sync] Unknown flag: ${arg}`);
    console.error(`[docs-sync] Run with --help to see available options.`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Resolve paths
// ---------------------------------------------------------------------------

let repoRoot;
try {
  repoRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();
} catch {
  console.error("[docs-sync] Error: current directory is not inside a git repository.");
  console.error("[docs-sync] Run this script from within a git-tracked project.");
  process.exit(1);
}

const hookSource = path.join(import.meta.dirname, "hooks", "pre-push");
const hooksDir = path.join(repoRoot, ".git", "hooks");
const hookTarget = path.join(hooksDir, "pre-push");

const MARKER = "# pre-push hook installed by docs-sync skill";

// ---------------------------------------------------------------------------
// Dry-run mode
// ---------------------------------------------------------------------------

if (dryRun) {
  console.log(`[docs-sync] --dry-run: no files will be written.\n`);
  console.log(`  Source : ${hookSource}`);
  console.log(`  Target : ${hookTarget}`);

  if (fs.existsSync(hookTarget)) {
    const existing = fs.readFileSync(hookTarget, "utf8");
    if (existing.includes(MARKER)) {
      console.log(`  Action : Overwrite existing docs-sync hook.`);
    } else if (force) {
      console.log(`  Action : Overwrite existing non-docs-sync hook (--force).`);
    } else {
      const ts = Date.now();
      console.log(`  Action : Back up existing hook to pre-push.backup-${ts}, then install.`);
    }
  } else {
    console.log(`  Action : Install hook (no existing hook found).`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Handle existing hook
// ---------------------------------------------------------------------------

if (fs.existsSync(hookTarget)) {
  const existing = fs.readFileSync(hookTarget, "utf8");
  const isOursAlready = existing.includes(MARKER);

  if (!isOursAlready && !force) {
    const backup = `${hookTarget}.backup-${Date.now()}`;
    console.warn(`[docs-sync] Warning: an existing pre-push hook was found that was not installed by docs-sync.`);
    console.warn(`[docs-sync] Backing it up to: ${backup}`);
    fs.copyFileSync(hookTarget, backup);
  } else if (!isOursAlready && force) {
    console.warn(`[docs-sync] Warning: overwriting existing pre-push hook (--force).`);
  }
  // If it's already ours, just silently overwrite (update in place).
}

// ---------------------------------------------------------------------------
// Install hook
// ---------------------------------------------------------------------------

// Ensure .git/hooks directory exists (it always should, but be safe).
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

fs.copyFileSync(hookSource, hookTarget);
fs.chmodSync(hookTarget, 0o755);

// ---------------------------------------------------------------------------
// Check for claude CLI
// ---------------------------------------------------------------------------

let claudeFound = true;
try {
  execSync("which claude", { stdio: "ignore" });
} catch {
  claudeFound = false;
}

// ---------------------------------------------------------------------------
// Success output
// ---------------------------------------------------------------------------

console.log(`
✓ Installed docs-sync pre-push hook → ${hookTarget}
✓ Marked executable
`);

if (!claudeFound) {
  console.warn(`⚠  claude CLI not found on PATH.`);
  console.warn(`   The hook will skip silently until it is installed.`);
  console.warn(`   Install: https://claude.com/claude-code\n`);
}

console.log(`Try it: git push (or DOCS_SYNC_SKIP=1 git push to skip once)`);
