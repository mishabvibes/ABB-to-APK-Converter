# Render Deployment Guide

## ✅ Ready to Deploy on Render

Your application is **ready to deploy on Render** without any code changes! The Dockerfile and render.yaml are already configured.

## Quick Deployment Steps

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository** and push:
   ```bash
   git remote add origin https://github.com/yourusername/abb-to-apk.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Sign up/Login** at [render.com](https://render.com)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file

3. **Configure Service** (if not using render.yaml):
   - **Name**: `aab-to-apk-converter`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Plan**: `Starter` (or higher for better performance)

4. **Environment Variables** (optional, already in render.yaml):
   - `NODE_ENV`: `production`
   - Render automatically sets `PORT` (Next.js will use it)

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - First build may take 5-10 minutes (downloads Java and builds app)

### Step 3: Verify Deployment

1. **Wait for build to complete** (check build logs)
2. **Visit your app URL** (e.g., `https://aab-to-apk-converter.onrender.com`)
3. **Test the conversion** with a sample AAB file

## What Works Automatically

✅ **Java Installation**: Dockerfile installs Java 17  
✅ **Port Configuration**: Next.js uses Render's PORT automatically  
✅ **File System**: Render provides persistent disk for uploads/tools  
✅ **Bundletool Download**: Downloads automatically on first conversion  
✅ **Health Checks**: Render monitors your app health  

## Important Notes

### Disk Space
- Render's Starter plan includes **512MB of disk space**
- Bundletool is ~10MB
- Each conversion creates temporary files
- Files are cleaned up after conversion
- For heavy usage, consider upgrading plan

### Timeout
- Render has a **15-minute timeout** for requests
- Our conversion uses `maxDuration: 300` (5 minutes)
- Should be sufficient for most AAB files
- Large files (>100MB) may take longer

### Memory
- Starter plan: **512MB RAM**
- Java + Node.js + conversion needs adequate memory
- If you encounter memory issues, upgrade to a higher plan

### First Conversion
- First conversion downloads bundletool (~10MB)
- May take 1-2 minutes longer
- Subsequent conversions are faster

## Troubleshooting

### Build Fails

**Error**: "Java installation failed"
- **Solution**: Check Dockerfile - Java installation should work
- **Check**: Build logs for specific error

**Error**: "Build timeout"
- **Solution**: Render builds can take time for first build
- **Wait**: First build with Java installation takes 5-10 minutes

### Runtime Issues

**Error**: "Java not found"
- **Solution**: Check that Dockerfile installed Java correctly
- **Verify**: Check service logs for Java version

**Error**: "Port already in use"
- **Solution**: Next.js automatically uses PORT from environment
- **Check**: Render sets PORT automatically, no action needed

**Error**: "Disk space full"
- **Solution**: Clean up old files, upgrade plan
- **Check**: Monitor disk usage in Render dashboard

### Conversion Issues

**Error**: "Conversion timeout"
- **Solution**: Large files may exceed timeout
- **Check**: File size (current limit: 200MB)
- **Consider**: Upgrading to higher plan for longer timeouts

**Error**: "Bundletool download fails"
- **Solution**: Check internet connectivity in container
- **Check**: Service logs for network errors

## Environment Variables

You can set these in Render dashboard (optional):

```bash
NODE_ENV=production
# PORT is automatically set by Render
```

## Monitoring

- **Logs**: View real-time logs in Render dashboard
- **Metrics**: Monitor CPU, memory, disk usage
- **Health Checks**: Render automatically checks `/` endpoint

## Scaling

For production use:
- **Upgrade Plan**: For more resources
- **Add Environment Variables**: For configuration
- **Set Up Monitoring**: For production alerts
- **Configure Custom Domain**: For your domain name

## Cost

- **Starter Plan**: $7/month (512MB RAM, 512MB disk)
- **Standard Plan**: $25/month (2GB RAM, 2GB disk) - Recommended for production
- **Free Tier**: Not available for Docker services

## Support

If you encounter issues:
1. Check Render service logs
2. Check build logs
3. Verify Dockerfile builds correctly locally
4. Test with a sample AAB file
5. Check Render status page

## Next Steps

1. ✅ Deploy to Render
2. ✅ Test with sample AAB file
3. ✅ Monitor resource usage
4. ✅ Set up custom domain (optional)
5. ✅ Configure monitoring (optional)

Your application is ready to deploy! 🚀

