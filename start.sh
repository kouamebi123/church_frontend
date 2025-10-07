#!/bin/sh
set -e

echo "🚀 Starting application..."
echo "📁 Checking build directory..."

if [ ! -d "./build" ]; then
  echo "❌ Error: build directory not found!"
  ls -la
  exit 1
fi

echo "✅ Build directory found"
echo "📦 Files in build directory:"
ls -la ./build | head -20

echo "🌐 Starting Vite preview server on port ${PORT:-3000}..."
npx vite preview --host 0.0.0.0 --port ${PORT:-3000}
