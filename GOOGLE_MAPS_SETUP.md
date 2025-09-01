# Google Maps Integration Setup Guide

## 🗺️ Google Maps API Configuration

This guide will help you set up Google Maps integration for enhanced location functionality in the enrollment modal.

## 📋 Prerequisites

1. **Google Cloud Console Account**
2. **Google Maps API Key**
3. **Enabled APIs**

## 🔧 Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Note your project ID

### Step 2: Enable Required APIs

Enable these APIs in Google Cloud Console:

1. **Maps JavaScript API**
   - Go to APIs & Services → Library
   - Search for "Maps JavaScript API"
   - Click "Enable"

2. **Places API** (Optional - for enhanced location search)
   - Search for "Places API"
   - Click "Enable"

3. **Geocoding API** (Optional - for address conversion)
   - Search for "Geocoding API"
   - Click "Enable"

### Step 3: Create API Key

1. Go to **APIs & Services → Credentials**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"API key"**
4. Copy the generated API key
5. **Important**: Restrict the API key for security

### Step 4: Restrict API Key (Security)

1. Click on your API key to edit
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Add these referrers:
     - `http://localhost:*/*` (for development)
     - `https://yourdomain.com/*` (for production)

3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Choose the APIs you enabled above

### Step 5: Add to Environment Variables

Add your API key to `.env.local`:

```env
# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Example:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBvOkBwgGlbUiuS-mLKFm-IYgtHdOJzQEk
```

## 🧪 Testing the Integration

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Location Features

1. **Open Enrollment Modal**
   - Go to any sport page
   - Click "Enroll Now"

2. **Test Map Functionality**
   - Click "View Map" button
   - Map should load with location markers
   - Click markers to see location details

3. **Test Location Detection**
   - Click "Find Nearest" button
   - Allow location access when prompted
   - Your location should appear on map

### 3. Browser Console Verification

Check browser console for these messages:
- `✅ Google Maps API loaded successfully`
- `✅ Map initialized successfully`

## 🚨 Troubleshooting

### Common Issues

#### "Google Maps API not loaded"
**Cause**: API key missing or invalid
**Solution**: 
1. Check `.env.local` file has correct API key
2. Restart development server
3. Verify API key in Google Cloud Console

#### "Map fails to load"
**Cause**: API restrictions or billing issues
**Solution**:
1. Check API key restrictions
2. Ensure billing is enabled in Google Cloud
3. Verify domain is in allowed referrers

#### "Location access denied"
**Cause**: Browser location permission denied
**Solution**:
1. Enable location access in browser settings
2. Use HTTPS in production (required for geolocation)

### Debug Commands

```javascript
// Check if Google Maps is loaded (Browser Console)
console.log('Google Maps available:', typeof google !== 'undefined');

// Check API key
console.log('API Key configured:', !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

// Test map service
googleMapsService.isAvailable();
```

## 💰 Pricing Information

### Google Maps Pricing
- **Maps JavaScript API**: $7 per 1,000 requests
- **Free Tier**: $200 credit per month (≈28,500 map loads)
- **Places API**: $17 per 1,000 requests (if used)

### Cost Optimization Tips
1. **Restrict API Key**: Prevent unauthorized usage
2. **Cache Results**: Reduce repeated API calls
3. **Monitor Usage**: Set up billing alerts
4. **Optimize Requests**: Only load maps when needed

## 🔒 Security Best Practices

### API Key Security
1. **Never commit API keys** to version control
2. **Use environment variables** for all keys
3. **Restrict by domain** in production
4. **Monitor usage** regularly
5. **Rotate keys** periodically

### Domain Restrictions
```
# Development
http://localhost:*/*
http://127.0.0.1:*/*

# Production
https://yourdomain.com/*
https://www.yourdomain.com/*
```

## 📱 Mobile Considerations

### Responsive Design
- Maps automatically adapt to mobile screens
- Touch gestures supported (pinch, pan)
- Location detection works on mobile browsers

### Performance
- Maps load asynchronously
- Markers are optimized for mobile
- Reduced API calls on mobile networks

## 🚀 Production Deployment

### Before Going Live
1. ✅ Update API key restrictions for production domain
2. ✅ Enable billing in Google Cloud Console
3. ✅ Test all location features
4. ✅ Set up usage monitoring and alerts
5. ✅ Verify HTTPS is enabled (required for geolocation)

### Environment Variables
```env
# Production .env
VITE_GOOGLE_MAPS_API_KEY=your_production_api_key
```

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify API key configuration
3. Test with a fresh API key
4. Check Google Cloud Console for usage/errors

## ✅ Features Enabled

With this setup, you get:
- 📍 **Interactive Map**: View all training locations
- 🎯 **Location Detection**: Find nearest centers automatically
- 🗺️ **Directions**: Get directions to selected locations
- 📱 **Mobile Friendly**: Works on all devices
- 🔍 **Location Search**: Enhanced location selection
- 📊 **Distance Calculation**: See distances to all locations

The Google Maps integration is now ready for production use! 🎉