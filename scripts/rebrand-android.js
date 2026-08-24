#!/usr/bin/env node
/* eslint-disable no-console */
// ─── rebrand-android.js ────────────────────────────────────────────────────────
// Android counterpart to rebrand.js. That script explicitly excludes Android
// (see its header) — this one closes that gap, reading the SAME config file
// so a single `scripts/rebrand.config.json` drives web + iOS + Android
// together.
//
//   Usage:  node scripts/rebrand-android.js            (uses scripts/rebrand.config.json)
//           node scripts/rebrand-android.js path/to/other-config.json
//           node scripts/rebrand-android.js --dry-run
//
// What it changes (from the CURRENT brand, read from android/app/build.gradle
// → the config's brand):
//   1. android/app/build.gradle ................. namespace, applicationId,
//      versionCode, versionName
//   2. .../res/values/strings.xml ................ app_name, title_activity_main,
//      package_name, custom_url_scheme
//   3. .../assets/capacitor.config.json ........... appId, appName(←STORE_NAME)
//      (auto-regenerated later by `npx cap sync android` — kept correct on
//      disk anyway so a build without a sync still carries the right identity)
//   4. .../java/<old/package/path>/MainActivity.java
//      → MOVED to .../java/<new/package/path>/MainActivity.java, and its
//      `package ...;` declaration rewritten to match. This is a real file
//      move, not just a content edit — the old (now-empty) package folders
//      are pruned afterward.
//
// What it deliberately does NOT do — same philosophy as rebrand.js: these are
// real registrations with an external provider, not a text substitution:
//   • android/app/google-services.json — re-download from the brand's Firebase
//     project (Android app registered under the NEW applicationId). The
//     script only reads the existing file to warn you when it's stale.
//   • signingConfigs.release keystore — each brand needs its OWN keystore.
//     Never reuse one across brands. The checklist below prints the exact
//     `keytool` command to generate a fresh one; running it is left to you.
//   • AndroidManifest.xml — under AGP 8 (used here) the package="" attribute
//     doesn't exist any more; namespace in build.gradle is the only source of
//     truth, already handled above. Nothing to do.
//
// Safety: identical contract to rebrand.js — every file is read + every
// expected pattern verified FIRST; nothing is written unless the whole plan
// succeeds. Exits non-zero with a clear message otherwise.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

// ── 1. Load config (same file rebrand.js uses) ──────────────────────────────
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run") || argv.includes("-n");
const configPath = path.resolve(
  ROOT,
  argv.find((a) => !a.startsWith("-")) || "scripts/rebrand.config.json",
);
if (!fs.existsSync(configPath)) {
  console.error(`✖ Config not found: ${configPath}`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

for (const key of ["appId", "appName", "STORE_NAME", "versionCode", "versionName"]) {
  if (cfg[key] === undefined || cfg[key] === "") {
    console.error(`✖ Config is missing required field "${key}"`);
    process.exit(1);
  }
}
if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i.test(cfg.appId)) {
  console.error(`✖ "${cfg.appId}" is not a valid reverse-DNS application id`);
  process.exit(1);
}
if (!Number.isInteger(cfg.versionCode) || cfg.versionCode < 1) {
  console.error(`✖ "versionCode" must be a positive integer (got ${JSON.stringify(cfg.versionCode)})`);
  process.exit(1);
}

const newId = cfg.appId;
const newName = cfg.appName;         // launcher / activity display name
const newStoreName = cfg.STORE_NAME; // capacitor config's appName field

// ── 2. Detect the CURRENT Android brand from build.gradle (ground truth) ───
const gradlePath = path.join(ROOT, "android/app/build.gradle");
if (!fs.existsSync(gradlePath)) {
  console.error(`✖ ${rel(gradlePath)} not found — is the android/ platform added?`);
  process.exit(1);
}
const gradleSrc = fs.readFileSync(gradlePath, "utf8");
const oldNamespace = gradleSrc.match(/namespace\s+["']([^"']+)["']/)?.[1];
const oldAppId = gradleSrc.match(/applicationId\s+["']([^"']+)["']/)?.[1];
if (!oldNamespace || !oldAppId) {
  console.error("✖ Could not detect current namespace/applicationId in build.gradle");
  process.exit(1);
}
if (oldNamespace !== oldAppId) {
  console.error(
    `✖ build.gradle's namespace (${oldNamespace}) and applicationId (${oldAppId})\n` +
      `  already disagree — fix that by hand first; this script assumes they move together.`,
  );
  process.exit(1);
}
const oldId = oldAppId;

console.log(`\nAndroid rebrand: ${oldId}  →  ${newId}`);
console.log(`  app_name / title_activity_main → "${newName}"`);
console.log(`  capacitor.config.json appName  → "${newStoreName}"`);
console.log("");

// ── 3. Prepare all edits in memory (same verify-first contract as rebrand.js) ─
const edits = [];
const fileMoves = []; // { from, to, content }
const problems = [];
const warnings = [];

function planEdit(file, transforms, { optionalFile = false } = {}) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    if (!optionalFile) problems.push(`${file}: file not found`);
    return;
  }
  const original = fs.readFileSync(full, "utf8");
  let content = original;
  for (const t of transforms) {
    if (!t.pattern.test(content)) {
      if (t.optional) {
        warnings.push(`${file}: skipped (pattern not present) → ${t.describe}`);
        continue;
      }
      problems.push(`${file}: expected pattern not found → ${t.describe}`);
      continue;
    }
    content = content.replace(t.pattern, t.replacement);
  }
  if (content !== original) edits.push({ file: full, content });
}

