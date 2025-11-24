#!/bin/bash
set -e

echo "Building client with Vite..."
vite build

echo "Building server with esbuild..."
esbuild server/index-prod.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "Copying data files and assets..."
node scripts/copy-assets.js

echo "Build complete!"
