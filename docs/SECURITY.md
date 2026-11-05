# Non-destructive security review

The original admin page checks Firebase authentication and an allowed UID list before showing the admin UI. A client-side check is not a backend authorization boundary. Firestore/Storage security rules, deployed Firebase configuration, and server-side admin authorization are not present here and could not be verified. The owner should verify those rules using unauthorized accounts before treating sensitive operations or records as protected.

Dashboard, login and admin source contain an existing Firebase browser API key. Its value is intentionally omitted from this report. Browser configuration is not by itself proof of a leaked server secret; check API restrictions, permitted domains, quotas, App Check and backend authorization in the provider console. No keys were rotated or removed. Pattern-based scanning of both branch tips found no private-key blocks, GitHub tokens, AWS access keys or JWT-shaped credentials. This is not an exhaustive historical secret scan.

The admin UI and account application are excluded from README navigation. Their existing URLs and application logic are unchanged. Public HTML and source remain inspectable. Preventing access requires backend or edge authorization and a separately approved behavior change; hiding filenames, robots rules, CSS or encryption keys shipped to browsers does not provide that protection.

The only added active workflow has `contents: read`, no deployment permission and no secrets. Build output is restricted to the original manifest plus `.nojekyll`. No environment files or new audit metadata are published by default.
