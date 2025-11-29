# Google Maps Setup for Live Tracking

## 🗺️ Get Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for Maps API, but has free tier)

### Step 2: Enable Required APIs
1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - **Maps JavaScript API**
   - **Geocoding API** (optional, for address lookup)

### Step 3: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key

### Step 4: Restrict API Key (Recommended)
1. Click on your API key to edit it
2. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add: `http://localhost:3000/*` (for development)
   - Add your production domain when deploying
3. Under **API restrictions**:
   - Select **Restrict key**
   - Choose: Maps JavaScript API, Geocoding API
4. Save

### Step 5: Add to Environment Variables

Add this line to your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Example:**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 6: Restart Development Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## 💰 Pricing (Free Tier)

Google Maps offers **$200 free credit per month**, which includes:
- **28,000 map loads per month** (free)
- **40,000 geocoding requests per month** (free)

For a small tour company, this should be more than enough!

## 🧪 Testing Without API Key

If you don't want to set up Google Maps right now, the component will show an error but won't crash. You can test other features first.

## ✅ Verify Setup

Once you add the API key:
1. Restart your dev server
2. Navigate to a tour with active tracking
3. You should see the Google Map load with markers

## 🔒 Security Notes

- Never commit your API key to Git
- Always restrict your API key to specific domains
- Use environment variables (`.env.local`)
- The `.env.local` file is already in `.gitignore`

## 📚 Documentation

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)
