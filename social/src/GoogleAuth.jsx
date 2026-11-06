import React, { useEffect, useState } from "react";
import { api } from "./api";
import { Loader2, LockKeyhole, Check } from "lucide-react";
import "./google-auth.css";

function GoogleMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.6c3.9-3.6 6.1-8.9 6.1-15.1Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.2c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20.4 20.4 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.4a12 12 0 0 1 0-7.7v-5.3H5.8a20 20 0 0 0 0 18.3l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 11.3c3 0 5.6 1 7.7 3l5.8-5.8A19.5 19.5 0 0 0 24 3 20.4 20.4 0 0 0 5.8 14.4l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
      />
    </svg>
  );
}
export function GoogleButton({ link = false, ready = null }) {
  const [available, setAvailable] = useState(ready),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (ready === null)
      api("/auth/providers")
        .then((d) => setAvailable(d.google))
        .catch(() => setAvailable(false));
    else setAvailable(ready);
  }, [ready]);
  return (
    <div className="google-entry">
      <button
        type="button"
        className="google-button"
        disabled={busy || available !== true}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            const d = await api("/auth/google/start", {
              method: "POST",
              body: { mode: link ? "link" : "signin" },
            });
            location.assign(d.url);
          } catch (e) {
            setError(e.message);
            setBusy(false);
          }
        }}
      >
        {busy ? <Loader2 className="spin" size={19} /> : <GoogleMark />}
        {link ? "Link Google account" : "Continue with Google"}
      </button>
      {available === false && (
        <p className="fine">
          Google sign-in is awaiting setup. Email and password are available.
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function GoogleAccount({ execute, notify }) {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    execute(async () => setStatus(await api("/auth/google/status")));
    const state = new URLSearchParams(location.hash.slice(1)).get("google");
    if (state) {
      notify(
        state === "linked"
          ? "Google account linked. You can use it next time you sign in."
          : "Google could not be linked. Check that it is not already linked to another account, then try again.",
      );
      history.replaceState({}, "", location.pathname);
    }
  }, []);
  return (
    <section className="settings-card">
      <h3>Google sign-in</h3>
      <p className="muted">
        Link Google to this account to sign in without typing your password.
        Only your basic profile and email are requested.
      </p>
      {status?.linked ? (
        <p className="google-linked">
          <Check size={17} />
          Google account linked
        </p>
      ) : (
        <GoogleButton link ready={status?.configured ?? false} />
      )}
    </section>
  );
}
export function GoogleEnrollment({ UsernameField, setUser, nav }) {
  const [pending, setPending] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/auth/google/pending")
      .then(setPending)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <main className="google-onboarding">
      <a className="wordmark" href="/social/">
        social<span>●</span>
      </a>
      <span className="eyebrow">A LITTLE INTRODUCTION</span>
      <h1>Make yourself at home.</h1>
      <p className="muted">
        Your Google account is confirmed. Choose how people find you here.
      </p>
      {pending && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const d = Object.fromEntries(new FormData(e.currentTarget));
            d.terms = d.terms === "on";
            try {
              const r = await api("/auth/google/complete", {
                method: "POST",
                body: d,
              });
              setUser(r.user);
              nav("home");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="google-identity">
            <Check size={16} />
            {pending.email}
          </p>
          <label className="field">
            <span>Your name</span>
            <input
              name="display_name"
              defaultValue={pending.display_name}
              required
              maxLength={60}
              autoComplete="name"
            />
          </label>
          <UsernameField />
          <label className="check-field">
            <input name="terms" type="checkbox" required />{" "}
            <span>
              I am 13 or older and accept the{" "}
              <a href="/social/terms" target="_blank" rel="noopener noreferrer">
                community rules
              </a>{" "}
              and{" "}
              <a
                href="/social/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy notice
              </a>
              .
            </span>
          </label>
          <button className="primary wide" disabled={busy}>
            {busy && <Loader2 className="spin" size={16} />}Create account
          </button>
        </form>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <a className="guest-link" href="/social/login">
        Back to sign in
      </a>
    </main>
  );
}
export function GoogleSettings({ execute, notify }) {
  const [status, setStatus] = useState(null),
    [busy, setBusy] = useState(false);
  const load = () => execute(async () => setStatus(await api("/admin/google")));
  useEffect(() => {
    load();
  }, []);
  return (
    <section className="settings-card">
      <h3>
        <LockKeyhole size={17} /> Private Google sign-in connection
      </h3>
      <p className="muted">
        {status?.configured
          ? "Google credentials are configured. Test sign-in to verify the Google console settings."
          : "Awaiting Google OAuth configuration."}
      </p>
      <p className="fine">
        Use a Google OAuth client of type Web application. Add this exact
        authorized redirect URI:
      </p>
      <code className="oauth-callback">
        {status?.callback_url ||
          "https://beaconofunity.com/social/api/auth/google/callback"}
      </code>
      <form
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          setBusy(true);
          const r = await execute(() =>
            api("/admin/google", {
              method: "POST",
              body: Object.fromEntries(new FormData(form)),
            }),
          );
          if (r) {
            form.reset();
            notify(r.message);
            await load();
          }
          setBusy(false);
        }}
      >
        <label className="field">
          <span>Google web client ID</span>
          <input
            name="client_id"
            required
            maxLength={254}
            placeholder="…apps.googleusercontent.com"
          />
        </label>
        <label className="field">
          <span>Google client secret</span>
          <input
            name="client_secret"
            type="password"
            autoComplete="new-password"
            minLength={16}
            maxLength={4096}
            required
            placeholder="Stored privately on the server"
          />
        </label>
        <button className="primary" disabled={busy || !status?.vault_ready}>
          {busy && <Loader2 className="spin" size={15} />}Save Google connection
        </button>
      </form>
      <p className="fine">
        The secret is encrypted on the server and never returned by this panel.
        Google Cloud must also have your consent screen and allowed audience
        configured. No Gmail or Drive permissions are needed.
      </p>
      <a
        href="https://console.cloud.google.com/auth/clients"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Google Auth Platform
      </a>
    </section>
  );
}
