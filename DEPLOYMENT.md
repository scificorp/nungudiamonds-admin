# AWS Amplify Deployment Guide

## Prerequisites
- AWS Account with Amplify access
- GitHub repository with admin panel code
- Production API backend running at `https://api.nungudiamonds.co.za`

## Deployment Steps

### 1. Connect Repository to AWS Amplify

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Choose GitHub as source
4. Select your repository and branch (main/master)
5. Configure build settings

### 2. Build Settings

The `amplify.yml` file is already configured with:
- Node.js environment
- npm ci for dependency installation
- npm run build for building the app
- Proper caching for node_modules and .next

### 3. Environment Variables

In the Amplify Console, add these environment variables:

```
NEXT_PUBLIC_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2/
NEXT_PUBLIC_REST_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2
NEXT_PUBLIC_IMG_ENDPOINT=https://d2yhu6nvl7lle6.cloudfront.net
NEXT_PUBLIC_AUTHORIZATION_TOKEN=PUBLIC_AUTHORIZATION_TOKEN
CRYPTO_JS_KEY=d54g32sgrdd5r84gs134g8ees13ds56g
CRYPTO_JS_IV=f4g536g4s3d3r8r64s2sa35jj8ki8ufg
```

### 4. Build Configuration

The build will:
- Install dependencies with `npm ci`
- Build the Next.js application
- Output to `.next` directory
- Cache node_modules and build cache for faster subsequent builds

### 5. Domain Configuration (Optional)

1. In Amplify Console, go to "Domain management"
2. Add your custom domain
3. Configure DNS settings as instructed
4. SSL certificate will be automatically provisioned

### 6. Deployment

1. Commit and push your changes to the connected branch
2. Amplify will automatically trigger a build
3. Monitor the build process in the Amplify Console
4. Once complete, your admin panel will be live

## Build Optimizations

- **Standalone output**: Configured for better performance
- **Image optimization**: Disabled for compatibility with CDN
- **Caching**: Enabled for faster builds
- **ESLint**: Configured to not block builds

## Troubleshooting

### Build Failures
- Check environment variables are set correctly
- Ensure API endpoints are accessible
- Review build logs in Amplify Console

### Runtime Issues
- Verify API endpoints are correct
- Check CORS settings on backend
- Ensure CDN URLs are accessible

## Security Notes

- Environment variables containing sensitive data should be managed through Amplify Console
- The `.env.production` file is excluded from git for security
- API tokens should be rotated regularly

## Monitoring

- Use Amplify Console for build and deployment monitoring
- Set up CloudWatch for application monitoring
- Configure alerts for build failures
