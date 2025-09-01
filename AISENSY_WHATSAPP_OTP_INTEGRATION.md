# AiSensy WhatsApp OTP Integration

This document explains the integration of AiSensy WhatsApp OTP service to replace Firebase phone authentication in the PlayGram enrollment system.

## Overview

We've replaced Firebase SMS-based OTP with AiSensy's WhatsApp-based OTP system for better user experience and reliability in the Indian market.

## Key Benefits

- **WhatsApp Integration**: Users receive OTP codes via WhatsApp messages instead of SMS
- **Better Delivery**: WhatsApp messages have higher delivery rates than SMS in India
- **User Familiarity**: Most users are comfortable with WhatsApp
- **No reCAPTCHA**: Eliminates the need for reCAPTCHA verification
- **Cost Effective**: More affordable than traditional SMS services

## Implementation Details

### 1. AiSensy Service (`src/services/aisensyOTP.ts`)

The main service handles:
- OTP generation (6-digit random codes)
- WhatsApp message sending via AiSensy API
- Session management and verification
- Rate limiting and security measures

### 2. Updated Components

**PhoneAuthStep** (`src/components/enrollment/steps/PhoneAuthStep.tsx`):
- Replaced Firebase service with AiSensy service
- Removed reCAPTCHA initialization
- Updated error handling for WhatsApp-specific scenarios

**OTPVerificationStep** (`src/components/enrollment/steps/OTPVerificationStep.tsx`):
- Updated UI to reflect WhatsApp messaging
- Added WhatsApp icons and green color scheme
- Updated help text and messaging

### 3. Configuration

```typescript
const AISENSY_CONFIG = {
  apiKey: 'your-aisensy-api-key',
  baseUrl: 'https://backend.aisensy.com/campaign/t1/api/v2',
  campaignName: 'Playgram-Authentication'
};
```

## AiSensy API Integration

### API Endpoint
```
POST https://backend.aisensy.com/campaign/t1/api/v2
```

### Request Payload
```json
{
  "apiKey": "your-api-key",
  "campaignName": "Playgram-Authentication",
  "destination": "+919876543210",
  "userName": "PlayGram User",
  "source": "PlayGram Enrollment",
  "templateParams": ["123456"],
  "tags": ["otp-verification"],
  "attributes": {
    "enrollment_step": "phone_verification",
    "otp_timestamp": "2025-01-16T10:30:00Z"
  }
}
```

### Response
```json
{
  "status": "success",
  "message": "Campaign sent successfully"
}
```

## Security Features

1. **Rate Limiting**: 1 OTP per minute per phone number
2. **Session Expiry**: OTP codes expire after 5 minutes
3. **Attempt Limiting**: Maximum 3 verification attempts per session
4. **Phone Number Validation**: Ensures proper format with country code
5. **Session Storage**: Secure local storage of OTP sessions

## Phone Number Format

The service automatically formats phone numbers:
- Accepts: `9876543210`, `919876543210`, `+919876543210`
- Converts to: `+919876543210`
- Defaults to India (+91) if no country code provided

## Development Mode

In development environment:
- OTP codes are logged to console for testing
- Mock sessions are created even if API calls fail
- No actual WhatsApp messages are sent (unless API is properly configured)

## Testing

Use the test file `src/test-aisensy-otp.html` to verify the integration:

1. Open the test file in a browser
2. Enter a phone number
3. Click "Send WhatsApp OTP"
4. Check console for generated OTP code
5. Enter the OTP to verify

## AiSensy Campaign Setup

Before using this integration, ensure you have:

1. **AiSensy Account**: Sign up at https://app.aisensy.com
2. **API Key**: Generate from AiSensy dashboard (Manage > API Key)
3. **WhatsApp Template**: Create and approve a template message for OTP
4. **API Campaign**: Create an API campaign with the approved template

### Template Message Example
```
Your PlayGram verification code is {{1}}. This code will expire in 5 minutes. Do not share this code with anyone.
```

## Error Handling

The service handles various error scenarios:

- **Network Errors**: Graceful fallback with user-friendly messages
- **API Errors**: Proper error parsing and user notification
- **Rate Limiting**: Clear messaging about wait times
- **Invalid Phone Numbers**: Format validation and correction
- **Expired Sessions**: Automatic cleanup and user guidance

## Migration from Firebase

The integration maintains compatibility with existing Firebase interfaces:

- `ConfirmationResult` interface is implemented for seamless replacement
- Same method signatures for `sendOTP()` and `verifyOTP()`
- Error codes follow Firebase patterns for consistent error handling

## Production Deployment

For production deployment:

1. Update `AISENSY_CONFIG.apiKey` with your production API key
2. Ensure your AiSensy campaign is live and approved
3. Test with real phone numbers to verify WhatsApp delivery
4. Monitor API usage and quotas in AiSensy dashboard

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Verify the API key in AiSensy dashboard
2. **Campaign Not Found**: Ensure campaign name matches exactly
3. **Template Not Approved**: WhatsApp templates must be approved before use
4. **Phone Number Format**: Ensure proper country code format
5. **Rate Limiting**: Respect the 1-minute cooldown between requests

### Debug Information

Enable debug logging by checking the browser console for:
- `🔑 Generated OTP Code: XXXXXX`
- `📤 Sending AiSensy API request`
- `✅ AiSensy API response`
- `❌ AiSensy API error`

## Support

For AiSensy-specific issues:
- Documentation: https://wiki.aisensy.com/
- Support: Contact AiSensy support team
- API Reference: https://wiki.aisensy.com/en/articles/11501889-api-reference-docs

For integration issues:
- Check browser console for detailed error messages
- Verify API key and campaign configuration
- Test with the provided test HTML file