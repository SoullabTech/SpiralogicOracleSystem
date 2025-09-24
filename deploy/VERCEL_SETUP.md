# Vercel Deployment Setup for ARIA Oracle Beta

## Quick Deploy Steps

### 1. Run Deployment Script
```bash
cd deploy
./deploy.sh
```

### 2. Vercel Dashboard Configuration

After deployment, go to your Vercel dashboard:

1. **Navigate to your project**: https://vercel.com/dashboard
2. **Select**: soullab-beta (or your project name)
3. **Go to**: Settings → Environment Variables

### 3. Add Environment Variables

Add these required variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]

# Site URLs
NEXT_PUBLIC_SITE_URL=https://soullab.life
NEXT_PUBLIC_BETA_URL=https://soullab.life/beta

# Beta Settings
BETA_MAX_TESTERS=500
BETA_AUTO_APPROVE=false
```

Optional variables:
```env
# Email (for notifications)
EMAIL_API_KEY=[YOUR_SENDGRID_OR_RESEND_KEY]
EMAIL_FROM=beta@soullab.life

# Analytics
NEXT_PUBLIC_GA_ID=[YOUR_GA_ID]
NEXT_PUBLIC_MIXPANEL_TOKEN=[YOUR_TOKEN]
```

### 4. Set Up Supabase

1. **Create a new Supabase project**: https://app.supabase.com
2. **Run the migration**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/migrations/001_beta_tables.sql`
   - Execute the SQL

3. **Get your keys**:
   - Settings → API
   - Copy the `anon` public key
   - Copy the `service_role` secret key
   - Copy the project URL

### 5. Configure Custom Domain (if needed)

To use soullab.life/beta:

1. **In Vercel Dashboard**:
   - Settings → Domains
   - Add domain: `soullab.life`
   - Configure DNS as instructed

2. **DNS Settings** (at your domain provider):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### 6. Test Your Deployment

1. **Visit**: https://[your-project].vercel.app/beta
2. **Test application flow**:
   - View landing page
   - Check remaining spots counter
   - Submit test application
   - Verify success page

### 7. Monitor Applications

Check Supabase dashboard:
- Table Editor → beta_applications
- View submitted applications
- Update status to 'approved' or 'rejected'

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm cache clean --force
npm install --legacy-peer-deps
npm run build
```

### Environment Variable Issues
- Ensure all variables are added in Vercel dashboard
- Redeploy after adding variables:
  ```bash
  vercel --prod
  ```

### Database Connection Issues
- Check Supabase project is active
- Verify keys are correct
- Check RLS policies in Supabase

## Manual Deployment Alternative

If the script fails, deploy manually:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [Your account]
# - Link to existing project? N
# - Project name? soullab-beta
# - In which directory? ./
# - Override settings? N
```

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase tables created
- [ ] DNS configured (if custom domain)
- [ ] Beta application flow tested
- [ ] Email notifications configured (optional)
- [ ] Analytics configured (optional)
- [ ] SSL certificate active
- [ ] Rate limiting configured
- [ ] Error tracking set up

## Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first: `npm run dev`
4. Check Supabase connection

Ready to launch your ARIA Oracle Beta! 🚀