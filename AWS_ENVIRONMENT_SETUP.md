# AWS Environment Variables Setup Guide

**Document Version:** 1.0  
**Date:** January 18, 2026  
**Purpose:** Guide for configuring secure environment variables in AWS Amplify

---

## Overview

This document provides step-by-step instructions for configuring environment variables in AWS Amplify for the Nungu Diamonds Admin Panel. These environment variables replace hard-coded sensitive values in the application.

**⚠️ Security Critical:** This process must be completed to remove hard-coded crypto keys from the codebase.

---

## Required Environment Variables

### 1. API Configuration

| Variable Name | Description | Required | Sensitive |
|--------------|-------------|----------|-----------|
| `NEXT_PUBLIC_API_ENDPOINT` | Backend API base URL | Yes | No |
| `NEXT_PUBLIC_REST_API_ENDPOINT` | REST API endpoint | Yes | No |
| `NEXT_PUBLIC_IMG_ENDPOINT` | Image CDN URL | Yes | No |
| `NEXT_PUBLIC_AUTHORIZATION_TOKEN` | Public authorization token | Yes | **Yes** |

### 2. Security Configuration

| Variable Name | Description | Required | Sensitive |
|--------------|-------------|----------|-----------|
| `CRYPTO_JS_KEY` | Encryption key for sensitive data | Yes | **Yes** |
| `CRYPTO_JS_IV` | Encryption IV for sensitive data | Yes | **Yes** |
| `NEXT_PUBLIC_DISABLE_ADMIN_LOGIN` | Disable login for development | No | No |

### 3. Display Configuration

| Variable Name | Description | Default | Required |
|--------------|-------------|---------|----------|
| `NEXT_PUBLIC_PRIMARY_COLOR_MAIN` | Primary brand color | #333333 | No |
| `NEXT_PUBLIC_WHITE_COLOR` | White color code | #FFF | No |
| `NEXT_PUBLIC_BLACK_COLOR` | Black color code | #000 | No |

---

## Step-by-Step Setup Instructions

### Step 1: Access AWS Amplify Console

1. **Log in to AWS Console**
   - Navigate to: https://console.aws.amazon.com/
   - Sign in with your AWS account credentials

2. **Navigate to Amplify**
   - Search for "Amplify" in the services search bar
   - Click on "AWS Amplify"

3. **Select Your Application**
   - Find and select the `tcctechadmin-nungudiamonds` application
   - Click on the application to view details

### Step 2: Generate Secure Keys

**⚠️ Important:** If you have existing encrypted data, you MUST decrypt it first before generating new keys.

#### Generate CRYPTO_JS_KEY (32 bytes = 256 bits)

```bash
# Using OpenSSL (Linux/macOS/WSL)
openssl rand -hex 32

# Example output:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### Generate CRYPTO_JS_IV (16 bytes = 128 bits)

```bash
# Using OpenSSL (Linux/macOS/WSL)
openssl rand -hex 16

# Example output:
# a1b2c3d4e5f6g7h8
```

#### Generate Authorization Token

```bash
# Generate a secure random string
openssl rand -hex 32

# Example output:
# publicAuthToken123456789abcdef123456789abcdef12345678
```

### Step 3: Configure Environment Variables in Amplify

1. **Navigate to Environment Variables**
   - In the left sidebar, click on **"Environment variables"**
   - Or go to: **Build settings** → **Environment variables**

2. **Add Variables**

Click **"Manage variables"** and add the following:

#### API Variables
```
NEXT_PUBLIC_API_ENDPOINT = https://api.nungudiamonds.co.za/api/v2/
NEXT_PUBLIC_REST_API_ENDPOINT = https://api.nungudiamonds.co.za/api/v2
NEXT_PUBLIC_IMG_ENDPOINT = https://d2yhu6nvl7lle6.cloudfront.net
NEXT_PUBLIC_AUTHORIZATION_TOKEN = [Generated authorization token from Step 2]
```

#### Security Variables (NEW)
```
CRYPTO_JS_KEY = [Generated key from Step 2]
CRYPTO_JS_IV = [Generated IV from Step 2]
```

#### Optional Variables
```
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN = false
NEXT_PUBLIC_PRIMARY_COLOR_MAIN = #333333
NEXT_PUBLIC_WHITE_COLOR = #FFF
NEXT_PUBLIC_BLACK_COLOR = #000
```

3. **Save Changes**
   - Click **"Save"** to apply the environment variables
   - Amplify will automatically trigger a new build with the updated variables

### Step 4: Update Application Code

After setting up environment variables in AWS Amplify, update `src/AppConfig.ts`:

```typescript
// src/AppConfig.ts

// BEFORE (with hard-coded fallbacks)
export const CRYPTO_JS_KEY = process.env.CRYPTO_JS_KEY || 'd54g32sgrdd5r84gs134g8ees13ds56g'
export const CRYPTO_JS_IV = process.env.CRYPTO_JS_IV || 'f4g536g4s3d3r8r64s2sa35jj8ki8ufg'

