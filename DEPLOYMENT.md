# BarSaas Deployment Guide

This guide walks you through deploying the BarSaas application.

## Architecture

- **Frontend**: Next.js → Deploy to Vercel
- **Backend**: Express.js → Deploy to Railway (or Render)
- **Database**: PostgreSQL → Supabase (already configured)
- **Auth**: Supabase Auth (already configured)

---

## Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub

### 1.2 Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository
4. **Important**: Set the root directory to `backend`

### 1.3 Configure Environment Variables
In Railway dashboard, add these environment variables:

```
DATABASE_URL=your_supabase_postgres_connection_string
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
```

To get your Supabase DATABASE_URL:
1. Go to your Supabase project dashboard
2. Settings → Database
3. Copy the "Connection string" (URI format)
4. Replace `[YOUR-PASSWORD]` with your database password

### 1.4 Configure Build Settings
Railway should auto-detect, but verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 1.5 Get Your Backend URL
After deployment, Railway will give you a URL like:
`https://your-backend-production.up.railway.app`

Save this URL for the frontend configuration.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2.2 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. **Important**: Set the root directory to `frontend`

### 2.3 Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_BASE=https://your-backend-production.up.railway.app
```

To get your Supabase keys:
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy "Project URL" and "anon public" key

### 2.4 Configure Build Settings
Vercel should auto-detect Next.js, but verify:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 2.5 Deploy
Click "Deploy" and wait for the build to complete.

---

## Step 3: Update CORS (Important!)

After you have your Vercel URL, go back to Railway and update:

```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

---

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. Try to sign in
3. Create a test application
4. Generate a PDF

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
- Don't include trailing slashes

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Make sure SSL is enabled (Supabase requires it)

### PDF Generation Fails
- Check Railway logs for errors
- Verify the `templates/` folder is included in deployment

### Auth Not Working
- Verify Supabase environment variables in Vercel
- Check that your Supabase project has email auth enabled

---

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to [render.com](https://render.com)
2. Create a new "Web Service"
3. Connect your GitHub repo
4. Set root directory to `backend`
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Add environment variables (same as Railway)

---

## Local Development

To run locally after deployment setup:

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

Make sure your local `.env` files have the correct values.

