# Google Ads Conversion Tracking Setup

This guide walks you through setting up Google Ads conversion tracking for the Scenic Doors Pricing App.

## ⚠️ Important: GTM Implementation

**This app uses Google Tag Manager (GTM) to manage Google Ads conversion tracking.**

The conversion tracking is now handled through GTM's dataLayer, not direct `gtag()` calls. This means:

- ✅ All tracking tags are centralized in GTM
- ✅ You can add/modify tracking without code changes
- ✅ Better testing with GTM Preview Mode
- ✅ More flexible event tracking

### Quick Overview

1. **In Your Code (Already Done):**
   - Conversion events are pushed to `dataLayer` via `src/lib/analytics/googleAds.ts`
   - GTM scripts are installed in `src/app/layout.tsx`
   - No direct Google Ads scripts are loaded

2. **What You Need to Do:**
   - Configure Google Ads Conversion Tags in your GTM dashboard (see [GTM Setup Instructions](#gtm-setup-instructions) below)
   - Test with GTM Preview Mode
   - Publish your GTM container

---

## Overview

The app tracks lead submissions as conversions in Google Ads, allowing you to:

- Optimize ad campaigns based on actual leads
- Track ROI from Google Ads campaigns
- Use Smart Bidding strategies (Target CPA, Maximize Conversions, etc.)

## Required Environment Variables

Add these to your `.env.local` file (create it if it doesn't exist):

```bash
# Google Tag Manager (GTM) - Required
NEXT_PUBLIC_GTM_ID=GTM-KNLPJSS8

# Google Analytics 4 (if not already configured)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads (for reference - configure these in GTM, not as env vars)
# Note: These are NO LONGER used in the code. Configure them in your GTM dashboard instead.
# NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXXX
# NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=XXXXXXXXXXX
```

**Important:** Google Ads tracking is now managed in GTM, not via environment variables. You'll configure your Google Ads Conversion ID and Label directly in the GTM dashboard (see [GTM Setup Instructions](#gtm-setup-instructions) below).

## How to Find Your Google Ads Values

### 1. Google Ads Conversion ID (`NEXT_PUBLIC_GOOGLE_ADS_ID`)

1. Log into [Google Ads](https://ads.google.com/)
2. Click **Tools & Settings** (wrench icon) in the top right
3. Under **Measurement**, click **Conversions**
4. Click on any conversion action (or create one if you don't have any)
5. Click **Tag setup** > **Use Google tag** (or "Install the tag yourself")
6. Look for the conversion ID in the format: `AW-XXXXXXXXXX`
   - Example: `AW-123456789`

### 2. Google Ads Conversion Label (`NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL`)

1. In the same conversion action setup, look for the **Event snippet**
2. Find the line that looks like:
   ```javascript
   gtag('event', 'conversion', { send_to: 'AW-123456789/AbC-dEfGhIjK' })
   ```
3. The conversion label is everything after the slash: `AbC-dEfGhIjK`

### Alternative: Create a New Conversion Action

If you don't have a conversion action yet:

1. Go to **Tools & Settings** > **Conversions**
2. Click the **+ New conversion action** button
3. Select **Website**
4. Choose **Lead** as the category
5. Name it "Lead Form Submission" or similar
6. Set the value to whatever you estimate a lead is worth (or use 0)
7. Click **Create and continue**
8. Choose **Use Google tag** installation method
9. Copy the Conversion ID and Conversion Label from the tag code shown

---

## GTM Setup Instructions

Once you have your Google Ads Conversion ID and Label, follow these steps to configure tracking in GTM:

### Step 1: Access Your GTM Container

1. Log into [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container: **GTM-KNLPJSS8**
3. Make sure you're in the **Workspace** view

### Step 2: Create Data Layer Variables

These variables will pull conversion data from the dataLayer:

1. Go to **Variables** (left sidebar)
2. Scroll to **User-Defined Variables**
3. Click **New** and create each of these:

**Variable #1: Conversion Label**

- Click **Variable Configuration**
- Choose **Data Layer Variable**
- Data Layer Variable Name: `conversionLabel`
- Name the variable: `DLV - Conversion Label`
- Save

**Variable #2: Conversion Value**

- Variable Configuration: **Data Layer Variable**
- Data Layer Variable Name: `conversionValue`
- Name: `DLV - Conversion Value`
- Save

**Variable #3: Transaction ID**

- Variable Configuration: **Data Layer Variable**
- Data Layer Variable Name: `transactionId`
- Name: `DLV - Transaction ID`
- Save

**Variable #4: GCLID**

- Variable Configuration: **Data Layer Variable**
- Data Layer Variable Name: `gclid`
- Name: `DLV - GCLID`
- Save

**Variable #5: Currency**

- Variable Configuration: **Data Layer Variable**
- Data Layer Variable Name: `currency`
- Name: `DLV - Currency`
- Save

### Step 3: Create a Custom Event Trigger

This trigger will fire when a conversion is pushed to the dataLayer:

1. Go to **Triggers** (left sidebar)
2. Click **New**
3. Click **Trigger Configuration**
4. Choose **Custom Event**
5. Event name: `conversion`
6. **This trigger fires on:** All Custom Events
7. Name the trigger: `Custom Event - Conversion`
8. Save

### Step 4: Create Google Ads Conversion Tag

This is the main tag that sends conversion data to Google Ads:

1. Go to **Tags** (left sidebar)
2. Click **New**
3. Click **Tag Configuration**
4. Choose **Google Ads Conversion Tracking**
5. Fill in the configuration:
   - **Conversion ID:** Your Google Ads ID (e.g., `AW-123456789`)
   - **Conversion Label:** Use the variable `{{DLV - Conversion Label}}`
   - **Conversion Value:** `{{DLV - Conversion Value}}`
   - **Currency Code:** `{{DLV - Currency}}`
   - **Transaction ID:** `{{DLV - Transaction ID}}`
6. Click **Triggering**
7. Select the trigger: `Custom Event - Conversion`
8. Name the tag: `Google Ads - Lead Conversion`
9. Save

### Step 5: Test with GTM Preview Mode

Before publishing, test that everything works:

1. In GTM, click **Preview** (top right corner)
2. Enter your site URL: `http://localhost:3000` (or your staging URL)
3. Click **Connect**
4. A new tab will open with your site + GTM Debug panel
5. In your site, add `?gclid=TEST_GCLID_123` to the URL
6. Fill out and submit the lead form
7. In the GTM Preview panel, verify:
   - The `conversion` event appears in the event stream
   - Click on the `conversion` event
   - Check **Variables** tab - all your DLV variables should show values
   - Check **Tags** tab - `Google Ads - Lead Conversion` should show "Tag Fired"
8. If everything looks good, close the preview

### Step 6: Publish Your GTM Container

1. Click **Submit** (top right)
2. Add a Version Name: `Google Ads Conversion Tracking via dataLayer`
3. Add a Version Description: `Migrated from direct gtag() to GTM dataLayer implementation`
4. Click **Publish**

### Step 7: Verify in Production

After publishing:

1. Visit your production site with `?gclid=TEST_PRODUCTION_123`
2. Open browser DevTools > Console
3. Submit a lead form
4. Look for console log: `[Google Ads GTM] Conversion pushed to dataLayer`
5. Run in console: `console.log(window.dataLayer)` - you should see your conversion event
6. Wait 24-48 hours and check Google Ads for conversion data

---

## Testing the Implementation

### 1. Test in Development Mode (Before GTM Configuration)

1. Start your dev server:

   ```bash
   pnpm dev
   ```

2. Visit your site with a test gclid:

   ```
   http://localhost:3000/?gclid=TEST_GCLID_123
   ```

3. Fill out and submit the lead form

4. Open browser DevTools > Console and look for:

   ```
   [Google Ads GTM] Conversion pushed to dataLayer: {
     conversionLabel: "...",
     value: 0,
     gclid: "TEST_GCLID_123",
     transactionId: "...",
     currency: "USD"
   }
   ```

5. In the console, run: `console.log(window.dataLayer)`
   - You should see your conversion event with all the data

6. **Note:** At this point, the conversion data is being pushed to the dataLayer, but GTM won't fire the Google Ads tag until you complete the [GTM Setup Instructions](#gtm-setup-instructions) above

### 2. Verify in Google Ads (Production)

After deploying to production:

1. Submit a real test lead (or have someone click your ad and submit)
2. Wait 24-48 hours for data to appear
3. In Google Ads, go to **Tools & Settings** > **Conversions**
4. Check the conversion action - you should see conversions recorded

### 3. Use Google Tag Assistant

1. Install [Google Tag Assistant](https://tagassistant.google.com/) browser extension
2. Visit your site
3. Submit a lead form
4. Check the Tag Assistant to verify the conversion tag fired correctly

## How It Works

### Data Flow: Click → Lead → Conversion

1. **Attribution Capture**: When someone visits your site with a `gclid` parameter (from a Google Ad), it's automatically saved in the `scenic_attr` cookie by `src/lib/marketing/attribution.ts`

2. **Lead Submission**: When a user submits the lead form (`src/components/LeadIntakeForm.tsx`), the form handler:
   - Saves the lead to your database
   - Retrieves the stored attribution data (including `gclid`)
   - Calls `trackConversion()` with the conversion label and gclid

3. **GTM DataLayer Push**: The `src/lib/analytics/googleAds.ts` utility:
   - Pushes the conversion event to `window.dataLayer`
   - Includes all conversion data: label, value, gclid, transaction ID
   - Logs debug info in development mode

4. **GTM Tag Firing**: Google Tag Manager:
   - Listens for the `conversion` event in the dataLayer
   - Fires the Google Ads Conversion Tag you configured
   - Sends the conversion to Google Ads with proper attribution

5. **Google Ads Processing**: Google Ads receives the conversion and:
   - Attributes it to the correct ad click using the gclid
   - Updates your campaign conversion metrics
   - Uses the data for Smart Bidding optimization

## Troubleshooting

### "Conversion not showing in Google Ads"

- **Wait 24-48 hours**: Conversions can take time to appear
- **Check GTM Preview**: Use GTM Preview Mode to verify the conversion event fires
- **Verify GTM Container Published**: Make sure you published your GTM container after configuration
- **Check dataLayer**: In browser console, run `console.log(window.dataLayer)` to see if the event is pushed
- **Use Tag Assistant**: Install Google Tag Assistant to debug tag firing

### "Conversion event in dataLayer but tag not firing in GTM"

- **Check your trigger**: Make sure the trigger is set to fire on event name `conversion` (exact match, case-sensitive)
- **Verify variables**: In GTM Preview, check that your Data Layer Variables are pulling values correctly
- **Check tag configuration**: Ensure the Google Ads Conversion Tag has the correct Conversion ID and Label
- **Look for GTM errors**: In GTM Preview panel, check for any error messages

### "No gclid in conversion"

- This is normal if the visitor didn't come from a Google Ad
- Only visitors who click your Google Ads will have a gclid
- Test by adding `?gclid=TEST_123` to your URL manually
- The conversion will still fire, just without attribution to a specific ad

### "dataLayer is undefined"

- GTM should automatically create `window.dataLayer`
- Check browser console for script loading errors
- Verify the GTM script is in `src/app/layout.tsx`
- Try disabling ad blockers
- Make sure `NEXT_PUBLIC_GTM_ID` environment variable is set

### "Conversion tracked multiple times"

- The code only fires once per successful lead submission
- If you're testing, clear cookies between tests
- Check that you're not submitting the same form multiple times
- In GTM, verify your trigger isn't firing on unintended events

### "GTM Preview Mode won't connect"

- Make sure you're using the same browser for both GTM and your site
- Disable ad blockers temporarily
- Try in an incognito/private window
- Check that your site allows third-party cookies for tagmanager.google.com

## Files Modified

- ✅ `src/lib/analytics/googleAds.ts` - Migrated to GTM dataLayer (no longer calls gtag directly)
- ✅ `src/app/layout.tsx` - Added GTM scripts, removed Google Ads direct scripts
- ✅ `src/components/LeadIntakeForm.tsx` - Still calls `trackConversion()` (no changes needed)
- ✅ `src/lib/marketing/attribution.ts` - Already capturing gclid (no changes needed)

## Benefits of GTM Implementation

### Why We Migrated to GTM

**Before (Direct Implementation):**

- ❌ Had to deploy code changes to add/modify tracking
- ❌ Multiple tracking scripts loaded separately (GTM, GA4, Google Ads)
- ❌ Difficult to debug what tags are firing
- ❌ Required environment variables for each tracking platform

**After (GTM Implementation):**

- ✅ Add/modify tracking tags in GTM without code deployments
- ✅ Single GTM script manages all tracking
- ✅ GTM Preview Mode shows exactly what's happening
- ✅ Centralized tag management in one dashboard
- ✅ Easy to add more conversion types later (e.g., button clicks, page views)
- ✅ Better performance (GTM optimizes script loading)

### What You Can Do Now

With GTM in place, you can easily:

1. **Add More Conversion Types**: Track button clicks, form starts, video views, etc.
2. **A/B Test Tracking**: Test different conversion values or labels
3. **Add More Platforms**: Easily add Facebook Pixel, LinkedIn Insight, etc.
4. **Set Up Enhanced Conversions**: Capture hashed email/phone for better attribution
5. **Create Custom Events**: Track any user behavior without code changes
6. **Use GTM Templates**: Install pre-built integrations from GTM Gallery

## Production Deployment

1. Add environment variables to your hosting provider:
   - Vercel: Project Settings > Environment Variables
   - Firebase Hosting: Use `firebase functions:config:set`
   - Other: Follow your platform's env var setup

2. Deploy your changes:

   ```bash
   git add .
   git commit -m "Add Google Ads conversion tracking"
   git push
   ```

3. Verify the environment variables are set in production

4. Test with a real ad click and lead submission

## Google Ads Optimization Tips

Once conversion tracking is working:

1. **Wait for data**: Let at least 15-30 conversions accumulate
2. **Switch to Smart Bidding**: Try Target CPA or Maximize Conversions
3. **Create conversion-based columns**: Add conversion metrics to your campaign view
4. **Set up conversion value rules**: If some leads are more valuable than others
5. **Use conversion-based audiences**: Retarget users who converted

## Support

If you encounter issues:

- Check the browser console for `[Google Ads]` log messages
- Use Google Tag Assistant to debug tag firing
- Review Google Ads Help: [About conversion tracking](https://support.google.com/google-ads/answer/1722022)