// 3.1 build.gradle
planEdit("android/app/build.gradle", [
  { pattern: /namespace\s+["'][^"']+["']/, replacement: `namespace "${newId}"`, describe: "namespace" },
  { pattern: /applicationId\s+["'][^"']+["']/, replacement: `applicationId "${newId}"`, describe: "applicationId" },
  { pattern: /versionCode\s+\d+/, replacement: `versionCode ${cfg.versionCode}`, describe: "versionCode" },
  { pattern: /versionName\s+["'][^"']+["']/, replacement: `versionName "${cfg.versionName}"`, describe: "versionName" },
]);

// 3.2 strings.xml
planEdit("android/app/src/main/res/values/strings.xml", [
  {
    pattern: /(<string name="app_name"[^>]*>)[^<]*(<\/string>)/,
    replacement: `$1${newName}$2`,
    describe: "app_name",
  },
  {
    pattern: /(<string name="title_activity_main"[^>]*>)[^<]*(<\/string>)/,
    replacement: `$1${newName}$2`,
    describe: "title_activity_main",
  },
  {
    pattern: /(<string name="package_name"[^>]*>)[^<]*(<\/string>)/,
    replacement: `$1${newId}$2`,
    describe: "package_name",
  },
  {
    pattern: /(<string name="custom_url_scheme"[^>]*>)[^<]*(<\/string>)/,
    replacement: `$1${newId}$2`,
    describe: "custom_url_scheme",
  },
]);

// 3.3 assets/capacitor.config.json — optional, regenerated by `cap sync` anyway
planEdit(
  "android/app/src/main/assets/capacitor.config.json",
  [
    { pattern: /"appId":\s*"[^"]*"/, replacement: `"appId": "${newId}"`, describe: "appId" },
    { pattern: /"appName":\s*"[^"]*"/, replacement: `"appName": "${newStoreName}"`, describe: "appName" },
  ],
  { optionalFile: true },
);

// 3.4 MainActivity.java — a real move, not just a content edit
const oldPkgPath = oldId.split(".").join("/");
const newPkgPath = newId.split(".").join("/");
const oldMainActivity = path.join(ROOT, `android/app/src/main/java/${oldPkgPath}/MainActivity.java`);
const newMainActivity = path.join(ROOT, `android/app/src/main/java/${newPkgPath}/MainActivity.java`);
if (!fs.existsSync(oldMainActivity)) {
  problems.push(`android/app/src/main/java/${oldPkgPath}/MainActivity.java: file not found`);
} else if (oldId !== newId) {
  const original = fs.readFileSync(oldMainActivity, "utf8");
  if (!/package\s+[\w.]+;/.test(original)) {
    problems.push(`MainActivity.java: expected pattern not found → package declaration`);
  } else {
    const content = original.replace(/package\s+[\w.]+;/, `package ${newId};`);
    fileMoves.push({ from: oldMainActivity, to: newMainActivity, content });
  }
} else {
  warnings.push("MainActivity.java: skipped (package id unchanged) → move/rewrite");
}

