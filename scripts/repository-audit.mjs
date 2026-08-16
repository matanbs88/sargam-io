import { readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".next", ".vercel", "node_modules"]);
const requiredFiles = [
  "README.md",
  "GEMINI_REVIEW_REPORT.md",
  "MUSIC_DOMAIN.md",
  "INSTRUMENT_STRATEGY.md",
  "TESTING_CHECKLIST.md",
  "WEEKEND_SUMMARY.md",
  "docs/README.md",
  "docs/operations/MAINTENANCE_WORKFLOW.md",
  "docs/audits/REPOSITORY_AUDIT_2026-08-16.md",
];

async function collectFiles(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const fileLists = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        return ignoredDirectories.has(entry.name) ? [] : collectFiles(fullPath);
      }
      return [fullPath.slice(root.length + 1).replaceAll("\\", "/")];
    }),
  );

  return fileLists.flat();
}

const files = await collectFiles();
const missingFiles = requiredFiles.filter((path) => !files.includes(path));
const count = (predicate) => files.filter(predicate).length;

console.log("Sargam.io repository audit");
console.log(`- Source files: ${count((file) => file.startsWith("app/") || file.startsWith("src/"))}`);
console.log(`- Test files: ${count((file) => /(?:\.test\.|\.spec\.)/.test(file))}`);
console.log(`- Documentation files: ${count((file) => file.endsWith(".md"))}`);
console.log(`- Required vault files: ${requiredFiles.length - missingFiles.length}/${requiredFiles.length}`);

if (missingFiles.length > 0) {
  console.error(`Missing required vault files: ${missingFiles.join(", ")}`);
  process.exitCode = 1;
}
