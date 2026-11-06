# Private large uploads

Without external storage, the app retains its 8 MiB/file D1 limit. Connecting a dedicated **private Backblaze B2 bucket** enables files up to 1 GiB (1,073,741,824 bytes), in resumable 8 MiB parts. Long-form Videos are deferred; photos, Stories and Reels remain.

The live Create form can prepare a smaller sharing copy locally from a larger source. Photos optimize automatically and videos have an explicit Compress video action. A successful prepared file can use the existing live D1 path if it fits 8 MiB; no B2 account is needed for that path. See [compression behavior and limits](COMPRESSION.md). Text encoding alone does not reduce storage requirements.

## Free account setup

1. Create a B2 account at https://www.backblaze.com/sign-up/cloud-storage . Its signup advertises no credit card required. Complete your own password, CAPTCHA and email verification privately.
2. Create a dedicated private bucket. Do not enable public access. Set its lifecycle to abort unfinished multipart uploads after one day. Keep the account dedicated to this app so other buckets do not consume its free allowance.
3. Create an application key restricted to this bucket and the `social/` prefix, with read, write and delete access (including bucket read/ACL access). Copy its key ID, application key, bucket name and S3 endpoint into **Social admin → Private media storage**. Never commit these values or send them in chat. The connection checks private ACL and a write/read/delete probe before saving encrypted credentials.
4. Upload a photo, pause/resume an upload, reload and reselect the same original file, publish for moderation, and test private media access with another account. Repeat with a 1 GiB test file before announcing large uploads publicly.

Backblaze includes 10 GB total storage free, not unlimited free storage. The app reserves a maximum 8 GiB globally and 2 GiB per member, counting incomplete uploads. That keeps this app below the decimal 10 GB storage tier, with headroom. Provider pricing and free allowances can change. B2-to-Cloudflare transfer is covered by their Bandwidth Alliance; all private reads are signed and streamed through the Worker without public caching. See https://www.backblaze.com/cloud-storage/pricing and https://www.backblaze.com/docs/cloud-storage-cloudflare-integrations .

Only confirmed parts are resumed; the browser stores an upload ID plus a bounded file fingerprint, never storage keys. A selected file is still required after reload. Browser storage restrictions can prevent cross-reload resumption. Files remain unreadable and unpostable until the server confirms the completed size. Three concurrent part leases globally bound Worker buffering. Cancel deletes the exact object version or aborts the multipart upload before releasing the reservation. Daily orphan cleanup retries failures without dropping quota reservations.

Credentials are AES-GCM encrypted with the existing Worker-only `EMAIL_SETTINGS_KEY`, using a distinct storage context. Do not rotate that master key without migrating existing encrypted settings. Do not change buckets while stored media exists.

Automated tests transfer a full 1 GiB through the multipart implementation against a mock S3 provider, including authorization, quota, cancellation, completion recovery, and private ranges. This is not a live Backblaze acceptance test; that requires a connected account.
