# Deployment Guide

## Local Testing

### View Dashboard Locally

1. **Start the local server:**
   ```bash
   python -m http.server 8000
   ```

2. **Open in browser:**
   ```
   http://localhost:8000/
   ```
   or
   ```
   http://localhost:8000/dashboard.html
   ```

3. **Stop the server:** Press `Ctrl+C` in the terminal

### Alternative (without server):
You can also just double-click `index.html` or `dashboard.html` to open directly in your browser, though a local server is recommended for proper CSV loading.

---

## GitHub Pages Deployment

### Initial Setup

1. **Ensure you're on the main branch:**
   ```bash
   git branch
   ```

2. **Add and commit all files:**
   ```bash
   git add .
   git commit -m "Add SD Soil Health Coalition conference dashboard"
   git push origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your GitHub repository
   - Click **Settings** (top menu)
   - Click **Pages** (left sidebar)
   - Under "Source", select:
     - Branch: `main`
     - Folder: `/ (root)`
   - Click **Save**

4. **Wait 1-2 minutes**, then visit:
   ```
   https://YOUR-USERNAME.github.io/SDSHC-conference-dashboard/
   ```

### Updating the Dashboard

After making changes:

```bash
git add .
git commit -m "Update dashboard visualizations"
git push origin main
```

GitHub Pages will automatically rebuild (takes 1-2 minutes).

---

## File Structure (GitHub Pages Compatible)

```
SDSHC-conference-dashboard/
├── index.html                           ← Homepage (GitHub Pages default)
├── dashboard.html                       ← Same content as index.html
├── styles.css                          ← Dashboard styling
├── dashboard.js                        ← Data processing & visualizations
├── soil_health_survey_enhanced.csv     ← Survey data
├── README.md                           ← Documentation
└── DEPLOYMENT.md                       ← This file
```

**Note:** `index.html` and `dashboard.html` are identical. `index.html` is the standard GitHub Pages entry point.

---

## Custom Domain (Optional)

To use a custom domain like `dashboard.sdsoilhealth.org`:

1. **In GitHub Settings → Pages:**
   - Enter your custom domain
   - Check "Enforce HTTPS"

2. **Update DNS records with your domain provider:**
   ```
   Type: CNAME
   Name: dashboard (or subdomain of choice)
   Value: YOUR-USERNAME.github.io
   ```

3. **Wait for DNS propagation** (can take up to 24 hours)

---

## Troubleshooting

### Dashboard doesn't load data
- **Check browser console** (F12) for errors
- **Ensure CSV file path** is correct in `dashboard.js`
- **GitHub Pages limitation:** Make sure repository is public (or you have GitHub Pro for private repos)

### Charts not rendering
- **Check internet connection** - Chart.js loads from CDN
- **Verify browser supports ES6** - Use modern browser (Chrome, Firefox, Safari, Edge)

### 404 Error on GitHub Pages
- **Wait 2-3 minutes** after pushing - initial build takes time
- **Check repository name** matches URL
- **Verify `index.html` exists** in root directory

### CSV encoding issues
- **Ensure CSV is UTF-8 encoded**
- **Check for line break issues** in data (rows 137-138, 308-309 have issues)

---

## Performance Notes

- Dashboard loads ~65KB CSV file
- Chart.js libraries loaded from CDN (~200KB)
- **Total page load:** ~300-400KB
- **Load time:** < 2 seconds on typical connection

---

## Browser Compatibility

Tested and working on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Not recommended:
- ❌ Internet Explorer (not supported)

---

## Security & Privacy

- **No server-side processing** - 100% client-side JavaScript
- **No data tracking** - No analytics or cookies
- **No external API calls** - Except Chart.js CDN for visualizations
- **Data stays local** - CSV loaded directly from same domain

---

## Questions?

Contact SD Soil Health Coalition:
- Email: sdsoilhealth@gmail.com
- Phone: (605) 280-4190
- Website: https://www.sdsoilhealthcoalition.org
