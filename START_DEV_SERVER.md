# 🚀 How to View Your Changes Locally

## Quick Start

1. **Open Terminal** in Cursor (or your terminal app)

2. **Navigate to the project folder:**
   ```bash
   cd "/Users/amitboker/Downloads/Sales Dashboard"
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Wait for the server to start** - You'll see output like:
   ```
   VITE v7.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

5. **Open your browser** and go to:
   - **Main page:** http://localhost:5173/
   - **Login page:** http://localhost:5173/login
   - **Dashboard (with new header):** http://localhost:5173/dashboard

## What You'll See

✅ **New TopBar User Area** on the dashboard:
- Rounded rectangle avatar (top-left)
- User name: "עמית בוקר"
- User role: "מנהל"
- Notifications button (bell icon)
- Settings button (gear icon)

## Troubleshooting

**If port 5173 is busy:**
- Vite will automatically use the next available port (5174, 5175, etc.)
- Check the terminal output for the actual URL

**If you see errors:**
- Make sure you've run `npm install` first
- Check that all dependencies are installed

**To stop the server:**
- Press `Ctrl + C` in the terminal

## After Making Changes

- The page will **automatically reload** when you save files
- No need to refresh manually - Vite has hot module replacement (HMR)

---

**Your Vercel URL** (deployed version): https://sales-dashboard-omega-one.vercel.app
**Your Local URL** (development): http://localhost:5173
