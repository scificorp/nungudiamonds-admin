# CloudFront CORS Configuration Guide

**Document Version:** 1.0  
**Date:** January 18, 2026  
**Purpose:** Configure CloudFront CDN to properly handle CORS requests for file uploads

---

## Overview

This document provides instructions for configuring CORS (Cross-Origin Resource Sharing) headers on the CloudFront CDN that serves the Nungu Diamonds admin panel. Proper CORS configuration ensures file upload components can fetch existing images without complex workarounds.

---

## Current Issue

The file upload component implements multiple fetch strategies as a workaround for CORS issues:

```typescript
// Current workaround in singleFile-upload/index.tsx
try {
  // First attempt: Standard CORS request
  response = await fetch(fullUrl, { mode: 'cors' });
} catch (corsError) {
  // Second attempt: No-cors mode fallback
  response = await fetch(fullUrl, { mode: 'no-cors' });
}
```

This workaround:
- Adds unnecessary complexity
- May cause inconsistent behavior
- Impacts performance
- Makes debugging harder

---

## Solution: Configure CORS on CloudFront

### Option 1: CloudFront Origin Response Headers (Recommended)

#### Step 1: Access AWS Console

1. Navigate to AWS Console → CloudFront
2. Find the distribution for `d2yhu6nvl7lle6.cloudfront.net`
3. Click on the distribution ID

#### Step 2: Create Origin Response Policy

1. In the left sidebar, click **"Policies"**
2. Click **"Create policy"**
3. Configure:
   ```
   Name: CORS-Policy
   Type: Origin response
   ```

4. **Add CORS Headers:**
   ```
   Headers:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Methods: GET, OPTIONS
   - Access-Control-Allow-Headers: *
   - Access-Control-Max-Age: 86400
   ```

5. Click **"Create"**

#### Step 3: Attach Policy to Behavior

1. Go to **"Behaviors"** tab
2. Select the default behavior (`/*`)
3. Click **"Edit"**
4. Find **"Response headers policy"**
5. Select `CORS-Policy` from the dropdown
6. Click **"Save changes"**

7. CloudFront will deploy the changes (typically 1-5 minutes)

### Option 2: Lambda@Edge Function

If you need more control, create a Lambda@Edge function:

```javascript
// lambda-edge-cors.js
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  
  // Add CORS headers to all responses
  response.headers['access-control-allow-origin'] = [{
    key: 'Access-Control-Allow-Origin',
    value: '*'
  }];
  
  response.headers['access-control-allow-methods'] = [{
    key: 'Access-Control-Allow-Methods',
    value: 'GET, OPTIONS'
  }];
  
  response.headers['access-control-allow-headers'] = [{
    key: 'Access-Control-Allow-Headers',
    value: '*'
  }];
  
  response.headers['access-control-max-age'] = [{
    key: 'Access-Control-Max-Age',
    value: '86400'
  }];
  
  return response;
};
```

**Deploy Lambda@Edge:**
1. Create Lambda function in us-east-1
2. Add CloudFront as trigger
3. Deploy to all edge locations

### Option 3: S3 Bucket CORS Configuration

If using S3 as the origin, configure CORS on the bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 86400
  }
]
```

**Steps:**
1. Go to S3 Console → Select bucket
2. Click **"Permissions"** tab
3. Find **"Cross-origin resource sharing (CORS)"**
4. Edit and add CORS configuration
5. Save changes

---

## Simplified File Upload Component

After CORS is configured, the file upload component can be simplified:

```typescript
// Simplified fetch (after CORS is configured)
const loadExistingImage = async (imageUrl: string) => {
  const response = await fetch(imageUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }
  
  const blob = await response.blob();
  // Create file from blob...
};
```

---

## Verification

### Test CORS Configuration

1. **Test with curl:**
   ```bash
   curl -I -X OPTIONS https://d2yhu6nvl7lle6.cloudfront.net/images/banners/sample.jpg
   ```

2. **Check response headers:**
   ```
   HTTP/2 200
   access-control-allow-origin: *
   access-control-allow-methods: GET, OPTIONS
   access-control-allow-headers: *
   access-control-max-age: 86400
   ```

3. **Test in browser:**
   - Open browser DevTools → Network tab
   - Reload page with images
   - Verify no CORS errors in console

### Test File Upload

1. Navigate to file upload in admin panel
2. Try to load existing image
3. Verify image displays correctly
4. Check console for any errors

---

## Troubleshooting

### CORS Errors Persist

**Problem:** Browser still shows CORS errors after configuration.

**Solutions:**
1. **Clear browser cache** - Old responses may be cached
2. **Wait for propagation** - CloudFront changes take 1-5 minutes
3. **Verify configuration** - Check that policy is attached to correct behavior
4. **Check origin configuration** - Ensure S3 bucket allows CORS if using S3 origin

### Mixed Content Errors

**Problem:** Page loaded over HTTPS but requests HTTP resources.

**Solution:** Ensure all resources use HTTPS:
```typescript
// Use HTTPS URLs
const imageUrl = `https://${IMG_ENDPOINT}/${imagePath}`;
```

### 403 Forbidden Errors

**Problem:** Requests fail with 403 status.

**Solutions:**
1. Verify S3 bucket permissions allow CloudFront IP ranges
2. Check that objects are publicly readable
3. Ensure origin access identity (OAI) is configured correctly

---

## Security Considerations

### Allow Origin Recommendations

| Setting | Recommendation | Use Case |
|---------|---------------|----------|
| `*` | ❌ Not Recommended | Only for development/testing |
| Specific domain | ✅ Recommended | Production with known domains |
| Multiple domains | ✅ Recommended | Multi-site deployments |

**Production Configuration:**
```json
{
  "AllowedOrigins": [
    "https://admin.nungudiamonds.co.za",
    "https://www.nungudiamonds.co.za"
  ]
}
```

### Rate Limiting

Consider adding rate limiting to prevent abuse:
- CloudFront Lambda@Edge can implement rate limiting
- AWS WAF can be attached to CloudFront
- Monitor for unusual access patterns

---

## Post-Implementation Cleanup

After CORS is properly configured:

1. **Simplify File Upload Component**
   - Remove no-cors fallback code
   - Remove multiple fetch strategies
   - Add proper error handling

2. **Update Documentation**
   - Remove CORS workaround notes
   - Document expected behavior
   - Update troubleshooting guides

3. **Monitor Logs**
   - Check CloudWatch logs for errors
   - Monitor for failed requests
   - Review performance impact

---

## Rollback Procedure

If CORS configuration causes issues:

1. **Remove Policy from Behavior:**
   - Go to CloudFront → Behaviors
   - Edit default behavior
   - Remove CORS policy
   - Save and deploy

2. **Remove Lambda@Edge (if used):**
   - Go to Lambda Console
   - Delete or disable the function
   - CloudFront will revert to previous behavior

3. **Restore S3 CORS (if modified):**
   - Go to S3 bucket → Permissions
   - Remove or revert CORS configuration

4. **Verify Application:**
   - Confirm application works correctly
   - Re-enable file upload workarounds if needed
   - Document the incident

---

## Related Documentation

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html)
- [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Next Review:** July 18, 2026 (Semi-annual security review)
