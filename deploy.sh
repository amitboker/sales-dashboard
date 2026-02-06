#!/bin/bash
# Deployment script for Sales Dashboard

cd "/Users/amitboker/Downloads/Sales Dashboard"

echo "📦 Staging all changes..."
git add -A

echo "💾 Committing changes..."
git commit -m "Update login page with new design - standalone CSS version" || echo "No changes to commit"

echo "🚀 Checking for git remote..."
if git remote | grep -q .; then
    echo "📤 Pushing to remote..."
    git push
    echo "✅ Pushed to remote. Vercel will auto-deploy."
else
    echo "⚠️  No git remote found. Please deploy manually via Vercel dashboard."
    echo "   Or connect your repo: git remote add origin <your-repo-url>"
fi

echo "✨ Done! Your changes are ready for deployment."
