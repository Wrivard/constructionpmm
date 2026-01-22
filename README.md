# Construction PMM - Website

Webflow export ready for Vercel deployment.

## 🚀 Deployment to Vercel

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import the GitHub repository: `Wrivard/constructionpmm`
4. Vercel will auto-detect the project settings

### Step 2: Configure Vercel Settings

**⚠️ CRITICAL SETTINGS:**

**Build & Output Settings:**
- **Framework Preset**: Select **"Other"** or **"Static Site"**
- **Build Command**: Leave **EMPTY** (no build step needed)
- **Output Directory**: Leave **EMPTY** (not `/public`)
- **Root Directory**: Leave **EMPTY** (index.html is at repo root)
- **Install Command**: Leave **EMPTY**

**Important Notes:**
- Do NOT use a `/public` folder for Vercel static sites
- All files should be at the root directory
- Vercel will automatically serve `index.html` as the homepage

### Step 3: Add Custom Domain

1. In Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `constructionpmm.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `sitemap.xml` and `robots.txt` to replace `[DOMAIN]` with your actual domain

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Your site will be live at the Vercel URL or your custom domain

## 📁 Project Structure

```
├── index.html              # Homepage
├── contact.html            # Contact page
├── carriere.html           # Career page with CV upload
├── entreprise.html         # About/Company page
├── expertise.html          # Services/Expertise page
├── projets.html            # Projects listing
├── projets/                # Individual project pages
├── api/                    # Serverless functions (Vercel)
│   ├── submit-contact-form.js
│   └── submit-career-form.js
├── css/                    # Stylesheets
├── js/                     # JavaScript files
│   ├── contact-form-handler.js
│   └── career-cv-upload.js
├── images/                 # Image assets
├── fonts/                  # Font files
├── videos/                 # Video files
├── docs/                   # 📚 Technical documentation
├── cursor/                 # Initial setup documentation
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots file
├── vercel.json             # Vercel configuration
└── package.json            # Project metadata
```

## 🔧 Before Deployment

**Update these files with your actual domain:**

1. **sitemap.xml**: Replace all instances of `[DOMAIN]` with your domain
2. **robots.txt**: Replace `[DOMAIN]` with your domain
3. **LLM.txt**: Replace `[DOMAIN]` with your domain

## 📧 Contact & Career Forms

✅ **Forms are fully integrated!**

### Features:
- Contact form (`/contact.html`) with email notifications
- Career form (`/carriere.html`) with CV upload support
- Email templates with Resend API
- Custom validation and error handling
- Success/error animations

### Environment Variables Required:

Add these in **Vercel Dashboard → Settings → Environment Variables**:

- `RESEND_API_KEY` - Your Resend API key (get from https://resend.com)
- `FROM_EMAIL` - Sender email (use `onboarding@resend.dev` or verified domain)

### Troubleshooting:

If forms don't work in production:
1. Check environment variables are set and have ✓ Production checked
2. Redeploy the site after adding/updating variables
3. See `docs/PRODUCTION_FORM_FIX.md` for detailed debugging

**Quick fix:** Use `onboarding@resend.dev` as `FROM_EMAIL` value.

## 🌐 SEO Files

- ✅ `sitemap.xml` - Search engine sitemap
- ✅ `robots.txt` - Search engine crawler instructions
- ✅ `LLM.txt` - AI training data declaration

## 📚 Documentation

Comprehensive technical documentation is available in the `/docs` folder:

- **[docs/README.md](./docs/README.md)** - Complete documentation index
- **[docs/PRODUCTION_FORM_FIX.md](./docs/PRODUCTION_FORM_FIX.md)** - Form troubleshooting guide
- **[docs/DEBUG_PRODUCTION_ISSUE.md](./docs/DEBUG_PRODUCTION_ISSUE.md)** - Production debugging
- **[cursor/(1)Initial-setup.md](./cursor/(1)Initial-setup.md)** - Initial setup guide

## 📝 License

MIT License

