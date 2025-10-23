# FanAI - Comprehensive Design Guidelines

## Design Approach

**Selected Approach**: Reference-based with modern AI platform aesthetics

**Primary References**: 
- Midjourney/Runway (AI generation platforms) - for sophisticated tech feel
- Instagram - for image-centric layouts and gallery displays
- Stripe - for clean payment flows and trust signals
- Linear - for modern typography and precise spacing

**Design Principles**:
- Premium yet accessible: Convey high-quality AI technology while remaining approachable
- Image-first: Every screen celebrates visual content
- Trust through polish: Perfect execution builds confidence for payment and celebrity association
- Delight in discovery: Make template browsing and result reveals exciting moments

## Core Design Elements

### A. Color Palette

**Light Mode**:
- Primary: 250 75% 55% (Vibrant purple-blue, AI/tech association)
- Primary Hover: 250 75% 48%
- Background: 0 0% 100% (Pure white for image clarity)
- Surface: 240 10% 98% (Subtle warm gray for cards)
- Text Primary: 240 15% 15% (Near-black with slight warmth)
- Text Secondary: 240 8% 45%
- Border: 240 10% 90%
- Success: 150 70% 45% (Generation complete states)

**Dark Mode**:
- Primary: 250 70% 60% (Brighter for dark backgrounds)
- Background: 240 15% 8% (Rich dark with purple undertone)
- Surface: 240 12% 12%
- Text Primary: 240 5% 95%
- Text Secondary: 240 5% 65%
- Border: 240 8% 20%

**Accent** (use sparingly for CTAs and highlights):
- Accent: 340 75% 55% (Energetic pink for key actions)

### B. Typography

**Font Families**:
- Headings: Inter (700, 600) - Modern, tech-forward
- Body: Inter (400, 500) - Excellent readability
- Mono: JetBrains Mono (for admin/technical sections)

**Scale**:
- Hero H1: text-6xl md:text-7xl font-bold (72-80px)
- Section H2: text-4xl md:text-5xl font-bold (48-60px)
- Card H3: text-2xl font-semibold (32px)
- Body Large: text-lg (18px)
- Body: text-base (16px)
- Caption: text-sm (14px)

### C. Layout System

**Spacing Primitives**: 
Use Tailwind units: 2, 4, 6, 8, 12, 16, 20, 24, 32

**Containers**:
- Full-width sections: w-full with inner max-w-7xl mx-auto px-6
- Content sections: max-w-6xl mx-auto
- Text content: max-w-2xl for readability

**Vertical Rhythm**:
- Section padding: py-16 md:py-24 lg:py-32
- Component spacing: space-y-8 to space-y-16
- Card padding: p-6 to p-8

### D. Component Library

**Navigation**:
- Fixed header with blur backdrop (backdrop-blur-lg bg-white/80 dark:bg-gray-900/80)
- Logo left, nav center, CTA + profile right
- Mobile: Slide-out menu with smooth transitions

**Celebrity Cards**:
- Aspect ratio: 3:4 portrait cards
- Hover: Subtle lift (translate-y-1) + shadow increase
- Image: Rounded-xl with gradient overlay at bottom for name
- Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6

**Template Cards**:
- Larger format: aspect-video or square
- Preview image prominent with template name overlay
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- Active state: Border glow with primary color

**Upload Interface**:
- Large drop zone: min-h-64 with dashed border-2 border-dashed
- Icon-driven: Upload cloud icon, clear file preview thumbnail
- Validation popup: Modal with 2-column grid (Good ✓ vs Bad ✗ examples)

**Result Display**:
- Full-screen modal or dedicated page
- Generated image: max-w-3xl centered with shadow-2xl
- Action buttons: Download, Share, Generate Another (prominent)
- Celebration micro-animation on reveal

**Admin Dashboard**:
- Sidebar navigation (240px) with icons
- Data tables: Stripe-inspired with hover states
- Stats cards: Grid with large numbers, trend indicators
- Forms: Clean, single-column with clear labels

**Payment Plans**:
- Card-based: 4 columns on desktop (stack on mobile)
- Highlight most popular: Scale 105%, border accent color
- Pricing: Large numbers, feature lists with checkmarks
- CTA buttons: Full-width within cards

### E. Imagery

**Hero Section**:
- Large hero image showing example generated photo (celebrity + user)
- Split layout: Left - headline/CTA, Right - showcase image carousel
- Height: min-h-screen with content centered

**Gallery Displays**:
- Masonry grid for template browsing (Pinterest-style)
- Lazy loading for performance
- Lightbox for full-screen template previews

**Celebrity Search Results**:
- Banner image from Google Search API at top
- Circular avatar for profile view
- Template grid below

**Watermark Style**:
- "FanAI" text bottom-right
- Size: 48px, opacity 60%
- Font: Inter Semi-bold
- Subtle drop shadow for visibility on varied backgrounds

## Page-Specific Guidelines

**Landing Page** (8 sections):
1. Hero: Split layout, generated photo showcase, search bar CTA
2. How It Works: 3-step process with icons and animations
3. Template Showcase: 6-8 featured templates in grid
4. Celebrity Gallery: Trending/popular celebs
5. Pricing Plans: 4-tier comparison cards
6. Campaign Feature: Dedicated section for politicians/influencers
7. Trust Signals: Sample results, user count, security badges
8. Footer: Rich with newsletter signup, social links, legal pages

**Search Results**: Google-inspired with instant results, celebrity cards grid, trending section

**Template Selection**: Hero banner of selected celebrity, filterable template grid (tags), preview on hover

**Upload Page**: Full-screen focused experience, validation popup prominent, progress indicator during processing

**Result Page**: Celebration moment - confetti animation, large image display, social sharing prominent, history sidebar

**Admin Panel**: Professional dashboard - sidebar nav, data tables, chart visualizations (analytics), drag-drop for template ordering

## Animations

Use sparingly and purposefully:
- Page transitions: Fade only (duration-200)
- Card hovers: Subtle lift + shadow (transition-all duration-300)
- Result reveal: Scale-in animation (scale-95 to scale-100)
- Loading states: Shimmer effect for image placeholders
- Success states: Brief checkmark animation

## Trust & Legal Elements

- SSL badge in footer
- "Powered by Gemini AI" badge (with permission)
- Payment security icons (Razorpay verified)
- Terms & Privacy links: Always visible in footer, modal-based display
- Disclaimer text: Subtle but present near generation button