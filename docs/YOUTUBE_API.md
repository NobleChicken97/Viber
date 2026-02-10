# YouTube API Setup Guide

Viber uses the YouTube Data API v3 to fetch real-time music data and enhance the listening experience.

## Getting Your API Key

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it "Viber" or similar
   - Click "Create"

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Restrict the API Key** (Recommended for security)
   - Click on the API key you just created
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"

## Adding the Key to Viber

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_actual_api_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

## What the API Enables

With the YouTube API configured, Viber can:

- ✅ Fetch accurate song titles and artist names
- ✅ Get video thumbnails for visual display
- ✅ Retrieve exact song durations
- ✅ Validate video IDs to ensure playability
- ✅ Search for additional music

Without the API key, Viber will:
- ⚠️ Use fallback data from local playlists
- ⚠️ Display generic thumbnails
- ⚠️ Use estimated durations

## API Quota Limits

The YouTube Data API v3 has a daily quota of **10,000 units** by default (free tier).

**Viber's Usage:**
- Fetching video details: ~1 unit per video
- Typical session (12 songs): ~12-15 units
- Expected daily usage: ~100-500 units (well within limit)

You can monitor your quota usage in the Google Cloud Console under "APIs & Services" → "Dashboard".

## Troubleshooting

### "YouTube API key not configured"
- Make sure `.env.local` exists in the project root
- Verify the variable name is exactly `NEXT_PUBLIC_YOUTUBE_API_KEY`
- Restart the dev server after adding the key

### "API key is invalid"
- Check that you copied the entire key correctly
- Ensure the YouTube Data API v3 is enabled for your project
- Verify the API key restrictions (if any) allow your domain

### "Quota exceeded"
- You've hit the daily 10,000 unit limit
- Wait until the quota resets (midnight Pacific Time)
- Or request a quota increase in Google Cloud Console

## Production Deployment

For production (Vercel, Netlify, etc.):

1. Add `NEXT_PUBLIC_YOUTUBE_API_KEY` to your deployment platform's environment variables
2. Consider setting up API key restrictions for your production domain
3. Monitor API usage through Google Cloud Console

## Need Help?

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Viber GitHub Issues](https://github.com/NobleChicken97/Viber/issues)
