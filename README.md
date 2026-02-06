# Planning Assessment Form 🏗️

A premium, modern web form application for collecting planning assessment requests with Google Maps address autocomplete, UK LPA selection, file uploads, and webhook integration.

## ✨ Features

### Premium UI/UX
- **High-end design**: Dark gradient background with glass morphism effects
- **Smooth animations**: Micro-interactions and transitions throughout
- **Responsive**: Mobile-first design with sticky submit button on mobile
- **Accessible**: ARIA labels, keyboard navigation, and semantic HTML

### Smart Address Search
- **Google Maps integration**: Real-time address autocomplete using Google Places API (New)
- **UK-only restriction**: Hard enforcement of UK addresses
- **Postcode validation**: Required for correspondence address
- **Rich suggestions**: Shows primary and secondary address lines with dropdown

### Form Features
- **Comprehensive validation**: Inline error messages with smooth UX
- **Multi-file upload**: Drag and drop support for documents (PDF, DOC, images, DWG)
- **LPA dropdown**: Searchable list of all UK Local Planning Authorities
- **Character counter**: Live feedback for proposal summary (max 2000 chars)
- **Draft saving**: Auto-saves form data every 30 seconds to localStorage
- **Spam protection**: Honeypot field

### Data Submission
- **Webhook integration**: Posts structured JSON to configurable endpoint
- **File upload simulation**: Ready for integration with cloud storage
- **Success screen**: Polished confirmation with option to submit another response

## 📋 Form Fields

1. **Contact Details**
   - First Name, Last Name (required)
   - Email (with validation)
   - Phone Number (with country selector, default UK +44)
   - WhatsApp User (Yes/No)
   - Company Name (optional)

2. **Address Details**
   - Correspondence Address (Google autocomplete, postcode required)
   - Site Address (Google autocomplete, can be nearest postcode)
   - Local Planning Authority (searchable dropdown with 400+ UK councils)

3. **Planning Details**
   - File Upload (multi-file, max 10MB each)
   - Proposal Summary (textarea, max 2000 chars with counter)
   - How did you hear about us? (dropdown)

## 🚀 Setup Instructions

### Prerequisites
- Google Maps API key with **Places API (New)** enabled
- Webhook endpoint URL (e.g., Zapier, Make.com, or custom API)

### Installation

1. **Configure Settings**
   - Open `settings.html` in your browser
   - Enter your Google Maps API Key
   - Enter your Webhook URL
   - Click "Save Configuration"

2. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Create/select a project
   - Enable "Places API (New)"
   - Create credentials → API Key
   - (Recommended) Restrict key to your domain

3. **Set Up Webhook**
   - Use [Webhook.site](https://webhook.site) for testing
   - Or set up automation with [Zapier](https://zapier.com) / [Make.com](https://make.com)
   - Or use your own API endpoint

### Webhook Payload Format

The form sends the following JSON structure:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone_country_code": "+44",
  "phone_number": "7700900000",
  "whatsapp_user": "Yes",
  "company_name": "Example Ltd",
  "correspondence": {
    "formatted": "10 Downing Street, London SW1A 2AA, UK",
    "postcode": "SW1A 2AA",
    "city": "London",
    "county": "Greater London",
    "country": "United Kingdom",
    "lat": 51.5034,
    "lng": -0.1276
  },
  "site": {
    "formatted": "...",
    "postcode": "...",
    "city": "...",
    "county": "...",
    "country": "United Kingdom",
    "lat": 0.0,
    "lng": 0.0
  },
  "lpa_name": "Westminster",
  "lpa_id": "E09000033",
  "proposal_summary": "Proposal description...",
  "heard_about_us": "Search Engine (e.g. Google, Bing)",
  "uploaded_files": [
    {
      "name": "site-plan.pdf",
      "url": "https://storage.example.com/...",
      "type": "application/pdf",
      "size": 1024000
    }
  ],
  "submitted_at": "2026-02-04T18:00:00.000Z"
}
```

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Follow prompts to deploy

### Option 2: Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel --prod`
3. Follow prompts to deploy

### Option 3: GitHub Pages
1. Create a GitHub repository
2. Push all files to the repository
3. Go to Settings → Pages
4. Select branch and root folder
5. Save and wait for deployment

### Option 4: Cloudflare Pages
1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your Git repository
3. Configure build settings (none needed for static site)
4. Deploy

### Option 5: Any Static Host
Upload all files to any static hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Firebase Hosting
- Surge.sh

## 📁 File Structure

```
planning-assessment-form/
├── index.html          # Main form page
├── settings.html       # Configuration page
├── styles.css          # Premium styling with glass morphism
├── app.js             # Main application logic
├── config.js          # Configuration management
├── uk-lpas.js         # UK Local Planning Authorities dataset
├── README.md          # This file
└── deploy.sh          # Deployment helper script
```

## 🎨 Design Highlights

- **Color Palette**: Dark navy gradients with blue/purple accents
- **Typography**: Inter font family for modern, clean text
- **Components**: Glass cards with blur effects and soft shadows
- **Animations**: Smooth transitions, micro-interactions, glow effects
- **Accessibility**: WCAG compliant with keyboard navigation

## 🔒 Security Features

- **Honeypot spam protection**: Hidden field to catch bots
- **Input validation**: Client-side validation for all fields
- **API key restriction**: Recommended to restrict Google Maps API key to domain
- **No sensitive data storage**: All configuration in localStorage (user's browser)

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Customization

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --btn-gradient-start: #3b82f6;
    --btn-gradient-end: #8b5cf6;
    /* ... more variables */
}
```

### Add Form Fields
1. Add HTML in `index.html`
2. Add validation in `app.js`
3. Include in payload structure

### Modify LPAs
Edit `uk-lpas.js` to add/remove planning authorities

## 📞 Support

For issues or questions:
1. Check the settings page for configuration help
2. Verify Google Maps API key has Places API enabled
3. Test webhook URL with a tool like Postman
4. Check browser console for errors

## 📄 License

This project is provided as-is for use in planning assessment workflows.

---

**Built with ❤️ for premium user experiences**
