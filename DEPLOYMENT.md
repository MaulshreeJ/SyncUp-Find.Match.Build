# Deployment Guide

This guide covers deploying SyncUp to various cloud platforms.

## 🚀 Quick Deploy Options

### Option 1: All-in-One (Recommended for Demo)
Deploy everything on Railway or Render for simplicity.

### Option 2: Distributed (Recommended for Production)
- Frontend: Vercel/Netlify
- Backend: Railway/Heroku
- Python AI Service: Railway/Render
- Database: MongoDB Atlas

## 📋 Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database seeded with initial data
- [ ] API keys obtained (Gemini AI)
- [ ] Build process tested locally
- [ ] CORS origins updated for production URLs

## 🌐 Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Push to GitHub first
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

3. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-url.railway.app
   ```

## 🖥️ Backend Deployment (Railway)

1. **Prepare for Deployment**
   ```bash
   cd backend
   # Ensure package.json has correct start script
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Select the `backend` folder
   - Add environment variables

3. **Environment Variables**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/syncup
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   PYTHON_SERVICE_URL=https://your-python-service.railway.app
   NODE_ENV=production
   ```

## 🐍 Python AI Service Deployment (Railway)

1. **Prepare Python Service**
   ```bash
   cd python_agent_service
   # Ensure requirements.txt is up to date
   pip freeze > requirements.txt
   ```

2. **Deploy on Railway**
   - Create another Railway service
   - Select `python_agent_service` folder
   - Railway will auto-detect Python

3. **Environment Variables**
   ```env
   GOOGLE_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-2.5-flash
   NODE_API_URL=https://your-backend-url.railway.app
   PORT=8000
   ```

## 🗄️ Database Setup (MongoDB Atlas)

1. **Create Cluster**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create free cluster
   - Set up database user
   - Whitelist IP addresses (0.0.0.0/0 for development)

2. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/syncup?retryWrites=true&w=majority
   ```

3. **Seed Database**
   ```bash
   # Run locally with production MongoDB URI
   cd backend
   MONGO_URI="your-atlas-connection-string" node scripts/seedHackathons.js
   MONGO_URI="your-atlas-connection-string" node scripts/seedResources.js
   MONGO_URI="your-atlas-connection-string" node scripts/seedAdmin.js
   ```

## 🔧 Production Configuration

### Update CORS Origins
In `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174", 
    "https://your-frontend-domain.vercel.app"
  ],
  credentials: true,
}));
```

### Update Socket.IO Origins
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app"
    ],
    credentials: true,
  },
});
```

## 🔐 Environment Variables Summary

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.railway.app
```

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-key
PYTHON_SERVICE_URL=https://your-python-service.railway.app
NODE_ENV=production
```

### Python Service (.env)
```env
GOOGLE_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash
NODE_API_URL=https://your-backend-url.railway.app
PORT=8000
```

## 🧪 Testing Deployment

1. **Frontend Tests**
   - [ ] Login/Register works
   - [ ] Pages load correctly
   - [ ] API calls succeed

2. **Backend Tests**
   - [ ] API endpoints respond
   - [ ] Database connections work
   - [ ] Authentication functions

3. **AI Service Tests**
   - [ ] AI Coach responds
   - [ ] Team matching works
   - [ ] Resume analysis functions

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origins in backend
   - Check frontend API URL

2. **Database Connection**
   - Verify MongoDB URI
   - Check IP whitelist
   - Confirm credentials

3. **AI Service Not Responding**
   - Check Python service logs
   - Verify Gemini API key
   - Confirm service URL

4. **Build Failures**
   - Check Node.js version
   - Verify dependencies
   - Review build logs

### Logs and Debugging

```bash
# Railway logs
railway logs

# Vercel logs
vercel logs

# Local debugging
npm run dev
cd backend && npm run dev
cd python_agent_service && python main.py
```

## 📈 Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Optimize images
   - Use CDN for assets

2. **Backend**
   - Enable MongoDB indexing
   - Implement caching
   - Use connection pooling

3. **Database**
   - Create indexes for queries
   - Monitor performance
   - Set up backups

## 🔄 CI/CD Pipeline (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway deploy
```

## 📞 Support

If you encounter issues during deployment:
1. Check the logs first
2. Verify environment variables
3. Test locally with production settings
4. Consult platform documentation

---

Happy deploying! 🚀