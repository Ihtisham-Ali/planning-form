# 🗺️ Google Maps API Configuration Guide

## ⚠️ Current Issue

Your form is showing **"Searching addresses..."** without displaying any results because the Google Maps API is returning an error. The most common error is:

**`ApiTargetBlockedMapError` or `REQUEST_DENIED`**

This means your API key is missing the required APIs.

---

## ✅ Step-by-Step Fix

### Step 1: Open Google Cloud Console
1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account
3. Select your project (or create a new one if needed)

### Step 2: Enable Required APIs
You need to enable **3 specific APIs** for your project:

#### 2.1 Enable Maps JavaScript API
1. Go to **APIs & Services** → **Library**
2. Search for: **"Maps JavaScript API"**
3. Click on it and press **"Enable"**
4. Wait for confirmation

#### 2.2 Enable Places API (Legacy)
1. Still in **Library**, search for: **"Places API"**
2. Look for the one labeled just **"Places API"** (not "Places API (New)")
3. Click on it and press **"Enable"**
4. Wait for confirmation

#### 2.3 Enable Geocoding API
1. Still in **Library**, search for: **"Geocoding API"**
2. Click on it and press **"Enable"**
3. Wait for confirmation

### Step 3: Check API Key Restrictions
1. Go to **APIs & Services** → **Credentials**
2. Find your API key in the list (the one you configured in the form)
3. Click on the API key name to edit it

#### Application Restrictions
- **For testing**: Set to **"None"** 
- **For production**: Set to **"HTTP referrers"** and add:
  ```
  http://localhost:8000/*
  https://yourdomain.com/*
  ```

#### API Restrictions
- Select **"Restrict key"**
- Check these 3 APIs:
  - ✅ Maps JavaScript API
  - ✅ Places API
  - ✅ Geocoding API
- Click **"Save"**

---

## 🧪 Testing

After enabling the APIs and configuring your key:

1. **Wait 1-2 minutes** for changes to propagate
2. **Refresh your form** (hard refresh: Cmd+Shift+R)
3. **Try typing an address** like:
   - "10 Downing Street"
   - "Buckingham Palace"
   - "Your street name"
4. You should now see address suggestions in a dropdown!

---

## 🎯 Expected Behavior

When configured correctly:
- ✅ Type 3+ characters in address field
- ✅ See "Searching addresses..." briefly
- ✅ See a dropdown with UK address suggestions
- ✅ Click a suggestion to fill the address + postcode

---

## 🐛 Still Not Working?

### Check the browser console:
1. Open the form in your browser
2. Press **F12** or **Cmd+Option+I**
3. Go to the **Console** tab
4. Type an address
5. Look for errors starting with "Google Maps..."

### Common errors and fixes:

| Error | Solution |
|-------|----------|
| `ApiTargetBlockedMapError` | Enable the 3 required APIs (see Step 2) |
| `REQUEST_DENIED` | Check API key restrictions (see Step 3) |
| `OVER_QUERY_LIMIT` | You've hit your free quota, wait or upgrade |
| `API key not valid` | The API key is incorrect, re-copy from Console |

---

## 💰 Pricing Information

Google Maps provides a **$200/month free credit** which includes:
- **40,000 autocomplete requests** per month (free tier)
- After that: $2.83 per 1,000 requests

For a small planning form, this is usually sufficient and will stay free.

---

## 📞 Need Help?

If you're still having issues:
1. Double-check all 3 APIs are enabled
2. Wait 5 minutes for changes to propagate
3. Clear your browser cache and refresh
4. Check the console for the exact error message

**Current API Key (first 10 chars):**
```
AIzaSyBz0b...
```
(Check this matches what you see in Google Cloud Console)
