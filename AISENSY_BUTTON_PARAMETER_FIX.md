# AiSensy Button Parameter Issue Fix

## Problem
Error: "Button at index 0 of type Url requires a parameter"

This error occurs when your AiSensy WhatsApp template has a URL button that requires a parameter, but the API call doesn't provide the required parameter.

## Root Cause
Your WhatsApp template in AiSensy has been configured with a URL button that expects a dynamic parameter, but our API payload is not providing the correct parameters.

## Solution

### Option 1: Update Template Parameters (Recommended)

Update your environment variable to specify the template type:

```env
# In .env.local
VITE_AISENSY_TEMPLATE_TYPE=simple
```

This will send only the OTP code as a parameter: `[otpCode]`

### Option 2: Provide URL Parameter

If your template requires a URL parameter, set:

```env
# In .env.local
VITE_AISENSY_TEMPLATE_TYPE=with_url
```

This will send both OTP code and URL: `[otpCode, "https://playgram.in/verify"]`

### Option 3: Fix Template in AiSensy Dashboard

1. Go to your AiSensy dashboard
2. Navigate to Templates
3. Find your "Playgram-Authentication" template
4. Edit the template to either:
   - Remove the URL button entirely (simplest)
   - Make the URL button static (no parameter needed)
   - Ensure the parameter structure matches our API call

## Template Examples

### Simple Template (No Buttons)
```
Your PlayGram verification code is {{1}}. This code will expire in 5 minutes. Do not share this code with anyone.
```

### Template with Static URL Button
```
Your PlayGram verification code is {{1}}. This code will expire in 5 minutes.

[Button: Visit PlayGram] -> https://playgram.in (static URL)
```

### Template with Dynamic URL Button
```
Your PlayGram verification code is {{1}}. This code will expire in 5 minutes.

[Button: Verify Now] -> {{2}} (dynamic URL parameter)
```

## Testing the Fix

1. Update your environment variable
2. Restart your development server
3. Test the OTP flow
4. Check browser console for success messages
5. Verify WhatsApp message delivery (if in production)

## Debugging Steps

1. **Check Template Configuration**:
   - Log into AiSensy dashboard
   - Review your template structure
   - Note any buttons and their parameter requirements

2. **Verify API Payload**:
   - Check browser console for the API request payload
   - Ensure `templateParams` array matches template requirements

3. **Test Different Configurations**:
   - Try `VITE_AISENSY_TEMPLATE_TYPE=simple` first
   - If that fails, try `VITE_AISENSY_TEMPLATE_TYPE=with_url`
   - Check AiSensy dashboard for delivery status

## Current Implementation

The service now automatically handles both scenarios:

```typescript
// Determine template parameters based on template type
let templateParams: string[];
if (AISENSY_CONFIG.templateType === 'with_url') {
  // Template with URL button: [OTP_CODE, URL_PARAMETER]
  templateParams = [otpCode, 'https://playgram.in/verify'];
} else {
  // Simple template: [OTP_CODE]
  templateParams = [otpCode];
}
```

## Error Recovery

The service includes automatic retry logic:

1. First attempt with configured parameters
2. If button parameter error occurs, retry with simple parameters
3. Fallback to development mode if all attempts fail

## Recommended Template Structure

For best results, use a simple template without buttons:

```
🔐 *PlayGram Verification*

Your verification code is: *{{1}}*

⏰ This code expires in 5 minutes
🔒 Keep this code secure and don't share it

Welcome to PlayGram! 🏆
```

This avoids button parameter issues entirely while providing a clean user experience.

## Production Checklist

- [ ] Template approved in AiSensy
- [ ] Template parameters match API payload
- [ ] Environment variables configured correctly
- [ ] Test with real phone numbers
- [ ] Monitor AiSensy dashboard for delivery status
- [ ] Check error logs for any remaining issues

## Support

If issues persist:
1. Check AiSensy dashboard for template approval status
2. Verify API key permissions
3. Contact AiSensy support for template configuration help
4. Review browser console for detailed error messages