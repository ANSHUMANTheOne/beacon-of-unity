import React, { useEffect, useState, useRef } from "react";
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
let sdkPromise;
function loadGoogle() {
  if (window.google?.accounts?.id)
    return Promise.resolve(window.google.accounts.id);
  if (!sdkPromise)
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => resolve(window.google.accounts.id);
      script.onerror = () => {
        sdkPromise = null;
        script.remove();
        reject(
          new Error(
            "Google sign-in could not load. Check your connection or use email and password.",
          ),
        );
      };
      document.head.appendChild(script);
    });
  return sdkPromise;
}
export function GoogleButton({ link = false, ready = null }) {
  const [available, setAvailable] = useState(ready),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const container = useRef(null);
  useEffect(() => {
    if (ready === null)
      api("/auth/providers")
        .then((d) => setAvailable(d.google))
        .catch(() => setAvailable(false));
    else setAvailable(ready);
  }, [ready]);
  useEffect(() => {
    if (!available) return;
    let stopped = false;
    let resize;
    setLoading(true);
    Promise.all([
      loadGoogle(),
      api("/auth/google/start", {
        method: "POST",
        body: { mode: link ? "link" : "signin", flow: "identity" },
      }),
    ])
      .then(([google, start]) => {
        if (stopped || !container.current) return;
        google.initialize({
          client_id: start.client_id,
          nonce: start.nonce,
          auto_select: false,
          ux_mode: "popup",
          context: "signin",
          callback: async (response) => {
            if (stopped) return;
            setBusy(true);
            setError("");
            try {
              const result = await api("/auth/google/credential", {
                method: "POST",
                body: { state: start.state, credential: response.credential },
              });
              location.assign(result.redirect);
            } catch (e) {
              if (!stopped) {
                setError(e.message);
                setBusy(false);
              }
            }
          },
        });
        let previousWidth = 0;
        const render = () => {
          if (stopped || !container.current) return;
          const width = Math.min(
            400,
            Math.floor(container.current.clientWidth || 320),
          );
          if (width === previousWidth) return;
          previousWidth = width;
          container.current.replaceChildren();
          google.renderButton(container.current, {
            theme: "filled_black",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            locale: "en",
            width,
          });
        };
        render();
        resize = new ResizeObserver(render);
        resize.observe(container.current);
        setLoading(false);
      })
      .catch((e) => {
        if (!stopped) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      stopped = true;
      resize?.disconnect();
    };
  }, [available, link]);
  return (
    <div className="google-entry">
      {available ? (
        <>
          <div
            className={
              busy ? "google-official-button busy" : "google-official-button"
            }
            ref={container}
            aria-label={link ? "Link Google account" : "Continue with Google"}
          />
          {(loading || busy) && (
            <p className="fine" role="status">
              <Loader2 className="spin" size={14} />{" "}
              {busy
                ? "Confirming your Google account…"
                : "Loading Google sign-in…"}
            </p>
          )}
          {link && !loading && (
            <p className="fine">Choose the Google account you want to link.</p>
          )}
        </>
      ) : (
        <button type="button" className="google-button" disabled>
          <GoogleMark />
          Continue with Google
        </button>
      )}
      {available === false && (
        <p className="fine">
          Google sign-in is awaiting setup. Email and password are available.
        </p>
      )}
      {error && (
        <>
          <p className="form-error" role="alert">
            {error}
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => location.reload()}
          >
            Reload Google sign-in
          </button>
        </>
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
        <LockKeyhole size={17} /> Google sign-in setup
      </h3>
      <p className="muted">
        {status?.configured
          ? "Google client ID is configured. Test sign-in to confirm your Google origin and audience settings."
          : "Awaiting Google OAuth configuration."}
      </p>
      <p className="fine">
        Use a Google OAuth client of type Web application. Add this authorized
        JavaScript origin:
      </p>
      <code className="oauth-callback">
        {status?.origin || "https://beaconofunity.com"}
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

        <button className="primary" disabled={busy || !status?.vault_ready}>
          {busy && <Loader2 className="spin" size={15} />}Save Google connection
        </button>
      </form>
      <p className="fine">
        Google Identity Services uses your public client ID; no client secret is
        needed for this sign-in flow. Google must also have your consent screen
        and allowed audience configured. No Gmail or Drive permissions are
        needed.
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