// AFTER (without fallbacks - must be set in environment)
export const CRYPTO_JS_KEY = process.env.CRYPTO_JS_KEY || ''
export const CRYPTO_JS_IV = process.env.CRYPTO_JS_IV || ''

// Add validation
if (!CRYPTO_JS_KEY || !CRYPTO_JS_IV) {
  throw new Error('CRYPTO_JS_KEY and CRYPTO_JS_IV must be set in environment variables')
}
```

### Step 5: Trigger Build and Deploy

1. **Amplify will automatically:**
   - Detect environment variable changes
   - Trigger a new build
   - Deploy the updated application

2. **Manual Build (if needed):**
   - Click **"Build"** in the left sidebar
   - Click **"Build project"** to manually trigger a build

3. **Verify Deployment:**
   - Check the build logs for any errors
   - Visit the admin panel URL to verify it loads correctly
   - Test login functionality
   - Verify encryption/decryption works

---

## Verification Checklist

After completing the setup, verify the following:

- [ ] Application loads without errors
- [ ] Login functionality works correctly
- [ ] API calls succeed
- [ ] Encrypted data can be decrypted
- [ ] No console warnings about missing environment variables
- [ ] Hard-coded keys removed from codebase

---

## Troubleshooting

### Build Fails with Missing Variables

**Problem:** Build fails because environment variables are not set.

**Solution:**
1. Verify all required variables are set in Amplify Console
2. Check for typos in variable names
3. Ensure there are no extra spaces or quotes
4. Trigger a new build after saving variables

### Login Not Working

**Problem:** Users cannot log in after migration.

**Solution:**
1. Verify `NEXT_PUBLIC_AUTHORIZATION_TOKEN` is correct
2. Check that the token matches what the backend expects
3. Clear browser cache and localStorage
4. Check browser console for authentication errors

### Encryption Issues

**Problem:** Previously encrypted data cannot be decrypted.

**Solution:**
1. **Before generating new keys**, decrypt all data using old keys
2. Generate new keys and store them securely
3. Re-encrypt all data with new keys
4. Update environment variables in Amplify
5. Deploy and verify

---

## Security Best Practices

### 1. Key Rotation Schedule
- Rotate crypto keys every 90 days
- Document all key rotations
- Test key rotation procedures quarterly

### 2. Access Control
- Limit who can access AWS Amplify Console
- Use IAM roles with minimum required permissions
- Enable AWS CloudTrail for audit logging

### 3. Monitoring
- Set up alerts for environment variable changes
- Monitor for unauthorized access attempts
- Review Amplify build logs regularly

### 4. Backup and Recovery
- Document key generation process
- Store keys in a secure password manager
- Have a recovery plan if keys are lost

---

## Environment Variable Reference

### Complete List

```env
# Required - API Configuration
NEXT_PUBLIC_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2/
NEXT_PUBLIC_REST_API_ENDPOINT=https://api.nungudiamonds.co.za/api/v2
NEXT_PUBLIC_IMG_ENDPOINT=https://d2yhu6nvl7lle6.cloudfront.net
NEXT_PUBLIC_AUTHORIZATION_TOKEN=[SECURE_TOKEN]

# Required - Security (Generate new keys)
CRYPTO_JS_KEY=[64_CHAR_HEX_STRING]
CRYPTO_JS_IV=[32_CHAR_HEX_STRING]

# Optional - Feature Flags
NEXT_PUBLIC_DISABLE_ADMIN_LOGIN=false

# Optional - Brand Colors
NEXT_PUBLIC_PRIMARY_COLOR_MAIN=#333333
NEXT_PUBLIC_PRIMARY_COLOR_LIGHT=#2b2b2b
NEXT_PUBLIC_PRIMARY_COLOR_DARK=#292929
NEXT_PUBLIC_SECONDARY_COLOR_MAIN=#A8AAAE
NEXT_PUBLIC_WHITE_COLOR=#FFF
NEXT_PUBLIC_BLACK_COLOR=#000
```

---

## Rollback Procedure

If issues occur after updating environment variables:

1. **Revert Environment Variables in Amplify:**
   - Go to Amplify Console → Environment variables
   - Restore previous values
   - Save and trigger rebuild

2. **Revert Code Changes:**
   - Restore `src/AppConfig.ts` from git
   - Push the revert commit
   - Amplify will auto-deploy

3. **Verify Application:**
   - Confirm application loads correctly
   - Test all critical functionality
   - Document the incident

---

## Support

For issues related to:
- **AWS Amplify:** Contact AWS Support or your AWS administrator
- **Key Generation:** Refer to OpenSSL documentation
- **Application Issues:** Contact the development team

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Next Review:** April 18, 2026 (Quarterly key rotation check)
