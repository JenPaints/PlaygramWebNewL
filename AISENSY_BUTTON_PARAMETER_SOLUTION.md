# AiSensy Button Parameter Solution

## Problem Solved ✅
**Error**: "Button at index 0 of type Url requires a parameter"

This error occurs when your WhatsApp template has a URL button with a dynamic placeholder (like `{{2}}`), but the API call doesn't provide the parameter in the correct position.

## Root Cause Analysis
Your AiSensy WhatsApp template structure likely looks like this:

```
Header: PlayGram Verification
Body: Your verification code is {{1}}. Valid for 5 minutes.
Footer: Keep this code secure.
Button: [Visit PlayGram] → {{2}}  // This {{2}} needs a parameter!
```

## Solution Implemented

### 1. **Correct Parameter Mapping**
The service now correctly maps parameters based on template structure:

```typescript
// Template types and their parameter mapping:
switch (templateType) {
  case 'simple':
    // "Your OTP is {{1}}"
    templateParams = [otpCode];
    break;
    
  case 'with_url':
    // "Your OTP is {{1}}. Click: {{2}}"
    templateParams = [otpCode, 'https://playgram.in/verify'];
    break;
    
  case 'with_greeting':
    // "Hi {{1}}, your OTP is {{2}}. Click: {{3}}"
    templateParams = ['PlayGram User', otpCode, 'https://playgram.in/verify'];
    break;
}
```

### 2. **Smart Auto-Detection**
If the initial attempt fails, the service automatically tries different parameter combinations:

1. **Standard Format**: `[OTP, URL]` - Most common
2. **With Greeting**: `[Name, OTP, URL]` - If template has greeting
3. **Simple Format**: `[OTP]` - Fallback without URL
4. **Alternative Order**: `[URL, OTP]` - Less common but possible

### 3. **Environment Configuration**
Set the correct template type in your `.env.local`:

```env
# Choose the correct type for your template:
VITE_AISENSY_TEMPLATE_TYPE=with_url        # Most likely for your case
# VITE_AISENSY_TEMPLATE_TYPE=simple        # If no URL button
# VITE_AISENSY_TEMPLATE_TYPE=with_greeting # If template has greeting
```

## How to Determine Your Template Type

### Method 1: Check AiSensy Dashboard
1. Go to AiSensy Dashboard → Templates
2. Find "Playgram-Authentication" template
3. Count the `{{}}` placeholders:
   - **1 placeholder** (`{{1}}`) = `simple`
   - **2 placeholders** (`{{1}}`, `{{2}}`) = `with_url`
   - **3 placeholders** (`{{1}}`, `{{2}}`, `{{3}}`) = `with_greeting`

### Method 2: Use Diagnostic Tool
```bash
open src/test-aisensy-template-diagnostic.html
```
Click "Test All Configurations" to see which one works.

## Template Examples

### ✅ Simple Template (No URL Button)
```
🔐 PlayGram Verification

Your verification code is {{1}}.
This code expires in 5 minutes.

Keep this code secure.
```
**Configuration**: `VITE_AISENSY_TEMPLATE_TYPE=simple`

### ✅ Template with URL Button
```
🔐 PlayGram Verification

Your verification code is {{1}}.
This code expires in 5 minutes.

[Button: Verify Now] → {{2}}
```
**Configuration**: `VITE_AISENSY_TEMPLATE_TYPE=with_url`

### ✅ Template with Greeting + URL
```
🔐 PlayGram Verification

Hi {{1}},

Your verification code is {{2}}.
This code expires in 5 minutes.

[Button: Verify Now] → {{3}}
```
**Configuration**: `VITE_AISENSY_TEMPLATE_TYPE=with_greeting`

## Testing Your Fix

### 1. Quick Test
```bash
# Set the template type
echo 'VITE_AISENSY_TEMPLATE_TYPE=with_url' >> .env.local

# Test the integration
open src/test-aisensy-otp.html
```

### 2. Check Console Logs
Look for these success messages:
```
✅ AiSensy OTP sent successfully
📤 Sending AiSensy API request: {...}
🔑 Development OTP code: 123456
```

### 3. Verify in AiSensy Dashboard
1. Go to Campaigns → API Campaigns
2. Find "Playgram-Authentication"
3. Check message delivery status
4. Look for successful sends vs errors

## Common Template Patterns

| Template Structure | Parameters Needed | Configuration |
|-------------------|-------------------|---------------|
| `Your OTP: {{1}}` | `[otpCode]` | `simple` |
| `Your OTP: {{1}}. Visit: {{2}}` | `[otpCode, url]` | `with_url` |
| `Hi {{1}}, OTP: {{2}}` | `[name, otpCode]` | `with_greeting` |
| `Hi {{1}}, OTP: {{2}}, Visit: {{3}}` | `[name, otpCode, url]` | `with_greeting` |

## Troubleshooting

### Still Getting the Error?

1. **Check Template Approval**:
   - Ensure template is approved in AiSensy
   - Verify campaign is live

2. **Use Diagnostic Tool**:
   ```bash
   open src/test-aisensy-template-diagnostic.html
   ```

3. **Try Manual Configuration**:
   ```env
   # Try each type one by one:
   VITE_AISENSY_TEMPLATE_TYPE=simple
   VITE_AISENSY_TEMPLATE_TYPE=with_url
   VITE_AISENSY_TEMPLATE_TYPE=with_greeting
   ```

4. **Check Browser Console**:
   - Look for detailed error messages
   - Check the exact API payload being sent
   - Verify parameter count matches template

### Alternative: Fix Template in AiSensy

If you want to avoid parameter complexity:

1. **Remove URL Button**:
   - Edit template in AiSensy dashboard
   - Remove the URL button entirely
   - Use `VITE_AISENSY_TEMPLATE_TYPE=simple`

2. **Use Static URL**:
   - Change button URL from `{{2}}` to `https://playgram.in`
   - Use `VITE_AISENSY_TEMPLATE_TYPE=simple`

## Success Indicators

✅ **You'll know it's working when you see**:
- No "Button parameter" errors in console
- `✅ AiSensy OTP sent successfully` message
- WhatsApp message delivered (in production)
- OTP verification works in your app

❌ **Still having issues if you see**:
- "Button at index 0 of type Url requires a parameter"
- "Template parameter count mismatch"
- API 400/422 errors from AiSensy

## Production Checklist

- [ ] Template approved in AiSensy dashboard
- [ ] Correct `VITE_AISENSY_TEMPLATE_TYPE` set
- [ ] API key has proper permissions
- [ ] Campaign is live and active
- [ ] Test with real phone numbers
- [ ] Monitor AiSensy dashboard for delivery status

## Support

If you're still having issues:
1. Share your exact template structure from AiSensy dashboard
2. Check browser console for the exact API payload
3. Use the diagnostic tool to identify the working configuration
4. Verify template approval status in AiSensy

The solution should now handle your URL button parameter requirement correctly! 🎉