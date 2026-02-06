#!/bin/bash
# Deployment script for Vercel

cd "/Users/amitboker/Downloads/Sales Dashboard"

echo "📦 Staging all changes..."
git add -A

echo "💾 Committing changes..."
git commit -m "Add TopBar user area with rounded rectangle avatar, user name/role, and action buttons - Fix PostCSS config for CommonJS compatibility"

echo "🚀 Pushing to remote..."
git push

echo "✅ Changes pushed! Vercel will auto-deploy."
echo ""
echo "🌐 Your app URL: https://sales-dashboard-omega-one.vercel.app"
echo "📊 Dashboard: https://sales-dashboard-omega-one.vercel.app/dashboard"
