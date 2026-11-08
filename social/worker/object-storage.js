import { AwsClient } from "aws4fetch";
import { assert, HttpError } from "./security.js";
import { seal, unseal } from "./email.js";

export const LARGE_UPLOAD = 1024 * 1024 * 1024;
export const UPLOAD_PART = 8 * 1024 * 1024;
export const OBJECT_BUDGET = 8 * 1024 * 1024 * 1024;
const context = "social-object-storage-v1";
const one = (env, sql, ...args) =>
  env.DB.prepare(sql)
    .bind(...args)
    .first();
const run = (env, sql, ...args) =>
  env.DB.prepare(sql)
    .bind(...args)
    .run();
export const xmlEscape = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
const unescape = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
export function xmlValue(xml, tag) {
  const match = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`).exec(
    xml,
  );
  return match ? unescape(match[1]) : null;
}

async function configuration(env) {
  if (!env.EMAIL_SETTINGS_KEY) return null;
  const row = await one(
    env,
    "SELECT value FROM app_settings WHERE key='storage'",
  );
  return row ? unseal(env, row.value, context) : null;
}
function validate(d) {
  assert(
    typeof d.endpoint === "string" &&
      /^https:\/\/s3\.[a-z]{2}-[a-z]+-\d{3}\.backblazeb2\.com\/?$/.test(
        d.endpoint,
      ),
    400,
    "Use the Backblaze S3 endpoint shown for your bucket.",
  );
  assert(
    typeof d.bucket === "string" &&
      /^[A-Za-z0-9][A-Za-z0-9-]{4,62}$/.test(d.bucket),
    400,
    "Enter the private bucket name.",
  );
  assert(
    typeof d.access_key_id === "string" &&
      /^[A-Za-z0-9]{8,64}$/.test(d.access_key_id),
    400,
    "Enter the B2 application key ID.",
  );
  assert(
    typeof d.application_key === "string" &&
      d.application_key.length >= 16 &&
      d.application_key.length <= 256,
    400,
    "Enter the B2 application key.",
  );
  return {
    endpoint: d.endpoint.replace(/\/$/, ""),
    bucket: d.bucket,
    accessKeyId: d.access_key_id,
    secretAccessKey: d.application_key,
  };
}
async function request(
  config,
  objectKey = "",
  { method = "GET", query = {}, headers = {}, body } = {},
) {
  const url = new URL(
    `${config.endpoint}/${encodeURIComponent(config.bucket)}/${objectKey.split("/").map(encodeURIComponent).join("/")}`,
  );
  for (const [key, value] of Object.entries(query))
    url.searchParams.set(key, String(value));
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: new URL(config.endpoint).hostname.split(".")[1],
    retries: 0,
  });
  const signed = await client.sign(url.href, {
    method,
    headers: { "x-amz-content-sha256": "UNSIGNED-PAYLOAD", ...headers },
    ...(body !== undefined ? { body } : {}),
  });
  return fetch(signed, { signal: AbortSignal.timeout(90000) });
}
async function checked(
  response,
  message = "Storage provider could not complete this request. Try again.",
) {
  assert(response.ok, 503, message);
  return response;
}
export async function storageStatus(env) {
  const config = await configuration(env);
  const used = await one(
    env,
    "SELECT COALESCE(SUM(size),0) AS bytes FROM media WHERE backend='b2'",
  );
  return {
    configured: !!config,
    provider: "backblaze",
    bucket: config?.bucket || null,
    endpoint: config?.endpoint || null,
    vault_ready: !!env.EMAIL_SETTINGS_KEY,
    max_file_bytes: config ? LARGE_UPLOAD : 8 * 1024 * 1024,
    part_bytes: UPLOAD_PART,
    storage_budget: OBJECT_BUDGET,
    used_bytes: used.bytes,
  };
}
export async function connectStorage(env, d) {
  const config = validate(d);
  const previous = await configuration(env);
  const used = await one(
    env,
    "SELECT COUNT(*) AS n FROM media WHERE backend='b2'",
  );
  assert(
    !used.n ||
      !previous ||
      (config.endpoint === previous.endpoint &&
        config.bucket === previous.bucket),
    409,
    "This bucket contains app media. Rotate its key without changing the bucket or endpoint.",
  );
  const response = await checked(
    await request(config, "", { query: { acl: "" } }),
    "B2 could not read this bucket. Check the bucket-scoped application key and endpoint.",
  );
  const acl = await response.text();
  assert(
    acl.includes("AccessControlPolicy") && !/<URI>|groups\/global\//.test(acl),
    400,
    "Use a private B2 bucket. Public buckets cannot protect private posts.",
  );
  const probe=`social/connection-check-${crypto.randomUUID()}`;
  const written=await checked(await request(config,probe,{method:'PUT',body:new Uint8Array(20)}),'The B2 key cannot write files. Grant read/write and delete-file permissions for this private bucket.');
  const head=await checked(await request(config,probe,{method:'HEAD'}),'The B2 key cannot read back its test file.');
  const version=head.headers.get('x-amz-version-id')||written.headers.get('x-amz-version-id');
  assert(version,503,'B2 did not return a file version. The connection was not saved.');
  await checked(await request(config,probe,{method:'DELETE',query:{versionId:version}}),'The B2 key cannot permanently delete test files. Grant delete-file permission before connecting.');
  const packed = await seal(env, config, context);
  await run(
    env,
    "INSERT INTO app_settings(key,value,updated_at) VALUES('storage',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
    packed,
    Date.now(),
  );
  return {
    message:
      "Private storage connected. Resumable uploads up to 1 GB are enabled within the app's storage budget.",
  };
}
export function matchesMedia(mime, bytes) {
  const sig = new TextDecoder().decode(bytes.subarray(0, 16));
  return (
    (mime === "image/png" &&
      bytes[0] === 137 &&
      bytes[1] === 80 &&
      bytes[2] === 78 &&
      bytes[3] === 71) ||
    (mime === "image/jpeg" &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255) ||
    (mime === "image/webp" &&
      sig.startsWith("RIFF") &&
      sig.slice(8, 12) === "WEBP") ||
    (mime === "video/mp4" && sig.slice(4, 8) === "ftyp") ||
    (mime === "video/webm" &&
      bytes[0] === 26 &&
      bytes[1] === 69 &&
      bytes[2] === 223 &&
      bytes[3] === 163)
  );
}
export async function beginUpload(env, user, d) {
  const config = await configuration(env);
  assert(
    config,
    503,
    "Large-file storage is awaiting the owner's private B2 connection. The current upload limit is 8 MB.",
  );
  assert(
    Number.isSafeInteger(d.size) && d.size > 16 && d.size <= LARGE_UPLOAD,
    413,
    "Choose a file no larger than 1 GB.",
  );
  assert(
    [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
    ].includes(d.mime),
    415,
    "Choose JPG, PNG, WebP, MP4 or WebM.",
  );
  assert(
    typeof d.fingerprint === "string" && /^[a-f0-9]{64}$/.test(d.fingerprint),
    400,
    "Invalid file fingerprint.",
  );
  const id = crypto.randomUUID(),
    key = `social/${user.id}/${id}`;
  try {
    await run(
      env,
      "INSERT INTO media(id,user_id,mime,size,created_at,backend,ready,object_key) VALUES(?,?,?,?,?,'b2',0,?)",
      id,
      user.id,
      d.mime,
      d.size,
      Date.now(),
      key,
    );
  } catch (e) {
    if (/STORAGE_LIMIT/.test(e.message))
      throw new HttpError(
        507,
        "Free storage budget reached. Delete older uploads before adding another file.",
      );
    throw e;
  }
  // Persist the cleanup record before contacting the provider. Never lose the
  // reservation on an ambiguous upstream response; scheduled cleanup retries it.
  await run(
    env,
    "INSERT INTO media_uploads(media_id,fingerprint,expires_at) VALUES(?,?,?)",
    id,
    d.fingerprint,
    Date.now() + 86400000,
  );
  try {
    const response = await checked(
      await request(config, key, {
        method: "POST",
        query: { uploads: "" },
        headers: { "Content-Type": d.mime },
      }),
    );
    const uploadId = xmlValue(await response.text(), "UploadId");
    assert(
      uploadId && uploadId.length <= 2048,
      503,
      "Storage provider did not start an upload.",
    );
    await run(
      env,
      "UPDATE media_uploads SET upload_id=? WHERE media_id=?",
      uploadId,
      id,
    );
    return {
      id,
      part_bytes: UPLOAD_PART,
      parts: [],
      size: d.size,
      ready: false,
    };
  } catch (e) {
    // If the provider accepted a create but the response was lost, its lifecycle
    // rule must abort incomplete multipart uploads after one day.
    await run(env, "DELETE FROM media WHERE id=?", id);
    throw e;
  }
}
async function owned(env, user, id) {
  const media = await one(
    env,
    "SELECT * FROM media WHERE id=? AND user_id=? AND backend='b2'",
    id,
    user.id,
  );
  assert(media, 404, "Upload not found.");
  const upload = await one(
    env,
    "SELECT * FROM media_uploads WHERE media_id=?",
    id,
  );
  if (!media.ready)
    assert(
      upload && upload.expires_at > Date.now() && upload.upload_id,
      410,
      "This upload expired. Start again.",
    );
  return { media, upload };
}
export async function uploadStatus(env, user, id, fingerprint) {
  const { media, upload } = await owned(env, user, id);
  if (upload)
    assert(
      upload.fingerprint === fingerprint,
      409,
      "Select the same file to resume this upload.",
    );
  const { results } = await env.DB.prepare(
    "SELECT part FROM upload_parts WHERE media_id=? AND etag IS NOT NULL ORDER BY part",
  )
    .bind(id)
    .all();
  return {
    id,
    ready: !!media.ready,
    size: media.size,
    part_bytes: UPLOAD_PART,
    parts: results.map((r) => r.part),
  };
}
export async function putPart(env, user, id, part, input) {
  const { media, upload } = await owned(env, user, id);
  assert(
    !media.ready && upload.state === "uploading",
    409,
    "This upload is already finishing.",
  );
  const count = Math.ceil(media.size / UPLOAD_PART);
  assert(
    Number.isInteger(part) && part >= 1 && part <= count,
    400,
    "Invalid upload part.",
  );
  const expected = Math.min(UPLOAD_PART, media.size - (part - 1) * UPLOAD_PART);
  const existing = await one(
    env,
    "SELECT * FROM upload_parts WHERE media_id=? AND part=?",
    id,
    part,
  );
  if (existing?.etag) return { part, received: expected };
  const lease = Date.now() + 120000;
  const acquired = await one(
    env,
    "INSERT INTO upload_parts(media_id,part,size,lease_until) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM upload_parts WHERE lease_until>?)<3 ON CONFLICT(media_id,part) DO UPDATE SET lease_until=excluded.lease_until WHERE etag IS NULL AND lease_until<? RETURNING part",
    id,
    part,
    expected,
    lease,
    Date.now(),
    Date.now(),
  );
  assert(acquired, 409, "Upload service is busy. Your progress is saved; retry shortly.");
  try {
    const bytes=typeof input==='function'?await input():input;
    assert(bytes.length===expected,400,"Upload part has an unexpected size. Select the original file.");
    if(part===1)assert(matchesMedia(media.mime,bytes),415,"File contents do not match the selected type.");
    const config = await configuration(env);
    assert(config, 503, "Storage is not connected.");
    const response = await checked(
      await request(config, media.object_key, {
        method: "PUT",
        query: { partNumber: part, uploadId: upload.upload_id },
        body: bytes,
      }),
    );
    const etag = response.headers.get("ETag");
    assert(
      etag && etag.length <= 256,
      503,
      "Storage did not confirm this part. Retry it.",
    );
    await run(
      env,
      "UPDATE upload_parts SET etag=?,lease_until=0 WHERE media_id=? AND part=?",
      etag,
      id,
      part,
    );
    return { part, received: expected };
  } catch (e) {
    await run(
      env,
      "UPDATE upload_parts SET lease_until=0 WHERE media_id=? AND part=? AND etag IS NULL",
      id,
      part,
    );
    throw e;
  }
}
export async function completeUpload(env, user, id) {
  const { media, upload } = await owned(env, user, id);
  if (media.ready) return { id, mime: media.mime, ready: true };
  const { results: parts } = await env.DB.prepare(
    "SELECT part,size,etag FROM upload_parts WHERE media_id=? ORDER BY part",
  )
    .bind(id)
    .all();
  assert(
    parts.length === Math.ceil(media.size / UPLOAD_PART) &&
      parts.every((p, i) => p.part === i + 1 && p.etag) &&
      parts.reduce((sum, p) => sum + p.size, 0) === media.size,
    409,
    "Some file parts are missing. Resume the upload.",
  );
  const config = await configuration(env);
  assert(config, 503, "Storage is not connected.");
  const lease = await one(
    env,
    "UPDATE media_uploads SET state='completing',operation_until=? WHERE media_id=? AND operation_until<? RETURNING media_id",
    Date.now() + 120000,
    id,
    Date.now(),
  );
  assert(lease, 409, "This upload is already finishing. Retry shortly.");
  let version;
  try {
    const body = `<CompleteMultipartUpload>${parts.map((p) => `<Part><PartNumber>${p.part}</PartNumber><ETag>${xmlEscape(p.etag)}</ETag></Part>`).join("")}</CompleteMultipartUpload>`;
    const response = await request(config, media.object_key, {
      method: "POST",
      query: { uploadId: upload.upload_id },
      headers: { "Content-Type": "application/xml" },
      body,
    });
    if (response.ok) {
      const xml = await response.text();
      assert(
        !xml.includes("<Error>"),
        503,
        "Storage could not finalize this file.",
      );
      version = response.headers.get("x-amz-version-id");
    }
    // HEAD recovers a successful completion whose response was lost. Unique
    // object keys ensure this cannot attach someone else's file.
    const head = await checked(
      await request(config, media.object_key, { method: "HEAD" }),
    );
    assert(
      Number(head.headers.get("Content-Length")) === media.size,
      503,
      "The stored file size did not match. Upload was not published.",
    );
    version ||= head.headers.get("x-amz-version-id");
    assert(version, 503, "Storage did not identify the file version.");
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE media SET ready=1,object_version=? WHERE id=?",
      ).bind(version, id),
      env.DB.prepare("DELETE FROM media_uploads WHERE media_id=?").bind(id),
    ]);
    return { id, mime: media.mime, ready: true };
  } catch (e) {
    await run(
      env,
      "UPDATE media_uploads SET state='uploading',operation_until=0 WHERE media_id=?",
      id,
    );
    throw e;
  }
}
export async function readObject(env, media, incoming) {
  const config = await configuration(env);
  assert(config, 503, "Storage is not connected.");
  const headers = {};
  const range = incoming.headers.get("Range");
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (
      !m ||
      (!m[1] && !m[2]) ||
      (m[1] && Number(m[1]) >= media.size) ||
      (m[1] && m[2] && Number(m[1]) > Number(m[2])) ||
      (!m[1] && Number(m[2]) === 0)
    )
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${media.size}` },
      });
    headers.Range = range;
  }
  const response = await request(config, media.object_key, {
    query: media.object_version ? { versionId: media.object_version } : {},
    headers,
  });
  if (response.status === 404) return null;
  await checked(response);
  const out = new Headers({
    "Content-Type": media.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
  });
  for (const key of ["Content-Length", "Content-Range", "ETag"])
    if (response.headers.has(key)) out.set(key, response.headers.get(key));
  return new Response(response.body, { status: response.status, headers: out });
}
export async function deleteObject(env, media) {
  const config = await configuration(env);
  assert(
    config,
    503,
    "Storage is not connected. Please try deletion again after reconnecting it.",
  );
  if (!media.ready) {
    const lock = await one(
      env,
      "UPDATE media_uploads SET state='deleting',operation_until=? WHERE media_id=? AND operation_until<? AND NOT EXISTS(SELECT 1 FROM upload_parts WHERE media_id=? AND lease_until>?) RETURNING media_id",
      Date.now() + 120000,
      media.id,
      Date.now(),
      media.id,
      Date.now(),
    );
    assert(
      lock,
      409,
      "Upload is still busy. Pause it, wait a moment, then try deleting again.",
    );
    const upload = await one(
      env,
      "SELECT upload_id FROM media_uploads WHERE media_id=?",
      media.id,
    );
    if (upload?.upload_id) {
      const response = await request(config, media.object_key, {
        method: "DELETE",
        query: { uploadId: upload.upload_id },
      });
      if (response.status !== 404) await checked(response);
    }
    // Completion may have succeeded just before its response was lost. Delete
    // that exact version too, rather than releasing a reservation for a leaked object.
    const head = await request(config, media.object_key, { method: "HEAD" });
    if (head.ok) {
      const version = head.headers.get("x-amz-version-id");
      assert(version, 503, "Storage did not identify this file version.");
      const removal = await request(config, media.object_key, {
        method: "DELETE",
        query: { versionId: version },
      });
      if (removal.status !== 404) await checked(removal);
    } else if (head.status !== 404) await checked(head);
  } else {
    assert(
      media.object_version,
      503,
      "Storage version missing. Contact the owner before deleting this object.",
    );
    const response = await request(config, media.object_key, {
      method: "DELETE",
      query: { versionId: media.object_version },
    });
    if (response.status !== 404) await checked(response);
  }
}
export async function cancelUpload(env, user, id) {
  const media = await one(
    env,
    "SELECT * FROM media WHERE id=? AND user_id=? AND backend='b2'",
    id,
    user.id,
  );
  assert(media, 404, "Upload not found.");
  assert(
    !(await one(env, "SELECT 1 FROM posts WHERE media_id=?", id)),
    409,
    "This file belongs to a post. Delete the post instead.",
  );
  await deleteObject(env, media);
  await run(env, "DELETE FROM media WHERE id=? AND user_id=?", id, user.id);
  return { ok: true };
}
