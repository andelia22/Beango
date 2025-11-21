import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '..', 'attached_assets');
const destDir = path.resolve(__dirname, '..', 'dist', 'public', 'attached_assets');

console.log('Copying assets from:', sourceDir);
console.log('Copying assets to:', destDir);

if (!fs.existsSync(sourceDir)) {
  console.error('Source directory does not exist:', sourceDir);
  process.exit(1);
}

fs.cpSync(sourceDir, destDir, { recursive: true });
console.log('Assets copied successfully!');
