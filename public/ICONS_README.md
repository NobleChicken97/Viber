# Icon Assets Guide

This directory requires the following icon files for the PWA (Progressive Web App) to function properly.

## Required Icons

### 1. **icon-192.png** (192x192 pixels)
- Standard PWA icon for mobile devices
- Used in: manifest.json, app shortcuts
- Background: Should match your brand color (#1a1a1a)
- Design: Simple, recognizable logo/icon

### 2. **icon-512.png** (512x512 pixels)
- High-resolution PWA icon
- Used in: manifest.json, splash screens
- Background: Should match your brand color
- Design: Same as icon-192.png but higher resolution

### 3. **apple-icon.png** (180x180 pixels)
- Apple Touch Icon for iOS devices
- Used in: layout.tsx metadata
- Background: Should be opaque (no transparency)
- Design: Simple icon that works well on iOS home screen

### 4. **og-image.png** (1200x630 pixels)
- Open Graph image for social media sharing
- Used in: layout.tsx metadata (Twitter, Facebook, LinkedIn)
- Design: Attractive preview image with app name and tagline
- Text-safe area: Keep important elements in center 1200x600

### 5. **favicon.ico** (32x32 pixels, multi-size)
✅ **Already exists** at `src/app/favicon.ico`

## How to Create Icons

### Option 1: Using Figma/Design Tool
1. Design your logo in a square canvas (512x512)
2. Export at required sizes
3. Ensure proper padding (10-15% around edges)
4. Use PNG format with transparency (except apple-icon)

### Option 2: Using Online Tools
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://progressier.com/pwa-icons-generator)
- Upload one high-res icon (1024x1024) and generate all sizes

### Option 3: Quick Placeholder (Development Only)
Run this PowerShell script to create colored placeholder icons:

```powershell
# This requires ImageMagick or similar tool installed
# For development only - replace with real icons before production!

# If you don't have tools, you can use online generators:
# https://favicon.io/favicon-generator/
```

## Design Guidelines

### Color Scheme (from app)
- Primary: #8b5cf6 (Purple)
- Background: #0a0a0a (Dark)
- Surface: #1a1a1a (Darker Gray)

### Icon Design Tips
- ✅ Simple, bold shapes
- ✅ Works in monochrome
- ✅ Recognizable at small sizes
- ✅ Padding on all sides
- ❌ Avoid thin lines
- ❌ Avoid complex gradients
- ❌ Avoid text (unless logo)

## Testing Icons

After adding icons:

1. **Clear cache**: Hard refresh (Ctrl+Shift+R)
2. **Test PWA install**: 
   - Chrome: Settings → Install Viber
   - Check home screen icon appears correctly
3. **Test social sharing**:
   - Use [Open Graph Debugger](https://www.opengraph.xyz/)
   - Verify og-image.png appears correctly

## Current Status

- [x] favicon.ico - ✅ EXISTS
- [ ] icon-192.png - ⚠️ MISSING
- [ ] icon-512.png - ⚠️ MISSING
- [ ] apple-icon.png - ⚠️ MISSING
- [ ] og-image.png - ⚠️ MISSING

**Action Required**: Add these 4 icon files before deploying to production.
