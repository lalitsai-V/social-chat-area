# Setup Guide - Real-Time Chat Application

## 🎯 Overview

This guide will walk you through setting up the complete authentication and real-time chat system.

## Step 1: Create Supabase Project

### 1.1 Sign Up for Supabase
- Visit https://supabase.com
- Click "Start Your Project"
- Sign up with GitHub, Google, or email
- Create organization and project

### 1.2 Get Your Credentials
1. Go to **Settings** → **API** in your Supabase project
2. Copy the following:
   - **Project URL** (in format: `https://xxxxx.supabase.co`)
   - **Anon Key** (under "anon public")

### 1.3 Configure .env.local
Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual credentials from Step 1.2

## Step 2: Create Database Tables

### 2.1 Access SQL Editor
1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"

### 2.2 Run Database Setup Script
Copy and paste this complete SQL script:

```sql
-- =====================
-- Create messages table
-- =====================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages(created_at);
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);

-- Enable Realtime for messages table
ALTER TABLE messages REPLICA IDENTITY FULL;

-- =====================
-- Enable Row Level Security
-- =====================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all messages
CREATE POLICY "Users can view all messages" ON messages
  FOR SELECT USING (true);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users can update their own messages
CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================
-- Create user_profiles table (optional)
-- =====================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 2.3 Execute the Script
1. Click "Run" button
2. You should see ✅ success messages
3. Verify tables in **Table Editor** → you should see:
   - `messages` table
   - `user_profiles` table

## Step 3: Enable Realtime

### 3.1 Configure Realtime
1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the `messages` table
3. Toggle the **Realtime** switch ON (if not already enabled by script)
4. Verify status shows "enabled"

## Step 4: Install Dependencies & Run

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Start Development Server
```bash
npm run dev
```

The app will start at http://localhost:3000

## Step 5: Test the Application

### 5.1 Test Sign Up
1. Go to http://localhost:3000/sign-up
2. Enter an email (e.g., `user1@example.com`)
3. Enter a password (6+ characters)
4. Click "Sign Up"
5. You should be redirected to `/dashboard`
6. Your email should be displayed

### 5.2 Test Chat in Multiple Windows
1. Sign in with first email in one browser/window
2. Open a new incognito/private window
3. Sign up with a different email
4. In first window, type and send a message
5. Verify it appears instantly in second window
6. Send a message from second window
7. Verify it appears in first window (should show different sender email)

### 5.3 Test Route Protection
1. Sign out from dashboard
2. Try accessing http://localhost:3000/dashboard
3. Should auto-redirect to /sign-in
4. Sign in and try accessing /sign-in
5. Should auto-redirect to /dashboard

### 5.4 Test Sign Out
1. On dashboard, click "Sign Out" button
2. Should redirect to /sign-in page
3. Session should be cleared

## Step 6: Troubleshooting

### Issue: "Can't find variable: $interpolations"
**Solution:**
- Verify `.env.local` exists with correct values
- Restart the dev server: `npm run dev`
- Clear `.next` cache: `rm -r .next`

### Issue: Messages not appearing in real-time
**Solution:**
- Check that Realtime is enabled in Supabase
- Verify RLS policies are correctly set
- Open browser DevTools Console for errors
- Check Supabase dashboard → Logs for database errors

### Issue: Can't sign up
**Solution:**
- Verify Supabase project is running (check dashboard)
- Check `.env.local` has correct credentials
- Verify email format is valid
- Try signing in with existing account

### Issue: "Middleware not working"
**Solution:**
- Ensure `src/middleware.ts` file exists
- Restart dev server
- Check browser console for any client-side errors

### Issue: Messages show "Unknown" sender
**Solution:**
- Messages need `user_email` field populated
- Verify INSERT in database includes user_email
- Check Chat component is passing userEmail prop correctly

## Understanding the Architecture

### Frontend Components
- **`src/app/page.tsx`**: Landing page with links
- **`src/app/sign-up/page.tsx`**: Sign up form
- **`src/app/sign-in/page.tsx`**: Sign in form
- **`src/app/dashboard/page.tsx`**: Protected dashboard with chat
- **`src/components/Chat.tsx`**: Real-time chat component

### Backend/Services
- **`src/lib/auth/service.ts`**: Auth functions (signup, signin, signout)
- **`src/lib/supabase/client.ts`**: Browser Supabase client
- **`src/lib/supabase/server.ts`**: Server-side Supabase client
- **`src/hooks/useAuth.ts`**: Auth state hook
- **`src/middleware.ts`**: Route protection middleware
- **`src/env.ts`**: Environment variable validation

### Database
- **`messages`**: Stores chat messages with RLS
- **`user_profiles`**: Optional, for user data

### Real-Time Flow
1. User sends message → Chat component calls `supabase.from("messages").insert()`
2. Message stored in database
3. Supabase emits INSERT event via Realtime
4. All connected Chat components receive event
5. Message added to local state
6. UI updates automatically

## Advanced Configuration

### Custom Domain
To use a custom domain instead of localhost:
1. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

### Authentication Settings
To customize auth in Supabase:
1. Go to **Settings** → **Auth Providers**
2. Configure email settings, redirect URLs, etc.

### Database Backups
- Supabase automatically backs up your database daily
- Access backups in **Settings** → **Backups**

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Go to https://vercel.com/new
3. Select your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

### Production Checklist
- [ ] Update CORS in Supabase settings for your domain
- [ ] Enable email verification in Auth settings
- [ ] Set up custom SMTP for emails (optional)
- [ ] Configure rate limiting policies
- [ ] Review all RLS policies
- [ ] Set up monitoring/alerts
- [ ] Create database backups
- [ ] Test auth flow end-to-end

## Next Steps

### Optional Enhancements
1. **Image Support**: Add file uploads to messages
2. **User Profiles**: Add avatars and usernames
3. **Typing Indicators**: Show when users are typing
4. **Message Search**: Full-text search on messages
5. **Reactions**: Emoji reactions to messages
6. **Presence**: Show online/offline status
7. **Edit/Delete**: Let users modify messages
8. **Private Chat**: Add DM functionality
9. **Notifications**: Desktop or push notifications
10. **Markdown**: Support formatted messages

### Learning Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review browser console for errors
3. Check Supabase dashboard → Logs
4. Consult official documentation

---

**Happy coding! 🚀**
