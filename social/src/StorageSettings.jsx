import React, { useEffect, useState } from "react";
import { Database, LockKeyhole, Loader2 } from "lucide-react";
import { api } from "./api";
import { formatBytes } from "./uploads";
export default function StorageSettings({ execute, notify }) {
  const [status, setStatus] = useState(null),
    [busy, setBusy] = useState(false);
  const load = () =>
    execute(async () => setStatus(await api("/admin/storage")));
  useEffect(() => {
    load();
  }, []);
  return (
    <section className="settings-card">
      <h3>
        <Database size={17} /> Private media storage
      </h3>
      <p className="muted">
        {status?.configured
          ? "Backblaze B2 connected · resumable uploads up to 1 GB"
          : "Connect private storage to enable 1 GB uploads. Current uploads remain limited to 8 MB."}
      </p>
      <p className="fine">
        B2 includes 10 GB total storage free. This app reserves at most 8 GB,
        including unfinished uploads, with a 2 GB member budget. Use a dedicated
        private bucket and keep incomplete-upload cleanup enabled. No paid
        upgrade is enabled here.
      </p>
      {status?.configured && (
        <p className="storage-usage">
          {formatBytes(status.used_bytes)} of{" "}
          {formatBytes(status.storage_budget)} app budget reserved ·{" "}
          {status.bucket}
        </p>
      )}
      <form
        autoComplete="off"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = e.currentTarget;
          const d = Object.fromEntries(new FormData(form));
          const result = await execute(() =>
            api("/admin/storage", { method: "POST", body: d }),
          );
          if (result) {
            form.querySelector("[name=application_key]").value = "";
            notify(result.message);
            await load();
          }
          setBusy(false);
        }}
      >
        <label className="field">
          <span>Private B2 bucket</span>
          <input
            key={status?.bucket || "bucket"}
            name="bucket"
            defaultValue={status?.bucket || ""}
            placeholder="beacon-social-media"
            required
          />
        </label>
        <label className="field">
          <span>S3 endpoint</span>
          <input
            key={status?.endpoint || "endpoint"}
            name="endpoint"
            type="url"
            defaultValue={status?.endpoint || ""}
            placeholder="https://s3.us-west-004.backblazeb2.com"
            required
          />
        </label>
        <label className="field">
          <span>Application key ID</span>
          <input name="access_key_id" autoComplete="off" required />
        </label>
        <label className="field">
          <span>Application key</span>
          <input
            name="application_key"
            type="password"
            autoComplete="new-password"
            minLength={16}
            maxLength={256}
            required
            placeholder="Encrypted before storage"
          />
        </label>
        <button className="primary" disabled={busy || !status?.vault_ready}>
          {busy ? (
            <Loader2 size={15} className="spin" />
          ) : (
            <LockKeyhole size={15} />
          )}
          Connect private storage
        </button>
      </form>
      <p className="fine">
        Use a bucket-restricted key with read/write, listing and delete-file
        permissions. Credentials never belong in chat, source or Vite variables.
        The app verifies the bucket is private before saving. Existing media
        stays private.
      </p>
      <a
        href="https://www.backblaze.com/sign-up/cloud-storage"
        target="_blank"
        rel="noopener noreferrer"
      >
        Create a free B2 account
      </a>
    </section>
  );
}
