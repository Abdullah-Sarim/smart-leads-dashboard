import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function getFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'dist') {
        getFiles(fullPath, files);
      }
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const root = process.cwd();
const ignoredDirs = ['node_modules', 'dist', '.git', 'coverage'];
const allFiles = getFiles(root).filter((f) => {
  const rel = f.replace(root + '\\', '');
  return !ignoredDirs.some((d) => rel.includes(d));
});

for (const file of allFiles) {
  const rel = file.replace(root + '\\', '').replace(/\\/g, '/');
  console.log(rel);
}