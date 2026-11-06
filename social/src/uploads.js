import { api } from "./api";
export const formatBytes = (bytes) =>
  bytes < 1024
    ? `${bytes || 0} B`
    : bytes < 1024 ** 2
      ? `${Math.round(bytes / 1024)} KB`
      : bytes >= 1024 ** 3
        ? `${(bytes / 1024 ** 3).toFixed(1).replace(/\.0$/, "")} GB`
        : `${(bytes / 1024 ** 2).toFixed(1).replace(/\.0$/, "")} MB`;
const abortError = () => new DOMException("Upload paused.", "AbortError");
export async function fingerprint(file) {
  const prefix = await file.slice(0, 65536).arrayBuffer();
  const metadata = new TextEncoder().encode(
    JSON.stringify([file.name, file.size, file.lastModified, file.type]),
  );
  const input = new Uint8Array(prefix.byteLength + metadata.byteLength);
  input.set(new Uint8Array(prefix));
  input.set(metadata, prefix.byteLength);
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", input)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
function transfer(
  path,
  blob,
  {
    signal,
    onProgress,
    mime = "application/octet-stream",
    method = "PUT",
  } = {},
) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const xhr = new XMLHttpRequest();
    xhr.open(method, "/social/api" + path);
    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", mime);
    xhr.timeout = 10 * 60 * 1000;
    const abort = () => xhr.abort();
    signal?.addEventListener("abort", abort, { once: true });
    const cleanup = () => signal?.removeEventListener("abort", abort);
    xhr.upload.onprogress = (e) => onProgress?.(e.loaded);
    xhr.onload = () => {
      cleanup();
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = { error: "Upload could not be completed. Try again." };
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else {
        const e = new Error(data.error || "Upload failed.");
        e.status = xhr.status;
        reject(e);
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(
        new Error("Connection interrupted. Your completed parts are saved."),
      );
    };
    xhr.ontimeout = () => {
      cleanup();
      reject(new Error("Upload timed out. Try again to resume."));
    };
    xhr.onabort = () => {
      cleanup();
      reject(abortError());
    };
    xhr.send(blob);
  });
}
const storageKey = (owner, hash) => `social-resume:${owner}:${hash}`;
function readSaved(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}
export async function uploadMedia(
  file,
  { owner, signal, onProgress, onPhase, capabilities },
) {
  if (file.size > capabilities.max_file_bytes)
    throw new Error(
      `The current upload limit is ${formatBytes(capabilities.max_file_bytes)}. Large-file storage needs to be connected by the owner.`,
    );
  if (!capabilities.resumable)
    return transfer("/uploads", file, {
      signal,
      mime: file.type,
      method: "POST",
      onProgress: (loaded) =>
        onProgress?.(Math.min(loaded, file.size), file.size),
    });
  const hash = await fingerprint(file),
    key = storageKey(owner, hash);
  let saved = readSaved(key),
    state;
  if (saved?.id) {
    try {
      state = await api(`/uploads/resumable/${saved.id}?fingerprint=${hash}`);
    } catch (e) {
      if ([404, 410].includes(e.status)) {
        localStorage.removeItem(key);
        saved = null;
      } else throw e;
    }
  }
  if (signal?.aborted) throw abortError();
  if (!state) {
    state = await api("/uploads/resumable", {
      method: "POST",
      body: { mime: file.type, size: file.size, fingerprint: hash },
    });
    try {
      localStorage.setItem(key, JSON.stringify({ id: state.id }));
    } catch {
      /* In-tab retries still work; cross-reload resume needs local storage. */
    }
  }
  if (state.ready) return { id: state.id, mime: file.type, resume_key: key };
  const complete = new Set(state.parts),
    partSize = state.part_bytes;
  let sent = [...complete].reduce(
    (sum, n) => sum + Math.min(partSize, file.size - (n - 1) * partSize),
    0,
  );
  onProgress?.(sent, file.size);
  for (let index = 0; index < Math.ceil(file.size / partSize); index++) {
    if (complete.has(index + 1)) continue;
    if (signal?.aborted) throw abortError();
    const part = file.slice(
      index * partSize,
      Math.min(file.size, (index + 1) * partSize),
    );
    let attempts = 0;
    while (true) {
      try {
        await transfer(
          `/uploads/resumable/${state.id}/parts/${index + 1}`,
          part,
          {
            signal,
            onProgress: (loaded) =>
              onProgress?.(sent + Math.min(loaded, part.size), file.size),
          },
        );
        break;
      } catch (e) {
        if (
          e.name === "AbortError" ||
          attempts >= 2 ||
          [400, 401, 403, 404, 410, 413, 415, 423, 507].includes(e.status)
        )
          throw e;
        attempts++;
        onPhase?.("Connection interrupted. Retrying this part…");
        await new Promise((resolve, reject) => {
          const abort = () => {
            clearTimeout(t);
            reject(abortError());
          };
          const t = setTimeout(
            () => {
              signal?.removeEventListener("abort", abort);
              resolve();
            },
            e.status === 429 ? 30000 : attempts * 2000,
          );
          signal?.addEventListener("abort", abort, { once: true });
        });
      }
    }
    sent += part.size;
    onProgress?.(sent, file.size);
    onPhase?.("Uploading your media…");
  }
  if (signal?.aborted) throw abortError();
  onPhase?.("Checking the completed file…");
  const result = await api(`/uploads/resumable/${state.id}/complete`, {
    method: "POST",
  });
  return { ...result, resume_key: key };
}
export async function discardUpload(file, owner) {
  const hash = await fingerprint(file),
    key = storageKey(owner, hash),
    saved = readSaved(key);
  if (saved?.id) {
    try {
      await api(`/uploads/resumable/${saved.id}`, { method: "DELETE" });
    } catch (e) {
      if (e.status !== 404 && e.status !== 410) throw e;
    }
  }
  localStorage.removeItem(key);
}
