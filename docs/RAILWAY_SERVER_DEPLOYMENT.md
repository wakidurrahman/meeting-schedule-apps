# Railway Server Deployment Guide

## 🚀 Deploy Node.js GraphQL Server to Railway.com

---

## 📋 **30-Day Plan: Railway Server Deployment**

### **✅ Prerequisites Checklist**

- [x] Server code ready in `/server` folder
- [x] `railway.json` configuration file created
- [x] `package.json` with proper start script
- [x] Health check endpoint (`/healthz`) implemented
- [x] Environment variables identified

---

## 🔧 **Step 1: Railway CLI Setup**

### **Install Railway CLI**

```bash
# Install globally
npm install -g @railway/cli

# Verify installation
railway --version
```

### **Login to Railway**

```bash
# Login with GitHub (recommended)
railway login

# Follow the browser authentication flow
```

---

## 🚀 **Step 2: Deploy Your Server**

### **Navigate to Server Directory**

```bash
cd /Users/wakidur.rahman/projects/meeting-schedule-apps/server
```

### **Initialize Railway Project**

```bash
# Initialize Railway in your server folder
railway init

# Choose: "Create a new project"
# Project name: "meeting-scheduler-server" (or your preferred name)
```

### **Deploy to Railway**

```bash
# Deploy your server
railway up

# Railway will:
# 1. Detect Node.js project
# 2. Install dependencies (npm install)
# 3. Use your railway.json configuration
# 4. Deploy and provide a URL
```

### **Expected Output:**

```
✅ Deployment successful
🌐 Your app is live at: https://meeting-scheduler-server-production.railway.app
📱 GraphQL endpoint: https://meeting-scheduler-server-production.railway.app/graphql
```

---

## ⚙️ **Step 3: Configure Environment Variables**

### **Access Railway Dashboard**

1. Go to [railway.app](https://railway.app)
2. Sign in and select your project
3. Click **Variables** tab

### **Add Production Environment Variables**

Set these **exact variables** in Railway Dashboard:

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://wakidur:YOUR_NEW_PASSWORD@reactjs-with-qraphql.ax8jc2o.mongodb.net/?retryWrites=true&w=majority&appName=reactjs-with-qraphql
JWT_SECRET=5f0cfc47fe565578973484c642a92600271af57594f12f2067c6fe401e9da12ace754a7271d7286f379d2cf2e21ab7d3092c5ac531b0c7e0e3c325832f828267
CLIENT_ORIGIN=https://your-future-netlify-app.netlify.app
```

### **Environment Variables Breakdown:**

| Variable        | Value                         | Purpose                                      |
| --------------- | ----------------------------- | -------------------------------------------- |
| `NODE_ENV`      | `production`                  | Enables production optimizations             |
| `PORT`          | `4000`                        | Server port (Railway auto-assigns if needed) |
| `MONGO_URI`     | Your MongoDB Atlas connection | Database connection                          |
| `JWT_SECRET`    | Generated secure secret       | JWT token signing                            |
| `CLIENT_ORIGIN` | Your future Netlify domain    | CORS configuration                           |

---

## 🔐 **Step 4: MongoDB Atlas Setup**

### **Update MongoDB Password**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. **Database Access** → **Edit User**
3. **Change Password** → Generate new secure password
4. **Update Railway MONGO_URI** with new password

### **Update Connection String**

```env
# Old MONGO_URI (from your .env)
mongodb+srv://wakidur:graphql20250808@reactjs-with-qraphql.ax8jc2o.mongodb.net/...

# New MONGO_URI (update password)
mongodb+srv://wakidur:NEW_SECURE_PASSWORD@reactjs-with-qraphql.ax8jc2o.mongodb.net/?retryWrites=true&w=majority&appName=reactjs-with-qraphql
```

---

## 🧪 **Step 5: Test Your Deployment**

### **Test Health Check**

```bash
curl https://your-app.railway.app/healthz
# Expected: {"status":"ok","timestamp":"2025-01-11T..."}
```

### **Test GraphQL Endpoint**

```bash
curl -X POST https://your-app.railway.app/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'
# Expected: {"data":{"__typename":"Query"}}
```

### **Test GraphQL Playground (if enabled)**

Visit: `https://your-app.railway.app/graphql` in browser

---

## 🔄 **Step 6: Configure Auto-Deployment**

### **Connect GitHub Repository**

1. Railway Dashboard → **Settings** → **Source**
2. **Connect GitHub Repository**
3. Select: `meeting-schedule-apps`
4. **Root Directory**: `/server`
5. **Auto-Deploy**: Enable

### **Deployment Settings**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/healthz"
  }
}
```

---

## 📊 **Step 7: Monitor Your Deployment**

### **Railway Dashboard Features**

- **📈 Metrics**: CPU, Memory, Network usage
- **📜 Logs**: Real-time server logs
- **🔧 Variables**: Environment variable management
- **💰 Usage**: Track your 30-day plan usage

### **Important URLs**

- **Project Dashboard**: `https://railway.app/project/YOUR_PROJECT_ID`
- **Server Logs**: `https://railway.app/project/YOUR_PROJECT_ID/service/YOUR_SERVICE_ID`
- **Metrics**: `https://railway.app/project/YOUR_PROJECT_ID/metrics`

---

## 💰 **Railway 30-Day Plan Management**

### **Monitor Usage**

- **Compute Time**: Track execution hours
- **Bandwidth**: Monitor data transfer
- **Build Time**: Watch build minutes

### **Cost Optimization Tips**

- ✅ Use `NODE_ENV=production` (smaller builds)
- ✅ Enable health checks (prevents unnecessary restarts)
- ✅ Optimize database queries (reduce compute time)
- ✅ Use Railway's built-in caching

---

## 🔧 **Troubleshooting Common Issues**

### **Deployment Failures**

```bash
# Check Railway logs
railway logs

# Common fixes:
railway redeploy
```

### **Environment Variables Not Working**

```bash
# List current variables
railway variables

# Add missing variable
railway variables set NODE_ENV=production
```

### **Database Connection Issues**

- ✅ Verify MongoDB Atlas IP allowlist (allow 0.0.0.0/0 for Railway)
- ✅ Check MONGO_URI format
- ✅ Ensure MongoDB user has proper permissions

### **CORS Errors**

- ✅ Set `CLIENT_ORIGIN` to exact Netlify domain
- ✅ Check Railway logs for CORS-related errors

---

## 🎯 **Next Steps After Server Deployment**

### **1. Note Your Railway URL**

```
Your GraphQL Server: https://your-app-name.railway.app/graphql
```

### **2. Update Client Configuration**

Use this URL in your client's environment variables:

```env
VITE_GRAPHQL_URI=https://your-app-name.railway.app/graphql
```

### **3. Deploy Client to Netlify**

Now proceed with Netlify client deployment using the Railway GraphQL endpoint.

---

## 📋 **Quick Commands Reference**

```bash
# Deploy/Update
railway up

# View logs
railway logs

# Set environment variable
railway variables set KEY=value

# Open project in browser
railway open

# Check status
railway status

# Redeploy
railway redeploy
```

---

## ✅ **Success Criteria**

Your server deployment is successful when:

- [ ] Health check returns `{"status":"ok"}`
- [ ] GraphQL endpoint responds to queries
- [ ] Environment variables are properly set
- [ ] Database connection is working
- [ ] Auto-deployment from GitHub is configured
- [ ] CORS is properly configured for future client

**Your server will be available at**: `https://your-project-name.railway.app`

---

**Ready to deploy?** Run the commands above and your GraphQL server will be live on Railway in minutes! 🚀
