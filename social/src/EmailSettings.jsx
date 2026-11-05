import React, { useState, useEffect } from "react";
import { api } from "./api";
import { LockKeyhole, ArrowUpRight, Loader2 } from "lucide-react";
export default function EmailSettings({ execute, notify }) {
  const [status, setStatus] = useState(null),
    [busy, setBusy] = useState(false);
  const load = () => execute(async () => setStatus(await api("/admin/email")));
  useEffect(() => {
    load();
  }, []);
  return (
    <section className="settings-card">
      <h3>
        <LockKeyhole size={17} /> Private email connection
      </h3>
      <p className="muted">
        SendPulse Free: 12,000 transactional emails per month, up to 50 per
        hour. No paid upgrade is enabled by this app.
      </p>
      {status && (
        <div className="email-status">
          <span>
            {status.configured
              ? "Connected to " + status.provider
              : "Not connected yet"}
          </span>
          <small>
            {status.hourly_used} / {status.hourly_limit} this hour ·{" "}
            {status.monthly_used} / {status.monthly_limit} this month
          </small>
          {status.sender && <small>Sending as {status.sender}</small>}
        </div>
      )}
      <p className="fine">
        Create the free account, activate its SMTP service, verify your sender,
        and generate a static key in SendPulse Settings → API → API keys. Enter
        it here, never in chat or GitHub. It is encrypted before database
        storage using a separate server secret.
      </p>
      <form
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          const el = e.currentTarget;
          setBusy(true);
          const d = Object.fromEntries(new FormData(el));
          const result = await execute(() =>
            api("/admin/email", { method: "POST", body: d }),
          );
          if (result) {
            el.querySelector("[name=api_key]").value = "";
            notify(result.message);
            load();
          }
          setBusy(false);
        }}
      >
        <label className="field">
          <span>SendPulse static API key</span>
          <input
            name="api_key"
            aria-label="SendPulse static API key"
            type="password"
            autoComplete="new-password"
            required
            minLength={20}
            maxLength={4096}
            placeholder="Stored privately on the server"
          />
        </label>
        <div className="email-sender-fields">
          <label className="field">
            <span>Sender name</span>
            <input
              name="sender_name"
              defaultValue="Social"
              required
              maxLength={80}
            />
          </label>
          <label className="field">
            <span>Verified sender email</span>
            <input
              name="sender_email"
              type="email"
              defaultValue={status?.sender || "hello@beaconofunity.com"}
              required
            />
          </label>
        </div>
        <button className="primary" disabled={busy || !status?.vault_ready}>
          {busy ? (
            <Loader2 size={15} className="spin" />
          ) : (
            <LockKeyhole size={15} />
          )}
          Save private connection
        </button>
        {status && !status.vault_ready && (
          <p className="form-error">
            The owner needs to initialize the server credential vault before a
            key can be saved.
          </p>
        )}
      </form>
      {status?.configured && (
        <button
          className="text-button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const result = await execute(() =>
              api("/admin/email/test", { method: "POST" }),
            );
            if (result) notify(result.message);
            load();
            setBusy(false);
          }}
        >
          Send a test to my account email <ArrowUpRight size={14} />
        </button>
      )}
      <p className="fine">
        <a
          href="https://login.sendpulse.com/registration/"
          target="_blank"
          rel="noopener noreferrer"
        >
          SendPulse signup ↗
        </a>{" "}
        ·{" "}
        <a
          href="https://login.sendpulse.com/settings/#api"
          target="_blank"
          rel="noopener noreferrer"
        >
          API settings ↗
        </a>
      </p>
    </section>
  );
}
