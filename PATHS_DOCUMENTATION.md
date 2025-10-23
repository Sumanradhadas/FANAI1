# FanAI - Complete Paths Documentation

This document lists all file paths, storage locations, and data flow paths used in the FanAI application.

---

## 📁 FILE STORAGE PATHS

### Upload Directories (Server-side)
```
uploads/                          # Root upload directory (Multer destination)
├── uploads/                      # Raw uploaded files (user photos, celebrity requests)
├── uploads/processed/            # Processed images with watermark & cropping
└── uploads/generated/            # AI-generated images (raw output)
```

### File Naming Conventions
- **Uploaded user photos**: `uploads/{random-hash}` (e.g., `uploads/74291f83edc22cb8b225fb8804952134`)
- **Generated images**: `uploads/generated/{generation-id}.png`
- **Processed images**: `uploads/processed/{generation-id}.png`
- **Celebrity request images**: `uploads/{random-hash}`

### File Upload Configuration
```javascript
// Location: server/routes.ts (lines 15-28)
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: ['image/jpeg', 'image/jpg', 'image/png'] // Allowed types
});
```

---

## 🗄️ DATABASE CONFIGURATION

### Database Connection
```
Environment Variable: DATABASE_URL
Connection Type: PostgreSQL (Neon Database)
ORM: Drizzle ORM
Schema File: shared/schema.ts
Migration Config: drizzle.config.ts
```

### Database Tables
```
sessions              # Express session storage (Firebase Auth)
users                 # User accounts and credits
celebrities           # Celebrity profiles
celebrity_requests    # User-submitted celebrity requests
templates            # AI generation prompt templates
generations          # User generation history
campaigns            # Campaign tracking
plans                # Subscription plans (demo)
```

### Database Configuration Files
```
server/db.ts          # Database connection setup
drizzle.config.ts     # Drizzle migration configuration
shared/schema.ts      # Complete database schema
```

---

## 🖼️ IMAGE PATHS & SOURCES

### Celebrity Images (GitHub Repository)
```
Source: GitHub Repository (private)
Default Repository: Sumanradhadas/fan-ai-celebs
Structure: celebs/{celebrity-slug}.jpg
Access: Via GITHUB_TOKEN environment variable
```

**GitHub Celebrity Image Path Pattern:**
```
https://raw.githubusercontent.com/{owner}/{repo}/main/celebs/{slug}.jpg
```

**Example:**
```
https://raw.githubusercontent.com/Sumanradhadas/fan-ai-celebs/main/celebs/shah-rukh-khan.jpg
```

**Local Proxy Endpoint:**
```
GET /api/github/celebrity-image/{slug}
↓
Fetches from GitHub & caches for 24 hours
```

### Template Preview Images
```
Storage: External URLs (stored in database)
Field: templates.previewUrl (varchar)
Example: https://example.com/sample.jpg
```

### User Generated Images
```
Input: Uploaded user photo → uploads/{hash}
Output: Generated image → uploads/generated/{generation-id}.png
Final: Processed image → uploads/processed/{generation-id}.png
```

**Processing Flow:**
```
User Upload → uploads/{hash}
     ↓
AI Generation → uploads/generated/{id}.png
     ↓
Image Processing (watermark, crop) → uploads/processed/{id}.png
     ↓
Database: generations.generatedImageUrl = /uploads/{id}.png
```

---

## 📝 TEMPLATE & PROMPT PATHS

### Template Storage
**Location:** PostgreSQL Database (`templates` table)

**Template Fields:**
```typescript
id: string (UUID)
name: string
slug: string (unique, for URLs)
prompt: text (AI generation prompt template)
description: text
category: string ('birthday', 'festival', 'campaign', etc.)
tags: string[] (['diwali', 'celebration'])
previewUrl: string (external URL)
isFree: boolean
isActive: boolean
```

### Template Sources

#### 1. Database Templates (Primary)
```
API Endpoint: GET /api/templates
Returns: All active templates from database
Storage Method: PostgreSQL via Drizzle ORM
```

#### 2. GitHub Templates (Sync)
```
Source: GitHub Repository
Path: templates/templates.json
Sync Endpoint: POST /api/admin/sync-templates
Format: JSON array of template objects
```

**GitHub Templates Path:**
```
https://raw.githubusercontent.com/{owner}/{repo}/main/templates/templates.json
```

**Example templates.json structure:**
```json
[
  {
    "name": "Diwali Celebration",
    "slug": "diwali-celebration",
    "prompt": "Create a festive Diwali scene with {{celeb_name}}...",
    "description": "Perfect for Diwali greetings",
    "category": "festival",
    "tags": ["diwali", "festival", "celebration"],
    "sample": "https://example.com/sample.jpg"
  }
]
```

