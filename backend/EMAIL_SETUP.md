# Email Service Setup - Password Reset

This document describes the environment variables required for the password reset email functionality.

## Required Environment Variables

Add these to your `backend/.env` file:

```bash
# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@animenation.in

# Frontend URL (for reset links)
FRONTEND_BASE_URL=http://localhost:5173
```

## Getting Resend API Key

1. Go to [Resend.com](https://resend.com/)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key and add it to your `.env` file

## Domain Configuration

1. In Resend dashboard, add your domain (e.g., animenation.in)
2. Verify your domain by adding DNS records
3. Once verified, update `RESEND_FROM_EMAIL` to use your verified domain

## Development Mode

In development mode (NODE_ENV != production), the forgot-password endpoint will return the reset token in the response for testing purposes:

```json
{
  "ok": true,
  "message": "If the email exists, a reset link has been sent.",
  "reset_token": "abc123...",
  "reset_link": "http://localhost:5173/reset-password?token=abc123..."
}
```

## Production Mode

In production mode, emails are actually sent and the token is not returned in the response for security.

## Testing Without Email Service

If you don't have a Resend API key configured, the system will:
- Log the email content to console
- Return success response (to prevent user enumeration)
- In development, still return the token for testing

## Security Notes

- Reset tokens expire in 30 minutes
- Rate limiting: 3 requests per 15 minutes per IP
- User enumeration is prevented (always returns success)
- Tokens are stored in database (not hashed for simplicity, but could be enhanced)
