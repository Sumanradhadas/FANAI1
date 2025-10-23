# FanAI - AI Celebrity Photo Generation Platform

## Project Overview
FanAI is a full-stack web application that allows users to create realistic AI-generated photos with their favorite celebrities for festivals, campaigns, and special occasions.

## Technology Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing), TanStack Query
- **Backend**: Node.js + Express, PostgreSQL (Neon), Drizzle ORM
- **AI**: Google Gemini AI (via @google/genai)
- **Image Processing**: Sharp (for margin, cropping, watermarking)
- **Authentication**: Firebase Authentication (Email/Password) for users, Environment-based credentials for admin
- **Payment**: Razorpay (demo UI only - not yet integrated)
- **Image Storage**: GitHub repository proxy (no local storage)

## Key Features
1. User authentication with Firebase Email/Password
2. Separate admin authentication using environment credentials
3. Celebrity search and browsing
4. **Celebrity request system** - Users can request new celebrities for admin approval
5. Template-based AI photo generation
6. Photo upload with validation
7. Automated image processing (margin, crop, watermark)
8. User dashboard with generation history
9. Admin panel for managing celebrities, templates, campaigns, and user requests
10. Campaign link system for politicians/influencers
11. Credit-based pricing system (demo)
12. GitHub-based celebrity image storage (no local storage)

## Database Schema
- **users**: User accounts with Replit Auth, credits, plan info
- **celebrities**: Celebrity profiles with images from GitHub
- **celebrity_requests**: User-submitted celebrity requests pending admin approval
- **templates**: AI generation prompt templates
- **generations**: User generation history
- **campaigns**: Campaign tracking with custom slugs
- **plans**: Subscription plans (demo)
- **sessions**: Replit Auth session storage

## Project Structure
```
/client - React frontend
  /src
    /components - Reusable UI components
      /admin - Admin panel components
      /ui - Shadcn UI components
    /pages - Page components
    /hooks - Custom React hooks
    /lib - Utilities and configuration
/server - Express backend
  routes.ts - API routes
  storage.ts - Database storage layer
  db.ts - Database connection
  firebaseAuth.ts - Firebase Auth configuration and middleware
  githubClient.ts - GitHub API client for celebrity images
/shared
  schema.ts - Shared database schema and types
```

## API Endpoints
### Public
- GET /api/celebrities - List all active celebrities
- GET /api/celebrities/search?q={query} - Search celebrities
- GET /api/celebrities/:slug - Get celebrity details
- GET /api/templates - List all active templates
- GET /api/templates/:slug - Get template details

### Authenticated
- POST /api/generate - Generate AI photo (requires credits)
- GET /api/generations - Get user generation history
- GET /api/generations/:id - Get generation details
- POST /api/celebrity-requests - Submit a celebrity request

### Admin Only
- POST /api/admin/celebrities - Create celebrity
- PATCH /api/admin/celebrities/:id - Update celebrity
- DELETE /api/admin/celebrities/:id - Delete celebrity
- GET /api/admin/celebrity-requests - List all celebrity requests (optionally filter by status)
- PATCH /api/admin/celebrity-requests/:id/approve - Approve request and add to database
- PATCH /api/admin/celebrity-requests/:id/reject - Reject celebrity request
- DELETE /api/admin/celebrity-requests/:id - Delete celebrity request
- POST /api/admin/templates - Create template
- PATCH /api/admin/templates/:id - Update template
- DELETE /api/admin/templates/:id - Delete template
- POST /api/admin/campaigns - Create campaign
- DELETE /api/admin/campaigns/:id - Delete campaign
- GET /api/admin/analytics - Get analytics data
- POST /api/admin/sync-templates - Sync templates from GitHub (requires owner and repo)

