# Google Maps API Setup Instructions

## Error: ApiNotActivatedMapError

This error occurs when the required Google Maps APIs are not enabled for your API key. Follow these steps to fix it:

## Step 1: Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Navigate to **APIs & Services** > **Library**
4. Search for and enable the following APIs:
   - **Maps JavaScript API** (Required for displaying maps)
   - **Places API** (Required for address autocomplete)
   - **Geocoding API** (Required for address search)

## Step 2: Verify API Key Restrictions

1. Go to **APIs & Services** > **Credentials**
2. Click on your API key (`AIzaSyDB_pCpkj2IdboZ44RnAxR-5kzXzJoh2Xk`)
3. Under **API restrictions**, ensure:
   - Either "Don't restrict key" is selected, OR
   - The following APIs are explicitly allowed:
     - Maps JavaScript API
     - Places API
     - Geocoding API

## Step 3: Verify Application Restrictions (if any)

If you have application restrictions set:
- Ensure your domain/website is allowed
- For development: Add `localhost` to allowed referrers
- For production: Add your production domain

## Step 4: Wait for Propagation

After enabling APIs, wait 1-5 minutes for changes to propagate.

## Step 5: Test

Refresh your browser and try creating/editing an event. The map should now load properly.

## Fallback Option

If you cannot enable the APIs immediately, you can still use the form by:
1. Entering coordinates manually in the Latitude and Longitude fields
2. The coordinates will be saved with the event
3. The map view will work once APIs are enabled

## Need Help?

- [Google Maps API Documentation](https://developers.google.com/maps/documentation/javascript)
- [API Error Messages](https://developers.google.com/maps/documentation/javascript/error-messages)
- [Enable APIs Guide](https://developers.google.com/maps/documentation/javascript/cloud-setup)

