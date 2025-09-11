# Netlify Client Deployment Guide

## 🚀 Deploy React Client to Netlify

---

## ✅ **Pre-Deployment Checklist**

Your client is **ready for Netlify deployment!**

- [x] ✅ Build working perfectly (689 modules, ~950KB total)
- [x] ✅ Code splitting optimized (vendor: 153KB, apollo: 159KB)
- [x] ✅ `netlify.toml` configuration created
- [x] ✅ Server deployed and running: `https://meeting-scheduler-apps-production.up.railway.app`
- [x] ✅ Health check passing: `{"status":"ok","service":"meeting-scheduler-server"}`

---

## 🌐 **Step 1: Netlify Account Setup**

### **Access Netlify Dashboard**

1. Go to [https://app.netlify.com/](https://app.netlify.com/)
2. **Sign up/Login** with your GitHub account
3. **Authorize Netlify** to access your repositories

---

## 🔗 **Step 2: Connect GitHub Repository**

### **Create New Site**

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select repository: **`meeting-schedule-apps`**
4. Configure build settings:

```yaml
Base directory: client
Build command: npm run build
Publish directory: client/dist
```

---

## ⚙️ **Step 3: Environment Variables**

### **Required Environment Variables**

Set these in **Netlify Dashboard → Site Settings → Environment Variables**:

| Variable           | Value                                                              | Description                   |
| ------------------ | ------------------------------------------------------------------ | ----------------------------- |
| `VITE_GRAPHQL_URI` | `https://meeting-scheduler-apps-production.up.railway.app/graphql` | Your Railway GraphQL endpoint |
| `VITE_APP_TITLE`   | `Meeting Scheduler`                                                | Application title             |
| `VITE_ENVIRONMENT` | `production`                                                       | Environment indicator         |

### **How to Add Environment Variables**

1. **Site Settings** → **Environment Variables**
2. Click **"Add Variable"**
3. Add each variable from the table above
4. **Save** and trigger a new deploy

---

## 🔧 **Step 4: Build Configuration**

### **Netlify Build Settings**

Your `netlify.toml` is already configured with:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "client"

[build.environment]
  NODE_VERSION = "22.14.0"
  NPM_VERSION = "10.0.0"

# SPA routing redirects
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers and caching
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    # ... other security headers
```

### **Build Output Analysis**

Your optimized build includes:

- **Total Size**: ~950KB (excellent for production)
- **Main Chunks**:
  - `vendor.js`: 153KB (React, router)
  - `apollo.js`: 159KB (GraphQL client)
  - `forms.js`: 79KB (react-hook-form, Zod)
  - `utils.js`: 71KB (Lodash)
  - `dates.js`: 44KB (date-fns)

---

## 🚀 **Step 5: Deploy Process**

### **Automatic Deployment**

1. **Push to GitHub** (main branch)
2. **Netlify auto-builds** using your `netlify.toml`
3. **Build process**:
   ```bash
   npm install
   npm run build  # (tsc -b && vite build)
   ```
4. **Deploy to CDN** globally

### **Manual Deployment (Alternative)**

If you prefer manual deployment:

```bash
# Build locally
cd client
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --dir=dist
netlify deploy --prod --dir=dist  # For production
```

---

## 🧪 **Step 6: Testing Deployment**

### **Post-Deployment Checklist**

After deployment, test these URLs:

```bash
# Your Netlify domain (example)
https://meeting-scheduler-app.netlify.app

# Test key routes
https://meeting-scheduler-app.netlify.app/dashboard
https://meeting-scheduler-app.netlify.app/calendar
https://meeting-scheduler-app.netlify.app/users
https://meeting-scheduler-app.netlify.app/events
https://meeting-scheduler-app.netlify.app/bookings
```

### **Functionality Tests**

- [ ] Home page loads correctly
- [ ] Authentication works (login/register)
- [ ] Calendar displays properly
- [ ] Can create/edit meetings
- [ ] Users management works
- [ ] Events system functional
- [ ] GraphQL connection to Railway server works
- [ ] All routes handle refresh correctly (no 404s)

---

## 🔍 **Step 7: Monitor & Optimize**

### **Netlify Analytics**

Enable in **Site Settings → Analytics**:

- Page views and unique visitors
- Bandwidth usage
- Core Web Vitals
- Error tracking

### **Performance Monitoring**

Your build is already optimized, but monitor:

- **Lighthouse scores** (should be 90+ across the board)
- **Bundle size** (currently ~950KB - excellent)
- **Load times** (should be <2s globally)

### **Build Performance**

```bash
# Run these locally to monitor
npm run build:analyze    # Bundle analysis
npm run bundle:size      # Size monitoring
npm run performance:lighthouse  # Performance audit
```

---

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

#### **Build Failures**

```bash
# Clear cache and retry
rm -rf node_modules dist
npm install
npm run build
```

#### **Environment Variables Not Loading**

- Ensure variables start with `VITE_`
- Check Netlify dashboard variables
- Redeploy after adding variables

#### **404 on Routes**

- Verify `netlify.toml` redirects are configured
- Check SPA redirect: `/* → /index.html (200)`

#### **GraphQL Connection Issues**

- Test Railway endpoint: `https://meeting-scheduler-apps-production.up.railway.app/graphql`
- Verify `VITE_GRAPHQL_URI` is correct
- Check browser network tab for CORS errors

#### **Build Timeout**

- Optimize `package-lock.json` (run `npm ci`)
- Consider excluding dev dependencies in build

---

## 🌍 **Step 8: Custom Domain (Optional)**

### **Add Custom Domain**

1. **Site Settings** → **Domain Management**
2. **Add Custom Domain**: `yourdomain.com`
3. **Configure DNS**:

   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app

   Type: A
   Name: @
   Value: 75.2.60.5
   ```

4. **SSL Certificate**: Auto-generated by Netlify

---

## 📊 **Expected Results**

### **Deployment Success Indicators**

- ✅ Build completes in <3 minutes
- ✅ All routes accessible (no 404s)
- ✅ GraphQL connection working
- ✅ Authentication flow functional
- ✅ Performance scores >90
- ✅ Global CDN distribution

### **Performance Targets**

- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: <1MB (currently ~950KB ✅)

---

## 🎯 **Next Steps After Deployment**

1. **Note your Netlify URL** (e.g., `https://your-app.netlify.app`)
2. **Update Railway `CLIENT_ORIGIN`** environment variable
3. **Test full application flow**
4. **Set up branch deployments** for staging
5. **Enable analytics and monitoring**

---

## 📋 **Quick Reference**

### **Key URLs**

- **Client**: `https://your-netlify-site.netlify.app`
- **Server**: `https://meeting-scheduler-apps-production.up.railway.app`
- **GraphQL**: `https://meeting-scheduler-apps-production.up.railway.app/graphql`

### **Environment Variables**

```env
VITE_GRAPHQL_URI=https://meeting-scheduler-apps-production.up.railway.app/graphql
VITE_APP_TITLE=Meeting Scheduler
VITE_ENVIRONMENT=production
```

### **Build Commands**

```bash
npm run build              # Production build
npm run build:analyze      # Bundle analysis
npm run preview            # Preview build locally
```

**🚀 Ready to deploy!** Your client is fully prepared for Netlify deployment with optimized builds, proper configuration, and connection to your live Railway server.