## Environment Variables
Required:
- DATABASE_URL - PostgreSQL connection string
- SESSION_SECRET - Session encryption secret
- GEMINI_API_KEY - Google Gemini AI API key
- GITHUB_TOKEN - GitHub personal access token (for private repo access)
- VITE_FIREBASE_API_KEY - Firebase API key
- VITE_FIREBASE_PROJECT_ID - Firebase project ID
- VITE_FIREBASE_APP_ID - Firebase app ID
- ADMIN_USER_ID - Admin username for admin authentication
- ADMIN_PASSWORD - Admin password for admin authentication

Optional (for future):
- RAZORPAY_KEY_ID - Razorpay API key
- RAZORPAY_KEY_SECRET - Razorpay secret key

## Design System
- **Primary Color**: Purple-blue (250° 75% 55%)
- **Font**: Inter (headings and body), JetBrains Mono (code)
- **Components**: Shadcn UI with custom theming
- **Dark Mode**: Fully supported with theme toggle

## User Roles
- **user**: Regular user with credit-based access
- **admin**: Full admin access to manage platform

## Development Notes
- Follow design_guidelines.md for all UI implementations
- Use TypeScript for type safety
- Image processing happens server-side with Sharp
- Celebrity images stored in private GitHub repository
- Watermark added to all generated images ("FanAI" bottom-right, 60% opacity)

## GitHub Integration
The platform integrates with GitHub to:
1. **Fetch celebrity images** from a private repository (requires GITHUB_TOKEN)
2. **Sync templates** from templates.json in the repo structure
3. Admin can trigger sync via `/api/admin/sync-templates` endpoint

### GitHub Repo Structure (Expected)
```
/celebs
  /{celebrity-slug}.jpg - Celebrity images
/templates
  templates.json - Template definitions
```

### Templates JSON Format
```json
[
  {
    "name": "Diwali Celebration",
    "slug": "diwali-celebration",
    "prompt": "Diwali festival scene with traditional decorations...",
    "description": "Perfect for Diwali greetings",
    "category": "festival",
    "tags": ["diwali", "festival", "celebration"],
    "sample": "https://example.com/sample.jpg"
  }
]
```

## AI Generation (Current Status)
**IMPORTANT**: The current Gemini AI implementation is a DEMO/SIMULATION for MVP purposes.

- Gemini does NOT support face-swapping or realistic photo composition
- Current implementation creates a side-by-side composite as a demonstration
- For PRODUCTION, integrate with specialized APIs:
  - Replicate (face swap models)
  - Stability AI (image composition)
  - Midjourney API
  - Commercial face-swap services (DeepAR, Banuba, etc.)

The demo implementation:
1. Uses Gemini to analyze both images
2. Creates a side-by-side composite using Sharp
3. Processes with margins, cropping, and watermarking
4. Saves to generation history

This allows the full application flow to work while waiting for production-grade face-swapping integration.

## Future Enhancements (Phase 2)
- Actual Razorpay payment integration
- Batch processing for campaigns
- Advanced analytics dashboard
- Image quality optimization
- Social sharing features
- Email notifications

## Replit Environment Setup
The application has been configured for the Replit environment:
- **Vite Dev Server**: Configured to bind to 0.0.0.0:5000 with proper HMR settings
- **Express Backend**: Serves both API and frontend on port 5000
- **Database**: PostgreSQL database provisioned with schema deployed via Drizzle
- **Environment Variables**: GEMINI_API_KEY and GITHUB_TOKEN configured in Secrets
- **Deployment**: Configured for VM deployment with build and start scripts

## Authentication System
### User Authentication (Firebase)
- Users sign up and sign in with Email/Password through Firebase
- Frontend uses Firebase SDK for authentication
- Backend receives Firebase UID and creates session
- **IMPORTANT**: Current implementation does NOT verify Firebase ID tokens on backend (security limitation)
- For production, implement Firebase Admin SDK for token verification

### Admin Authentication
- Admins use environment credentials (ADMIN_USER_ID, ADMIN_PASSWORD)
- Admin login available in footer on landing page
- Separate authentication flow from regular users
- Admin routes protected by isAdmin middleware

