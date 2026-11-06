# SendPulse email connection

Chosen provider: SendPulse's free transactional/SMTP Basic plan. The official pricing page currently lists **12,000 emails per month**, **50 messages per hour**, two sending domains, API access, and no credit card required: https://sendpulse.com/pricing/smtp . This is a sending allowance; API request throughput is a separate limit. No paid plan or top-up is enabled by this app.

## Owner steps

1. Create the free provider account at https://login.sendpulse.com/registration/ and complete its email/SMS verification. The initial automated registration attempt did not submit because the provider kept its button disabled. Do not assume an account has been created.
2. Activate **SMTP / Transactional emails**. SendPulse requires an application/activation step before SMTP sending works. Describe the actual use: account verification and password recovery for the Social pilot at beaconofunity.com, triggered by the account owner, with no purchased mailing lists.
3. Add and verify a sender address or sending domain. For `hello@beaconofunity.com`, add the exact DKIM/SPF records supplied by SendPulse in the domain's DNS dashboard. Do not overwrite the website's A/CNAME records or replace existing MX records. If SPF already exists, merge authorized includes into that one record instead of creating a second SPF record. Domain DNS changes require separate DNS-write access; the app's email-provider key cannot change Cloudflare DNS.
4. Under **Settings → API → API keys**, generate a static key for this application. The current SendPulse API accepts `Authorization: Bearer <key>`. Do not enter the SMTP password in place of an API key.
5. Sign in as an administrator at https://beaconofunity.com/social/admin. Find **Private email connection**. Enter the key, sender name, and the verified sender email, then save.
6. Send a test to your account email from the same panel. A successful API response means the provider accepted the message, not that the mailbox received it. Confirm it arrives in the inbox or spam folder.
7. Test **Settings → Send confirmation email**, follow the link, then test password recovery with a separate test account. The reset token expires after 30 minutes and resets existing sessions.

Never paste keys, passwords or reset links into chat, a GitHub issue, or a pull request. The private admin form is authenticated, checks admin roles and request origin, and does not return the stored key.

## Credential storage

The API key is sealed with AES-256-GCM using a random IV and authenticated context, then stored in D1 `app_settings`. Its independent encryption key is the Worker secret `EMAIL_SETTINGS_KEY`. The master key is not in source, build output, the database, or the source ZIP. Database access alone does not reveal the provider key. Cloudflare account administrators with access to the Worker can still operate the service; this is not protection against the infrastructure owner.

For another deployment, first generate 32 cryptographically random bytes, encode as 64 lowercase hexadecimal characters, and install them through `wrangler secret put EMAIL_SETTINGS_KEY`. Keep that value stable once settings exist. Rotating it without re-encrypting the configuration makes the previous configuration unreadable; reconnect the provider with a new API key if necessary. Do not commit the value.

The alternative server secret `SENDPULSE_API_KEY` is supported when deploying without the admin form; set `EMAIL_SENDER_ADDRESS` and `EMAIL_SENDER_NAME` with it. Legacy `RESEND_API_KEY` configurations remain supported as a fallback. Provider credentials are never Vite variables.

## Sending safeguards

The app atomically reserves one hourly and monthly send allowance in D1. It rejects requests beyond 50/hour or 12,000/calendar month, and rolls back counters for immediate provider rejection. It does not quietly queue recovery emails for hours or charge for extra volume. Main Beacon approval emails use a persistent outbox and share this same budget; excess approval mail waits for the next window. See [approval email operations](APPROVAL_EMAIL.md). Other applications sharing the same SendPulse account can use the same provider allowance; the provider remains the final authority for total account limits.

Provider signup, SMTP activation, verified sender/domain records, and a successful delivery test must all be completed before claiming email is operational. User registration and password login continue to work while email is not configured. Confirmation and recovery routes fail explicitly rather than pretending to send.

References: https://sendpulse.com/integrations/api (static-key authentication), https://sendpulse.com/integrations/api/smtp (SMTP activation and send payload).
