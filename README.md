# Real-Time Chat Application with Authentication

A modern, secure chat application built with **Next.js 15**, **TypeScript**, **Supabase**, and **Tailwind CSS**. Features real-time messaging, user authentication, and row-level security.

## 🎯 Features

### Authentication
- **Sign Up**: Create new accounts with email and password
- **Sign In**: Secure login with session management
- **Sign Out**: Clear session and logout
- **Protected Routes**: Dashboard accessible only to authenticated users
- **Middleware Protection**: Automatic redirect to sign-in for unauthorized access

### Chat
- **Real-Time Messaging**: Instant message delivery using Supabase Realtime
- **Live Updates**: All connected users see new messages instantly
- **User Attribution**: Messages show sender's email
- **Persistent Storage**: Messages stored securely in Supabase database
- **Row Level Security**: Users can only view/modify their own data

### User Experience
- **Email Display**: Shows currently logged-in user's email on dashboard
- **Form Validation**: Client-side validation with helpful error messages
- **Loading States**: User feedback during async operations
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** (free tier available at [supabase.com](https://supabase.com))
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd d:\Projects\chat
npm install
```

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose region closest to you)
3. In the project settings, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create Database Schema

In your Supabase project's **SQL Editor**, run the following SQL:

```sql
-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX messages_created_at_idx ON messages(created_at);
CREATE INDEX messages_user_id_idx ON messages(user_id);

-- Enable Realtime
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all messages
CREATE POLICY "Users can view all messages" ON messages
  FOR SELECT USING (true);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_profiles table for additional user data (optional)
CREATE TABLE user_profiles (
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

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── sign-in/
│   │   └── page.tsx            # Sign in page
│   ├── sign-up/
│   │   └── page.tsx            # Sign up page
│   └── dashboard/
│       └── page.tsx            # Protected dashboard with chat
├── components/
│   └── Chat.tsx                # Real-time chat component
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── lib/
│   ├── auth/
│   │   └── service.ts          # Auth service functions
│   └── supabase/
│       ├── client.ts           # Browser client
│       └── server.ts           # Server client
├── middleware.ts               # Route protection middleware
└── env.ts                      # Environment variable validation
```

## 🔐 Authentication Flow

### Sign Up
1. User fills email and password → Validation
2. Account created via `authService.signUp()`
3. Automatic sign-in after successful signup
4. Redirect to `/dashboard`

### Sign In
1. User enters credentials → Validation
2. Session created via `authService.signIn()`
3. Redirect to `/dashboard` on success

### Protected Routes
1. Middleware checks for active session
2. If no session and accessing `/dashboard` → Redirect to `/sign-in`
3. If authenticated and accessing `/sign-in` → Redirect to `/dashboard`

## 💬 Real-Time Chat

### How It Works

1. **Message Sending**:
   - User types and submits message
   - Message inserted into `messages` table with user_id
   - Supabase Realtime triggers INSERT event

2. **Live Updates**:
   - Chat component subscribes to `messages` table changes
   - On INSERT event, new message added to local state
   - UI automatically updates for all connected users

3. **Display**:
   - Current user's messages appear on right (blue)
   - Other users' messages appear on left (gray)
   - Each message shows sender email and timestamp

### Database Schema

**messages** table:
- `id`: UUID primary key
- `user_id`: Foreign key to auth.users
- `user_email`: Email of sender (for display)
- `content`: Message text
- `created_at`: Timestamp

**Row Level Security (RLS)**:
- ✅ Anyone can view all messages (for group chat)
- ✅ Users can only insert messages with their own user_id
- ✅ Prevents unauthorized message insertion

## 🛠️ Environment Variables

All required variables are type-safe via `src/env.ts`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

These are validated at runtime using Zod schema validation.

## 📦 Key Dependencies

- **next**: React framework for production
- **@supabase/supabase-js**: Supabase client library
- **@supabase/ssr**: SSR support for Supabase
- **zod**: Type-safe schema validation
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Type safety for JavaScript

## 🧪 Testing the App

### Test Authentication
1. Go to http://localhost:3000/sign-up
2. Create account with email and password (6+ chars)
3. Redirected to dashboard
4. See your email displayed
5. Click "Sign Out" button
6. Redirected to sign-in page

### Test Chat Functionality
1. Sign in on multiple browsers/windows
2. Send message from one session
3. Verify it appears instantly on other sessions
4. Check message shows correct sender email

### Test Route Protection
1. Try accessing http://localhost:3000/dashboard while logged out
2. Auto-redirected to /sign-in
3. Sign in and try accessing /sign-in
4. Auto-redirected to /dashboard

## 🐛 Troubleshooting

### "Can't find variable: $interpolations"
- Check that `NEXT_PUBLIC_SUPABASE_URL` is in `.env.local`
- Restart dev server after adding env vars

### Messages not appearing
- Verify Realtime is enabled on `messages` table
- Check RLS policies are correct
- Open browser console for any errors

### Can't sign up
- Ensure Supabase project is created and running
- Check credentials in `.env.local`
- Verify email format is valid

### Middleware not working
- Ensure `middleware.ts` exists in `src/` directory
- Check matcher patterns in middleware config
- Restart dev server

## 📚 API Reference

### `authService`

```typescript
authService.signUp(email, password)    // Create account
authService.signIn(email, password)    // Login
authService.signOut()                  // Logout
authService.getUser()                  // Get current user
authService.getSession()               // Get session
```

### `useAuth()` Hook

```typescript
const { user, loading } = useAuth()
// user: User object or null
// loading: boolean indicating if auth state is resolving
```

### `Chat` Component

```typescript
<Chat userId={string} userEmail={string} />
// userId: Current user's ID from auth
// userEmail: Current user's email
```

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and select your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Production Checklist

- [ ] Set strong Supabase passwords
- [ ] Enable email verification in Supabase auth settings
- [ ] Review RLS policies for security
- [ ] Set up CORS properly in Supabase settings
- [ ] Enable rate limiting in Supabase
- [ ] Monitor Supabase usage and set billing alerts

## 📝 Optional Enhancements

1. **Image Uploads**: Integrate Supabase Storage for image sharing
2. **User Profiles**: Add profile pictures and usernames
3. **Message Search**: Add full-text search capability
4. **Typing Indicators**: Show when users are typing
5. **Message Reactions**: Add emoji reactions to messages
6. **User Presence**: Show online/offline status
7. **Message Editing**: Allow users to edit sent messages
8. **Message Deletion**: Allow message removal
9. **Private Messaging**: Add DM functionality
10. **Notifications**: Push notifications for new messages

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

For issues or questions:
- Check the [troubleshooting section](#-troubleshooting)
- Review [Supabase docs](https://supabase.com/docs)
- Check [Next.js docs](https://nextjs.org/docs)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
