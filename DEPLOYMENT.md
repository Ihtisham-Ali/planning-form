# 🚀 Quick Deployment Guide

Your Planning Assessment Form is ready to deploy! Here are the easiest deployment options:

## ⚡ Option 1: Netlify Drop (Easiest - No CLI Required)

1. **Go to** [Netlify Drop](https://app.netlify.com/drop)
2. **Drag and drop** the entire project folder
3. **Done!** Your site will be live in seconds
4. **Configure** your API keys via the settings page

## 🌐 Option 2: Netlify CLI (Recommended for Updates)

```bash
# Already installed! Just run:
netlify deploy --prod

# Follow the prompts:
# 1. Authorize Netlify (browser will open)
# 2. Choose "Create & configure a new site"
# 3. Select your team
# 4. Publish directory: . (current directory)
```

## 📦 Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🎯 Option 4: GitHub Pages

1. Create a new GitHub repository
2. Add all files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
3. Go to **Settings → Pages**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**

## 🌊 Option 5: Surge.sh (Simplest CLI)

```bash
# Install Surge
npm install -g surge

# Deploy (from project directory)
surge .

# Follow prompts for email and domain name
```

## ⚙️ Post-Deployment Steps

After deployment, **IMPORTANT**:

1. **Visit your deployed site**
2. **Click the settings gear icon** (bottom right)
3. **Configure:**
   - Google Maps API Key (with Places API New enabled)
   - Webhook URL (where form submissions go)
4. **Test the form!**

## 🔑 Getting Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create/select a project
3. Enable **"Places API (New)"**
4. Go to **Credentials** → Create API Key
5. **Restrict** your key to your domain (recommended)
6. Copy and paste into settings

## 🔗 Setting Up Webhook

**For Testing:**
- Use [Webhook.site](https://webhook.site) - instant webhook URL

**For Production:**
- [Zapier](https://zapier.com) - Connect to Google Sheets, email, CRM, etc.
- [Make.com](https://make.com) - Similar to Zapier
- Your own API endpoint

## 📂 What Gets Deployed

All files in this folder:
- ✅ index.html (main form)
- ✅ settings.html (config page)
- ✅ styles.css (premium styling)
- ✅ app.js (main logic)
- ✅ config.js (config management)
- ✅ uk-lpas.js (UK councils data)
- ✅ netlify.toml (Netlify config)
- ✅ README.md (documentation)

## 🎉 You're All Set!

Your premium Planning Assessment Form is deployment-ready. Choose any option above and you'll be live in minutes!

---

**Need help?** Check the full README.md or the settings page for detailed instructions.
