# SmartWatt - Forgot Password Flow

This document outlines the architecture and user flow for the "Forgot Password" feature implemented in the SmartWatt web application.

## Overview

We use **Supabase Authentication** to handle the secure password reset process. Instead of emailing a reset link that the user must click (which can be problematic with certain email clients or if opened on a different device), we utilize an **OTP (One-Time Password) / 6-digit PIN code** flow.

When the OTP is verified successfully, Supabase securely logs the user in, giving them the necessary session to update their password on the `/reset-password` page.

## Detailed Flow

### 1. Request OTP (Email Step)

- **Location:** `/forgot-password` (Step 1)
- **Action:** The user enters their email address and clicks "Send Code".
- **Under the hood:**
  The client component calls `supabase.auth.signInWithOtp()` with the `shouldCreateUser: false` option. This ensures that a 6-digit OTP is sent only if the email belongs to an existing registered user.
- **UI Feedback:** A success message "Code sent! Check your email." is displayed, and the UI shifts to the Verification step.

### 2. Verify OTP (Verification Step)

- **Location:** `/forgot-password` (Step 2)
- **Action:** The user enters the 6-digit code received in their email.
- **Under the hood:**
  The component calls `supabase.auth.verifyOtp({ email, token: otp, type: "email" })`.
  If the OTP matches, the Supabase client successfully authenticates the user and creates an active session.
- **UI Feedback:** Upon success, the UI displays "Verified! Redirecting..." and routes the user to `/reset-password`.

### 3. Set New Password

- **Location:** `/reset-password`
- **Prerequisite:** The user must be authenticated (which they are, having just verified the OTP).
- **Action:** The user enters a new password and confirms it.
- **Under the hood:**
  The page calls `supabase.auth.updateUser({ password: newPassword })` to securely overwrite the existing password.
- **UI Feedback:** The user receives a success message ("Password updated successfully! Redirecting...") and is redirected to the `/login` page, or straight to `/home` depending on internal application logic.

## Why OTP instead of a Magic Link?

1. **Seamless Cross-Device Experience:** A user can request the code on their mobile app/desktop, check their email on another device, and type the 6-digit code back on the original device without losing their place.
2. **Reduced Email Provider Issues:** Some strict enterprise email clients "pre-fetch" or automatically click links in emails to scan them for malware, which can accidentally consume single-use magic links before the user clicks them.
3. **Better UX:** Keeps the user within the original tab/app rather than bouncing them out to their email client and back in a new tab.

## Relevant Files

- `src/app/forgot-password/page.tsx` - Email and OTP request & verification UI.
- `src/app/reset-password/page.tsx` - The actual password update component.
- `src/lib/supabase/client.ts` - The Supabase client initialization.