### Prompt Processing
```javascript
// Location: server/routes.ts (line 447)
// Placeholders in prompts are replaced dynamically
const prompt = template.prompt.replace(/\{\{celeb_name\}\}/g, celebrity.name);

// Example:
// Template: "Create a photo of {{celeb_name}} celebrating Diwali"
// Result: "Create a photo of Shah Rukh Khan celebrating Diwali"
```

---

## 🔌 API ENDPOINTS REFERENCE

### Public Endpoints
```
GET  /api/celebrities                    # List all celebrities
GET  /api/celebrities/search?q={query}   # Search celebrities
GET  /api/celebrities/:slug              # Get celebrity details
GET  /api/templates                      # List all templates
GET  /api/templates/:slug                # Get template details
GET  /api/github/celebrity-image/:slug   # Proxy celebrity image from GitHub
```

### Authenticated User Endpoints
```
POST /api/auth/login                     # Firebase login
POST /api/auth/logout                    # Logout
GET  /api/auth/user                      # Get current user

POST /api/generate                       # Generate AI photo (requires credits)
GET  /api/generations                    # Get user's generation history
GET  /api/generations/:id                # Get specific generation details

POST /api/celebrity-requests             # Submit celebrity request
```

### Admin Endpoints
```
POST   /api/auth/admin/login             # Admin login

# Celebrity Management
POST   /api/admin/celebrities            # Create celebrity
PATCH  /api/admin/celebrities/:id        # Update celebrity
DELETE /api/admin/celebrities/:id        # Delete celebrity

# Celebrity Request Management
GET    /api/admin/celebrity-requests     # List all requests
PATCH  /api/admin/celebrity-requests/:id/approve  # Approve request
PATCH  /api/admin/celebrity-requests/:id/reject   # Reject request
DELETE /api/admin/celebrity-requests/:id # Delete request

# Template Management
POST   /api/admin/templates              # Create template
PATCH  /api/admin/templates/:id          # Update template
DELETE /api/admin/templates/:id          # Delete template
POST   /api/admin/sync-templates         # Sync from GitHub

# Campaign Management
POST   /api/admin/campaigns              # Create campaign
DELETE /api/admin/campaigns/:id          # Delete campaign

# Analytics
GET    /api/admin/analytics              # Get platform analytics
```

### File Serving Endpoints
```
GET /uploads/{filename}                  # Serve uploaded/generated images
```

---

## 🎯 GENERATION WORKFLOW PATHS

### Complete AI Generation Flow
```
1. User Input
   ├── Upload Photo → uploads/{hash}
   ├── Select Celebrity → Database lookup
   └── Select Template → Database lookup

2. Processing
   ├── Fetch Celebrity Image → GitHub via proxy
   ├── Get Template Prompt → Database
   ├── Replace Placeholders → {{celeb_name}} → actual name
   └── Call Gemini AI → server/gemini.ts

3. AI Generation
   ├── Input: User photo path, Celebrity photo path, Prompt
   ├── Process: generateCelebrityPhoto()
   └── Output: uploads/generated/{id}.png

4. Post-Processing
   ├── Input: uploads/generated/{id}.png
   ├── Process: processGeneratedImage() (server/imageProcessor.ts)
   │   ├── Add margins
   │   ├── Crop to aspect ratio
   │   └── Add watermark ("FanAI" bottom-right, 60% opacity)
   └── Output: uploads/processed/{id}.png

5. Database Record
   ├── Table: generations
   ├── Fields:
   │   ├── userImageUrl: /uploads/{hash}
   │   ├── generatedImageUrl: /uploads/{id}.png
   │   ├── status: 'completed'
   │   └── timestamps
   └── User credits deducted
```

---

## 🔐 ENVIRONMENT VARIABLES

### Required Paths
```bash
# Database
DATABASE_URL=postgresql://...           # PostgreSQL connection string
SESSION_SECRET=...                      # Session encryption secret

# AI Services
GEMINI_API_KEY=...                     # Google Gemini AI API key

# External Services
GITHUB_TOKEN=...                       # GitHub personal access token

# Firebase Authentication
VITE_FIREBASE_API_KEY=...             # Firebase API key (client-side)
VITE_FIREBASE_PROJECT_ID=...          # Firebase project ID
VITE_FIREBASE_APP_ID=...              # Firebase app ID

# Admin Access
ADMIN_USER_ID=...                     # Admin username
ADMIN_PASSWORD=...                    # Admin password
```

---

## 📂 PROJECT STRUCTURE PATHS

