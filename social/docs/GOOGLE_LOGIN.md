# Google sign-in

The default UI uses Google's official **Google Identity Services** button and a JavaScript credential callback. Only the **public web client ID** is needed: no client secret or access/refresh token is needed for basic sign-in. The ID token is posted over HTTPS to the Worker, which validates Google's signature, issuer, audience, expiration, verified email and a fresh nonce. Browser-bound single-use state and same-origin POST checks protect against login CSRF and replay.

## Configure

1. In Google Auth Platform, choose a **Web application** client. Its authorized JavaScript origin must include https://beaconofunity.com. The popup/JavaScript flow does not require a redirect URI. Preserve unrelated clients and site routes.
2. Configure the actual app name, owner contact, authorized domain, homepage, privacy and terms in Google Console. Preserve valid existing project settings. For a Testing audience, add intended test users and check actual restrictions before promising public availability.
3. Set Worker variable GOOGLE_CLIENT_ID, or save the public ID through **Admin ? Google sign-in setup**. The current deployment uses the app-specific **Beacon Social Web** client in the owner's Google project. Saved admin settings override the environment fallback. Client IDs are public identifiers, not secrets.
4. Test from a separate browser session. New users choose a lowercase handle and accept the 13+ rules before an app account is created. Existing users first sign in with their current password and choose **Settings ? Link Google account**. Verify Google sign-in returns to that same account.

The Google library loads only where its button is needed. It does not automatically show One Tap or silently choose an account. No Gmail, Drive, contacts or other Google API access is requested. A registered client ID alone does not prove the origin/consent configuration works: test the real chooser and server sign-in.

## Security and behavior

- Google sub, not email, identifies a linked account. Existing email accounts never silently merge with an unlinked Google account: authenticate to the existing app account first.
- Linking rechecks the originating session. Logout, password reset, suspension and a focus lock invalidate pending linking. One Google identity per app account, one app account per Google identity.
- New Google accounts start as ordinary members with Google-verified email and an unguessable initial password. They can set a password through email recovery after transactional email is connected.
- Focus locks, privacy, blocks and admin checks remain enforced. Google does not confer admin privileges or prove age. The 13+ checkbox is self-declaration.
- JWTs are never logged or stored. Nonce/state records expire after ten minutes and are periodically cleaned. Tokens require fixed Google signing-key endpoints and the configured client audience.
- CSP permits Google's required GIS script, style, frame and connection paths. Cross-Origin-Opener-Policy: same-origin-allow-popups supports the popup fallback. The app session remains HttpOnly, Secure and SameSite=Strict.
- Admin-saved settings use AES-GCM with a distinct authenticated context. No client secret is collected by the default UI. Existing optional server authorization-code integrations can retain a server-only GOOGLE_CLIENT_SECRET; that separate API still validates PKCE, nonce and state.

References: https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid , https://developers.google.com/identity/gsi/web/guides/verify-google-id-token and https://github.com/panva/jose .
