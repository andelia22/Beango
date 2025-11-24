import { cpSync, mkdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('📦 Copying data files and assets to dist...');

try {
  const distDir = join(projectRoot, 'dist');
  const distDataDir = join(distDir, 'data');
  const distAssetsDir = join(distDir, 'attached_assets');

  mkdirSync(distDataDir, { recursive: true });
  console.log('✓ Created dist/data directory');

  const citiesJsonSource = join(projectRoot, 'server', 'data', 'cities.json');
  const citiesJsonDest = join(distDataDir, 'cities.json');
  
  if (!existsSync(citiesJsonSource)) {
    throw new Error(`Source file not found: ${citiesJsonSource}`);
  }
  
  cpSync(citiesJsonSource, citiesJsonDest);
  console.log('✓ Copied cities.json to dist/data/');

  const assetsSource = join(projectRoot, 'attached_assets');
  
  if (!existsSync(assetsSource)) {
    throw new Error(`Assets directory not found: ${assetsSource}`);
  }
  
  cpSync(assetsSource, distAssetsDir, { recursive: true });
  console.log('✓ Copied attached_assets to dist/');

  if (!existsSync(citiesJsonDest)) {
    throw new Error('Verification failed: cities.json was not copied to dist/data/');
  }
  
  if (!existsSync(distAssetsDir)) {
    throw new Error('Verification failed: attached_assets was not copied to dist/');
  }
  
  console.log('✅ All files copied and verified successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  process.exit(1);
}
