# Environment Variables Configuration Guide

## 🔐 Production Environment Setup

### **Important Security Notes:**

- ❌ **Never commit .env files** to Git
- ❌ **Never upload .env files** to hosting platforms
- ✅ **Always use platform dashboards** to set environment variables
- ✅ **Generate new secrets** for production

---

## 🖥️ **Server Environment Variables (Railway/Render)**

### **Railway Configuration:**

1. Go to **Railway Dashboard** → Your Project → **Variables**
2. Add these environment variables:

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority&appName=<app-name>
JWT_SECRET=your-super-secure-jwt-secret-for-production
CLIENT_ORIGIN=https://your-app-name.netlify.app
```

### **Environment Variable Details:**

| Variable        | Value                          | Description                                  |
| --------------- | ------------------------------ | -------------------------------------------- |
| `NODE_ENV`      | `production`                   | Enables production optimizations             |
| `PORT`          | `4000`                         | Server port (Railway auto-assigns if needed) |
| `MONGO_URI`     | `mongodb+srv://...`            | MongoDB Atlas connection string              |
| `JWT_SECRET`    | `new-secure-secret`            | **⚠️ Generate new secret for production**    |
| `CLIENT_ORIGIN` | `https://your-app.netlify.app` | Your Netlify domain for CORS                 |

---

## 🌐 **Client Environment Variables (Netlify)**

### **Netlify Configuration:**

1. Go to **Netlify Dashboard** → Site Settings → **Environment Variables**
2. Add these variables:

```env
VITE_GRAPHQL_URI=https://your-server-name.railway.app/graphql
VITE_APP_TITLE=Meeting Scheduler
VITE_ENVIRONMENT=production
```

### **Environment Variable Details:**

| Variable           | Value                                | Description                           |
| ------------------ | ------------------------------------ | ------------------------------------- |
| `VITE_GRAPHQL_URI` | `https://server.railway.app/graphql` | Your deployed server GraphQL endpoint |
| `VITE_APP_TITLE`   | `Meeting Scheduler`                  | Application title                     |
| `VITE_ENVIRONMENT` | `production`                         | Environment indicator                 |

---

## 🔑 **Security Best Practices**

### **1. Generate New JWT Secret:**

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **2. Update MongoDB Password:**

```bash
# In MongoDB Atlas:
# 1. Go to Database Access
# 2. Edit User → Change Password
# 3. Update MONGO_URI with new password
```

### **3. Environment File Template:**

**server/.env.production** (for reference only - don't deploy):

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://<username>:NEW_PASSWORD@cluster.mongodb.net/dbname
JWT_SECRET=new_generated_secret_64_chars_long
CLIENT_ORIGIN=https://your-netlify-domain.netlify.app
```

**client/.env.production** (for reference only - don't deploy):

```env
VITE_GRAPHQL_URI=https://your-railway-app.railway.app/graphql
VITE_APP_TITLE=Meeting Scheduler
VITE_ENVIRONMENT=production
```

---

## 🚀 **Deployment Flow**

### **Step 1: Deploy Server First**

```bash
# 1. Deploy to Railway
cd server
railway init
railway up

# 2. Copy the Railway URL (e.g., https://app-name.railway.app)
```

### **Step 2: Configure Server Environment**

1. Railway Dashboard → Variables → Add all server variables
2. Update `CLIENT_ORIGIN` with your future Netlify domain

### **Step 3: Deploy Client**

1. Netlify Dashboard → New Site → Connect Git
2. Build Settings:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`

### **Step 4: Configure Client Environment**

1. Netlify Dashboard → Environment Variables
2. Set `VITE_GRAPHQL_URI` to your Railway GraphQL endpoint
3. Trigger new build in Netlify

---

## 🔄 **Testing Environment Configuration**

### **Test Server Environment:**

```bash
# After Railway deployment, test your GraphQL endpoint:
curl https://your-server.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
```

### **Test Client Environment:**

```bash
# Check if environment variables are loaded in browser console:
# Open your Netlify site → DevTools → Console
console.log('GraphQL URI:', import.meta.env.VITE_GRAPHQL_URI);
```

---

## ⚠️ **Common Issues & Solutions**

### **CORS Errors:**

- Ensure `CLIENT_ORIGIN` matches your Netlify domain exactly
- Check Railway logs for CORS errors

### **GraphQL Connection Failed:**

- Verify `VITE_GRAPHQL_URI` points to correct Railway endpoint
- Test Railway GraphQL endpoint directly

### **Environment Variables Not Loading:**

- Client variables must start with `VITE_`
- Restart Netlify build after adding variables
- Check Netlify build logs for errors

---

## 🔒 **Security Checklist**

- [ ] Generated new JWT secret for production
- [ ] Updated MongoDB password
- [ ] Set NODE_ENV=production
- [ ] Configured CLIENT_ORIGIN with exact Netlify domain
- [ ] Verified .env files are in .gitignore
- [ ] Tested all environment variables are working
- [ ] No sensitive data in Git repository

---

## 📋 **Quick Reference**

### **Railway Dashboard URLs:**

- Variables: `https://railway.app/project/YOUR_PROJECT/settings`
- Logs: `https://railway.app/project/YOUR_PROJECT/deployments`

### **Netlify Dashboard URLs:**

- Environment Variables: `https://app.netlify.com/sites/YOUR_SITE/settings/env`
- Build Settings: `https://app.netlify.com/sites/YOUR_SITE/settings/build`

**Next Steps:** Configure your environment variables in Railway and Netlify dashboards using the values above.
