#!/bin/bash

# Portfolio Website Start Script

set -e

echo "🚀 Starting Portfolio Website..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if resume data needs to be extracted
if [ ! -f "src/data/resume.ts" ] || [ "public/resume.pdf" -nt "src/data/resume.ts" ] || [ "public/resume.docx" -nt "src/data/resume.ts" ]; then
    echo "📄 Extracting resume data..."
    npm run extract-resume || echo "⚠️  Resume extraction failed, continuing with existing data..."
fi

# Start the development server
echo "🌐 Starting development server..."
npm run dev