### GitHub Integration for Celebrity Images
- Celebrity images are fetched directly from GitHub repository (Sumanradhadas/fan-ai-celebs)
- GitHub proxy endpoint: `/api/github/celebrity-image/:slug`
- Images cached for 24 hours on client side
- Requires GITHUB_TOKEN environment variable for private repos
- No local image storage - all images served from GitHub

## Recent Changes (October 2025)
- **October 19**: Successfully imported from GitHub and configured for Replit environment
- **October 19**: Installed all npm dependencies (612 packages)
- **October 19**: Database schema pushed to PostgreSQL via Drizzle
- **October 19**: Configured all required environment variables (Firebase, Gemini, GitHub, Admin)
- **October 19**: Set up development workflow on port 5000
- **October 19**: Created .gitignore for Node.js project
- **October 19**: Configured VM deployment for production publishing
- **October 19**: Verified application running successfully on Replit
- **October 19**: Added celebrity request feature - users can submit celebrities for admin approval
  - New database table: `celebrity_requests`
  - User-facing: Request dialog on search page when no results found
  - Admin panel: New "Requests" tab to review, approve, or reject submissions
  - Complete workflow: User submits → Admin reviews → Celebrity added to database

## Replit Environment Setup (GitHub Import)
The application has been successfully configured and is running in the Replit environment.

### Setup Completed ✓
1. **Dependencies Installed**: All npm packages (612 packages) installed successfully
2. **Database**: PostgreSQL database schema deployed via Drizzle
3. **Environment Variables**: All required secrets configured:
   - DATABASE_URL (auto-provisioned)
   - SESSION_SECRET (auto-provisioned)
   - GEMINI_API_KEY (Google AI for photo generation)
   - GITHUB_TOKEN (for celebrity image storage)
   - VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID (Firebase Auth)
   - ADMIN_USER_ID, ADMIN_PASSWORD (admin panel access)
4. **Workflow**: Development server running on port 5000 with `npm run dev`
5. **Deployment**: VM deployment configured with build and start scripts
6. **Vite Configuration**: Properly configured for Replit proxy with:
   - Host: 0.0.0.0:5000
   - HMR client port: 443
   - Allowed hosts: all (required for Replit iframe proxy)
7. **.gitignore**: Created for Node.js project (node_modules, dist, .env, etc.)

### How to Use
- **Development**: The server runs automatically on port 5000
- **Database Schema**: Use `npm run db:push` to update database schema if needed
- **Admin Access**: Login with configured ADMIN_USER_ID and ADMIN_PASSWORD credentials
- **Publishing**: Click the "Publish" button to deploy to production (VM deployment)

### Known Limitations
- Firebase API key validation errors may appear in console if Firebase project is not properly configured
- AI generation is currently a demo/simulation (see AI Generation section above)
- Celebrity images require GitHub repository setup with proper structure

## Replit Import Status (October 19, 2025)
✅ **Successfully Imported and Running**

### What Was Done:
1. ✅ Installed all npm dependencies (612 packages)
2. ✅ Created .gitignore for Node.js project
3. ✅ Configured all required environment secrets:
   - DATABASE_URL (auto-provisioned PostgreSQL)
   - SESSION_SECRET (auto-provisioned)
   - GEMINI_API_KEY (Google AI for photo generation)
   - GITHUB_TOKEN (for celebrity image storage)
   - VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID (Firebase Auth)
   - ADMIN_USER_ID, ADMIN_PASSWORD (admin panel access)
4. ✅ Pushed database schema to PostgreSQL using Drizzle
5. ✅ Set up development workflow on port 5000 (npm run dev)
6. ✅ Configured VM deployment for production publishing
7. ✅ Verified application is running successfully

### Current Status:
- **Server**: Running on port 5000 (both API and frontend)
- **Database**: Schema deployed successfully
- **Frontend**: Vite dev server configured for Replit proxy (0.0.0.0:5000, allowedHosts: all)
- **Authentication**: Firebase and admin auth configured
- **Deployment**: VM deployment ready (build + start scripts configured)