### Frontend (Client)
```
client/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── admin/              # Admin panel components
│   │   └── ui/                 # Shadcn UI components
│   ├── pages/                  # Page components
│   │   ├── landing.tsx         # Landing page
│   │   ├── home.tsx           # Home page (authenticated)
│   │   ├── search.tsx         # Celebrity search
│   │   ├── celebrity.tsx      # Celebrity detail page
│   │   ├── generate.tsx       # AI generation page
│   │   ├── result.tsx         # Generation result page
│   │   ├── dashboard.tsx      # User dashboard
│   │   ├── admin.tsx          # Admin panel
│   │   ├── campaign.tsx       # Campaign page
│   │   ├── auth.tsx           # Authentication page
│   │   ├── terms.tsx          # Terms of service
│   │   └── privacy.tsx        # Privacy policy
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useFirebaseAuth.ts # Firebase auth hook
│   │   ├── use-toast.ts       # Toast notifications
│   │   └── use-mobile.tsx     # Mobile detection
│   ├── lib/                    # Utilities and configuration
│   │   ├── firebase.ts        # Firebase configuration
│   │   ├── queryClient.ts     # TanStack Query setup
│   │   ├── utils.ts           # Utility functions
│   │   └── theme-provider.tsx # Theme context
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles
└── index.html                 # HTML template
```

### Backend (Server)
```
server/
├── index.ts                    # Server entry point
├── routes.ts                   # API route definitions
├── db.ts                      # Database connection
├── storage.ts                 # Database operations layer
├── firebaseAuth.ts            # Firebase auth middleware
├── gemini.ts                  # Gemini AI integration
├── githubClient.ts            # GitHub API client
├── imageProcessor.ts          # Image processing (Sharp)
└── vite.ts                    # Vite dev server setup
```

### Shared
```
shared/
└── schema.ts                  # Shared database schema & types
```

### Configuration Files
```
vite.config.ts                 # Vite build configuration
tsconfig.json                  # TypeScript configuration
tailwind.config.ts             # Tailwind CSS configuration
postcss.config.js              # PostCSS configuration
drizzle.config.ts              # Database migration config
package.json                   # npm dependencies
.gitignore                     # Git ignore rules
```

---

## 🌐 CLIENT-SIDE ASSET PATHS

### Vite Configuration
```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve("client/src"),           # @/components/...
    "@shared": path.resolve("shared"),         # @shared/schema
    "@assets": path.resolve("attached_assets") # @assets/images/...
  }
}
```

### Import Path Examples
```typescript
// Component imports
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

// Schema imports
import { type Celebrity } from "@shared/schema"

// Asset imports
import logo from "@assets/logo.png"
```

---

## 📊 DATA FLOW SUMMARY

### Celebrity Data Flow
```
GitHub Repo (celebs/{slug}.jpg)
     ↓
Proxy Endpoint (/api/github/celebrity-image/{slug})
     ↓
Database (celebrities table: imageUrl field)
     ↓
Frontend (Celebrity components display via proxy URL)
```

### Template Data Flow
```
Option 1: Manual Creation
Admin Panel → POST /api/admin/templates → Database

Option 2: GitHub Sync
GitHub Repo (templates/templates.json)
     ↓
POST /api/admin/sync-templates
     ↓
Parse JSON & Insert/Update Database
     ↓
GET /api/templates → Frontend
```

### Generation Data Flow
```
User Input (Photo + Celebrity + Template)
     ↓
Upload → uploads/{hash}
     ↓
Validate & Create Generation Record (status: 'pending')
     ↓
Fetch Celebrity Image from GitHub
     ↓
Process Template Prompt (replace {{celeb_name}})
     ↓
Call Gemini AI (generateCelebrityPhoto)
     ↓
Save → uploads/generated/{id}.png
     ↓
Process Image (watermark, crop, margins)
     ↓
Save → uploads/processed/{id}.png
     ↓
Update Generation Record (status: 'completed')
     ↓
Deduct User Credits
     ↓
Return Result to User
```

---

## 🔧 IMPORTANT NOTES

### File Storage Considerations
- All uploaded files are stored locally in the `uploads/` directory
- Generated images persist on the server filesystem
- No CDN or cloud storage is currently configured
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)

### Database Path
- Database is PostgreSQL (Neon serverless)
- Connection uses WebSocket with custom SSL configuration for Replit environment
- Schema managed via Drizzle ORM
- Migrations: `npm run db:push`

### Celebrity Images
- **NOT stored locally** - fetched from GitHub repository
- Requires GITHUB_TOKEN for private repositories
- Proxied through server to avoid exposing token to client
- Cached for 24 hours client-side

### AI Generation
- Current implementation is DEMO/SIMULATION only
- Uses Gemini AI for image analysis, not actual face-swapping
- Creates side-by-side composite for MVP demonstration
- For production, integrate: Replicate, Stability AI, or Midjourney

---

## 📖 QUICK REFERENCE

### Most Common Paths
```bash
# Upload user photo
POST /api/generate (multipart/form-data)
→ File saved to: uploads/{hash}

# View generation result
GET /api/generations/{id}
→ Image at: /uploads/{id}.png

# Get celebrity image
GET /api/github/celebrity-image/{slug}
→ Proxied from: GitHub repo

# List templates
GET /api/templates
→ Source: PostgreSQL database

# Admin sync templates
POST /api/admin/sync-templates
→ Source: GitHub templates/templates.json
```

---

**Last Updated:** October 22, 2025  
**Application:** FanAI - AI Celebrity Photo Generation Platform
