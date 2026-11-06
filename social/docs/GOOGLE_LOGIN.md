# Google sign-in

Implemented as an OAuth authorization-code flow with PKCE, browser-bound single-use state, a nonce and verified Google ID-token signatures using `jose`. Tokens and the Google client secret stay on the Worker. Only `openid email profile` are requested; Gmail, contacts and Drive are not requested. Google access/refresh tokens are not stored.

## Configure the Google project

1. In Google Auth Platform, use a project dedicated to this Social app. Configure the consent screen with the actual app name, owner contact, homepage `https://beaconofunity.com/social`, privacy URL `https://beaconofunity.com/social/privacy` and terms URL `https://beaconofunity.com/social/terms`. No billing setup is needed by this implementation.
2. Create a **Web application** OAuth client. Authorized JavaScript origin: `https://beaconofunity.com`. Exact authorized redirect URI: `https://beaconofunity.com/social/api/auth/google/callback`.
3. Choose the intended external audience. While Google keeps the app in Testing, add the owner's Google accounts as test users; public login requires Google's appropriate production audience and any required verification. Do not claim general availability from a test-user sign-in alone.
4. As app admin, open `/social/admin` → **Private Google sign-in connection**. Paste the web client ID and secret into the private form, then save. The secret is AES-GCM encrypted with a distinct authenticated context using the existing Worker vault key. Never commit it or paste it in chat. Alternatively use Worker secrets `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Use a separate browser session to test Google sign-in. Verify the username/13+ rules screen for a new user, then sign out and back in. For an existing account, first sign in with its password and choose **Settings → Link Google account**. Verify the linked account signs into the same profile and retains its role and privacy settings.

Until credentials are configured, the Google button clearly says setup is pending and email/password sign-in remains available. Credential presence is not proof of correct Google console configuration; a real sign-in is required.

## Account behavior

- Google `sub`, not a mutable email address, identifies a linked account. No silent linking by matching email: an existing email account must authenticate first and link from Settings.
- Existing-account linking rechecks the originating session at callback, so logout, password reset, suspension and focus lock invalidate a pending link. One Google identity per app account, one app account per Google identity.
- New Google users choose a unique lowercase handle and explicitly accept the 13+ community rules before an account is created. They start as ordinary members. Their Google-verified email is marked verified.
- New Google accounts have an unguessable, unusable initial password. They can use email recovery to set a password once transactional email is connected. Google profile images are not imported.
- OAuth redirects do not bypass focus locks, blocks, suspension, private account checks or admin authorization. The existing strict app session cookie is unchanged; only a short-lived, scoped OAuth binding cookie uses SameSite=Lax for the return from Google.
- OAuth state/enrollment rows expire after ten minutes and are cleaned by the scheduled cleanup. Callback failures return a generic explanation without exposing codes or tokens. Provider endpoints are fixed Google URLs, and return paths are fixed app paths.

References: https://developers.google.com/identity/openid-connect/openid-connect and https://github.com/panva/jose .