### How to Use:
- **Development**: Server runs automatically on port 5000
- **Admin Login**: Use configured ADMIN_USER_ID and ADMIN_PASSWORD credentials
- **Database Updates**: Run `npm run db:push` to sync schema changes
- **Publishing**: Click "Publish" button to deploy to production

### Notes:
- The 401 error on `/api/auth/user` is expected when not logged in
- Celebrity database is empty - use admin panel to add celebrities
- Firebase project must be properly configured for user authentication to work

## Current Status (Latest Update: October 19, 2025)

### ✅ Setup Completed
1. **Environment Variables**: All required secrets configured (DATABASE_URL, GEMINI_API_KEY, GITHUB_TOKEN, Firebase credentials, Admin credentials)
2. **Database**: PostgreSQL database with schema deployed
3. **Sample Data**: Added test celebrities (Shah Rukh Khan, Virat Kohli, Narendra Modi) and templates (Diwali, Birthday, New Year)
4. **Workflow**: Development server running on port 5000
5. **Deployment**: VM deployment configured

### 🔧 Known Issues & Solutions

#### Issue 1: Search Page with Query Parameters Shows 404
**Problem**: Navigating directly to `/search?q=something` shows a 404 page instead of search results.
**Workaround**: Use the search form on the landing page (/) to navigate to search results.
**Status**: Under investigation - client-side routing issue with wouter and query parameters.

#### Issue 2: Celebrity Images Not Showing
**Problem**: Test celebrity images return 404 because they don't exist in the GitHub repository.
**Solution**: 
- Celebrity images are fetched from GitHub repository (Sumanradhadas/fan-ai-celebs)
- You need to either:
  1. Add celebrity images to your GitHub repository at `celebs/{slug}.jpg`
  2. Or use placeholder images by updating image URLs in database
  
**Current Setup**: All test celebrities now use placeholder images (via.placeholder.com)

### 📝 How to Test Features

#### Celebrity Request Feature
1. Click "Sign In" and create an account with Firebase
2. Use the search bar on landing page to search for a non-existent celebrity (e.g., "ABC XYZ")
3. After searching, you should see a "Request Celebrity" button when no results are found
4. Click the button to open the request dialog
5. Fill in celebrity name, category, description, and upload an image
6. Submit the request - it will appear in the admin panel for approval

#### Admin Panel
1. Scroll to footer on landing page and click "Admin Login"
2. Use your ADMIN_USER_ID and ADMIN_PASSWORD credentials
3. Navigate to Admin panel to:
   - Manage celebrities
   - Review celebrity requests
   - Manage templates
   - View analytics

### 🚀 Next Steps
1. Fix the search page routing issue with query parameters
2. Upload actual celebrity images to GitHub repository
3. Test the AI generation feature with Gemini API
4. Add more celebrities and templates

## Test Data
The following test data has been added to the database:

### Celebrities
- **Srinidhi Shetty** - Indian actress and model (Category: Actor)
  - Image: `/attached_assets/celebrities/srinidhi-shetty.png`
  - Slug: `srinidhi-shetty`

### Templates
- **Selfie with Celebrity** - Create casual selfie moments with celebrities (FREE)
  - Slug: `selfie-celebrity`
  - Category: Casual
  - Tags: selfie, casual, photo, personal

## Recent Improvements
### Logout System (October 19, 2025)
- **Smooth logout for both users and admins**: Unified logout flow that properly clears session and reloads page
- **Firebase signout integration**: Regular users are signed out from Firebase before session cleanup
- **Automatic page reload**: After logout, users are automatically redirected to home page with clean state
- **Error handling**: Graceful fallback to home page if logout encounters any issues

## Last Updated
October 19, 2025 - Successfully imported from GitHub and fully configured for Replit
- Added test celebrity: Srinidhi Shetty
- Added test template: Selfie with Celebrity (free)
- Fixed file upload for photo generation (FormData handling)
- Improved logout system for smooth user experience
- Fixed celebrity image path for AI generation