// ── 4. Abort if anything didn't match ────────────────────────────────────────
if (problems.length) {
  console.error("✖ Aborted — no files were changed. Problems:\n");
  problems.forEach((p) => console.error("  • " + p));
  process.exit(1);
}

if (warnings.length) {
  console.log("⚠ Skipped (not fatal — verify each one is genuinely absent/unneeded):\n");
  warnings.forEach((w) => console.log("  • " + w));
  console.log("");
}

if (!edits.length && !fileMoves.length) {
  console.log("Nothing to do — every file already matches the config.");
  process.exit(0);
}

// ── 5. Write everything ──────────────────────────────────────────────────────
for (const e of edits) {
  if (!DRY_RUN) fs.writeFileSync(e.file, e.content, "utf8");
  console.log(`${DRY_RUN ? "· would update" : "✔ updated "} ${rel(e.file)}`);
}

for (const m of fileMoves) {
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(m.to), { recursive: true });
    fs.writeFileSync(m.to, m.content, "utf8");
    fs.unlinkSync(m.from);
    // Prune now-empty package directories back up to (but not including)
    // android/app/src/main/java, so a deep old package path doesn't linger
    // as empty folders.
    const javaRoot = path.join(ROOT, "android/app/src/main/java");
    let dir = path.dirname(m.from);
    while (dir !== javaRoot && dir.startsWith(javaRoot)) {
      if (fs.readdirSync(dir).length > 0) break;
      fs.rmdirSync(dir);
      dir = path.dirname(dir);
    }
  }
  console.log(
    `${DRY_RUN ? "· would move  " : "✔ moved   "} ${rel(m.from)} → ${rel(m.to)}`,
  );
}

// ── 6. Post-run checklist ────────────────────────────────────────────────────
if (DRY_RUN) {
  console.log(
    `\n🔍 DRY RUN — nothing was written. Re-run without --dry-run to apply.\n` +
      `   Target: ${newId} ("${newName}") v${cfg.versionName} (code ${cfg.versionCode})\n`,
  );
} else {
  console.log(
    `\n✅ Android rebranded to ${newId} ("${newName}") v${cfg.versionName} (code ${cfg.versionCode})\n`,
  );
}

let stepNo = 0;
const step = (text) => {
  const n = `  ${++stepNo}. `;
  console.log(n + text.split("\n").join("\n" + " ".repeat(n.length)));
};

console.log("── REQUIRED next steps ─────────────────────────────────────────");

const gsPath = path.join(ROOT, "android/app/google-services.json");
if (fs.existsSync(gsPath)) {
  const pkg = fs.readFileSync(gsPath, "utf8").match(/"package_name":\s*"([^"]*)"/)?.[1];
  if (pkg === newId) {
    step("google-services.json already matches the new applicationId ✔");
  } else {
    step(
      `⚠ REPLACE android/app/google-services.json — its package_name is\n` +
        `${pkg ?? "(unreadable)"}, not ${newId}. Add an Android app with this exact\n` +
        `applicationId in the brand's Firebase project and download the new file.\n` +
        `Until this is replaced the build fails with: No matching client found\n` +
        `for package name '${newId}'.`,
    );
  }
} else {
  step(
    `⚠ android/app/google-services.json is missing entirely. Add an Android app\n` +
      `with applicationId ${newId} in the brand's Firebase project and download it.`,
  );
}

step(
  `⚠ Signing keystore — each brand needs its OWN, never reused. Generate one:\n` +
    `  keytool -genkey -v -keystore ${newId}-release.jks \\\n` +
    `    -alias ${newId.split(".").pop()} -keyalg RSA -keysize 2048 -validity 10000\n` +
    `Then point android/app/build.gradle's signingConfigs.release at it, and\n` +
    `store the keystore + its passwords somewhere durable — losing it means\n` +
    `losing the ability to ship updates to this brand's app forever.`,
);

step(
  "Rebuild:\n" +
    "  npm run build\n" +
    "  npx cap sync android\n" +
    "  → open android/ in Android Studio, or ./gradlew assembleDebug",
);

console.log("\n────────────────────────────────────────────────────────────────\n");
