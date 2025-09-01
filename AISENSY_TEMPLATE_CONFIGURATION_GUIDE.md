# AiSensy Template Configuration Guide

## Problem: "Button at index 0 of type Url requires a parameter"

This error occurs when your WhatsApp template has a URL button that expects a parameter, but the API call doesn't provide it correctly.

## Quick Fix Options

### Option 1: Remove URL Button (Recommended)
1. Go to AiSensy Dashboard → Templates
2. Find your "Playgram-Authentication" template
3. Edit the template
4. Remove the URL button entirely
5. Save and re-submit for approval

**Template Example:**
```
🔐 *PlayGram Verification*

Your verification code is: *{{1}}*

⏰ This code expires in 5 minutes
🔒 Keep this code secure and don't share it

Welcome to PlayGram! 🏆
```

### Option 2: Use Static URL Button
1. Edit your template in AiSensy
2. Change the URL button to use a static URL (no {{}} placeholders)
3. Set URL to: `https://playgram.in`

**Template Example:**
```
🔐 *PlayGram Verification*

Your verification code is: *{{1}}*

⏰ This code expires in 5 minutes

[Button: Visit PlayGram] → https://playgram.in
```

### Option 3: Configure Dynamic URL Correctly
If you need a dynamic URL button, ensure your template is structured like this:

**Template Structure:**
```
🔐 *PlayGram Verification*

Your verification code is: *{{1}}*

⏰ This code expires in 5 minutes

[Button: Verify Now] → {{2}}
```

Then update your environment:
```env
VITE_AISENSY_TEMPLATE_TYPE=with_url
```

## Step-by-Step AiSensy Dashboard Fix

### 1. Access Template Editor
1. Login to AiSensy Dashboard
2. Navigate to **Templates** section
3. Find **"Playgram-Authentication"** template
4. Click **Edit** or **Modify**

### 2. Check Current Template Structure
Look for these elements:
- **Header**: Optional
- **Body**: Contains `{{1}}` for OTP code
- **Footer**: Optional
- **Buttons**: This is where the issue is!

### 3. Fix Button Configuration

**If you see a URL button:**
- **Type**: URL
- **Text**: "Visit Website" or similar
- **URL**: `{{1}}` or `{{2}}` (this causes the error!)

**Choose one fix:**

#### Fix A: Remove Button
- Click the **X** or **Delete** next to the button
- Save template

#### Fix B: Make URL Static
- Change URL from `{{2}}` to `https://playgram.in`
- Save template

#### Fix C: Keep Dynamic URL
- Ensure URL is `{{2}}` (second parameter)
- Body should use `{{1}}` for OTP
- Update code to send both parameters

### 4. Template Examples

#### ✅ Simple Template (No Buttons)
```
Header: PlayGram Verification
Body: Your verification code is {{1}}. Valid for 5 minutes.
Footer: Keep this code secure.
Buttons: None
```

#### ✅ Template with Static Button
```
Header: PlayGram Verification  
Body: Your verification code is {{1}}. Valid for 5 minutes.
Footer: Keep this code secure.
Buttons: 
  - Type: URL
  - Text: "Visit PlayGram"
  - URL: https://playgram.in (static)
```

#### ✅ Template with Dynamic Button
```
Header: PlayGram Verification
Body: Your verification code is {{1}}. Valid for 5 minutes.  
Footer: Keep this code secure.
Buttons:
  - Type: URL
  - Text: "Verify Now"
  - URL: {{2}} (dynamic)
```

## Code Configuration

### For Simple Template (No Buttons)
```env
VITE_AISENSY_TEMPLATE_TYPE=simple
```

### For Template with Dynamic URL
```env
VITE_AISENSY_TEMPLATE_TYPE=with_url
```

## Testing Your Fix

### 1. Test with HTML File
```bash
# Open test file
open src/test-aisensy-otp.html
```

### 2. Check Console Logs
Look for these messages:
- `✅ AiSensy OTP sent successfully`
- `🔄 Retrying with different parameter combinations`
- `❌ AiSensy API error`

### 3. Verify in AiSensy Dashboard
1. Go to **Campaigns** → **API Campaigns**
2. Find your campaign
3. Check **Campaign Messages** for delivery status
4. Look for successful sends vs errors

## Common Template Issues

### ❌ Wrong Parameter Count
```
Body: Your OTP is {{1}}
Button URL: {{1}}  // Wrong! This should be {{2}}
```

### ❌ Missing Parameter
```
Body: Your OTP is {{1}}
Button URL: {{2}}  // But only sending 1 parameter in API
```

### ✅ Correct Structure
```
Body: Your OTP is {{1}}
Button URL: {{2}}  // And sending [otpCode, urlParam] in API
```

## WhatsApp Button Types

WhatsApp supports 3 button types:

1. **Quick Reply**: User can tap to send a predefined response
2. **Call**: Opens phone dialer with number
3. **URL**: Opens a website link

For OTP verification, **Quick Reply** or **no buttons** work best.

## Recommended Template

For maximum compatibility and simplicity:

```
🔐 *PlayGram Verification*

Hi {{1}},

Your verification code is: *{{2}}*

⏰ This code expires in 5 minutes
🔒 Keep this code secure and don't share it

Welcome to PlayGram! 🏆
```

**Parameters:**
1. `{{1}}` = User name
2. `{{2}}` = OTP code

**API Call:**
```javascript
templateParams: ["PlayGram User", otpCode]
```

## Troubleshooting Checklist

- [ ] Template approved in AiSensy
- [ ] Button configuration matches parameter count
- [ ] Environment variables set correctly
- [ ] API key has proper permissions
- [ ] Campaign is live and active
- [ ] Phone number format is correct (+91XXXXXXXXXX)

## Support Resources

- **AiSensy Documentation**: https://wiki.aisensy.com/
- **WhatsApp Template Guidelines**: https://developers.facebook.com/docs/whatsapp/message-templates
- **Template Approval Process**: Check AiSensy dashboard for approval status

## Need Help?

If you're still getting the error:
1. Share your exact template structure from AiSensy dashboard
2. Check the browser console for detailed error messages
3. Verify template approval status
4. Test with a simple template first (no buttons)

The simplest solution is usually to remove the URL button entirely for OTP verification use cases.