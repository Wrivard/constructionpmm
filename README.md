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
├── entreprise.html         # About/Company page
├── expertise.html          # Services/Expertise page
├── projets.html            # Projects listing
├── projets/                # Individual project pages
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── images/                 # Image assets
├── fonts/                  # Font files
├── videos/                 # Video files
├── sitemap.xml             # SEO sitemap (update [DOMAIN])
├── robots.txt              # SEO robots file (update [DOMAIN])
├── vercel.json             # Vercel configuration
└── package.json            # Project metadata
```

## 🔧 Before Deployment

**Update these files with your actual domain:**

1. **sitemap.xml**: Replace all instances of `[DOMAIN]` with your domain
2. **robots.txt**: Replace `[DOMAIN]` with your domain
3. **LLM.txt**: Replace `[DOMAIN]` with your domain

## 📧 Contact Form Integration

⚠️ **Note**: Contact form integration is not yet configured. To add email functionality:

1. Set up Resend API account
2. Create `api/submit-form.js` serverless function
3. Update `contact.html` with form handling JavaScript
4. Add environment variables in Vercel:
   - `RESEND_API_KEY`
   - `FROM_EMAIL`

See `cursor/(1)Initial-setup.md` for complete integration instructions.

## 🌐 SEO Files

- ✅ `sitemap.xml` - Search engine sitemap
- ✅ `robots.txt` - Search engine crawler instructions
- ✅ `LLM.txt` - AI training data declaration

## 📝 License

MIT License

