# Creator Studio Access 🎬

## Overview
The admin panel is accessible at `/studio` with a security token verification system inspired by big tech platforms like YouTube Creator Studio.

## Security Features

### 1. **Obscured Path**
- Uses `/studio` instead of obvious `/admin` path
- Mimics legitimate creator tools
- Harder for automated attacks to discover

### 2. **Token-Based Access**
- Requires verification token in URL query parameter
- Token stored in environment variable
- Changes per environment (dev, staging, production)

### 3. **Multi-Layer Authorization**
- Must be authenticated user
- Must have ADMIN role
- Must provide correct verification token
- All three checks required

## Access URL Format

```
https://yourdomain.com/studio?verify=YOUR-SECURE-TOKEN
```

## Setup Instructions

### 1. Set Environment Variable

Add to your `.env` file:

```env
ADMIN_STUDIO_TOKEN="your-secure-random-token-here"
```

**Generate a secure token:**
```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Configure for Production

**IMPORTANT:** Change the default token before deploying to production!

```env
# .env.production
ADMIN_STUDIO_TOKEN="production-secure-token-change-this-abc123xyz"
```

## Accessing Studio

### For Developers (Local)
1. Make sure you have ADMIN role in database
2. Login to the platform
3. Click "Studio" in navbar or user menu
4. Or directly visit: `http://localhost:3000/studio?verify=nhub-studio-2024-secure`

### For Production
1. Set environment variable on hosting platform
2. Access via: `https://yourdomain.com/studio?verify=YOUR-PRODUCTION-TOKEN`
3. **Never share the full URL publicly**

## Features Available

### Current
- ✅ Platform statistics (users, novels, chapters)
- ✅ Recent user registrations table
- ✅ Role-based user listing

### Coming Soon
- 🔄 Content moderation tools
- 🔄 Analytics dashboard
- 🔄 User management (promote/demote roles)
- 🔄 Novel/chapter management
- 🔄 Platform configuration

## Security Best Practices

1. **Token Management**
   - Use different tokens for each environment
   - Rotate tokens periodically (quarterly recommended)
   - Never commit tokens to git

2. **Access Control**
   - Limit ADMIN role to trusted users only
   - Monitor Studio access logs
   - Use strong passwords for admin accounts

3. **URL Protection**
   - Don't share the full Studio URL
   - Consider IP whitelist for production
   - Monitor failed access attempts

## Troubleshooting

### "404 Not Found"
- Check if verification token matches environment variable
- Ensure you're logged in
- Verify you have ADMIN role

### "Unauthorized"
- Login first
- Check your user role in database

### Token Not Working
- Check `.env` file for `ADMIN_STUDIO_TOKEN`
- Restart dev server after changing env
- Verify no typos in token

## Environment Variables Reference

```env
# Required
ADMIN_STUDIO_TOKEN="your-secure-token"

# Optional (for frontend)
NEXT_PUBLIC_ADMIN_STUDIO_TOKEN="your-secure-token"
```

**Note:** If using `NEXT_PUBLIC_*` prefix, the token will be visible in client-side code. For maximum security, keep it server-side only.
