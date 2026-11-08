import { readObject, deleteObject } from "./object-storage.js";
// Legacy small private media remains readable after object storage is enabled.
// Authorization happens in the API before a read; never expose the table directly.
const CHUNK = 192 * 1024;
export const MAX_UPLOAD = 8 * 1024 * 1024;
const encode = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 8192)
    s += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(s);
};
const decode = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export async function storeMedia(env, mid, uid, mime, bytes) {
  await env.DB.prepare(
    "INSERT INTO media(id,user_id,mime,size,created_at,backend) VALUES(?,?,?,?,?,?)",
  )
    .bind(mid, uid, mime, bytes.length, Date.now(), env.MEDIA ? "r2" : "d1")
    .run();
  try {
    if (env.MEDIA)
      await env.MEDIA.put(mid, bytes, { httpMetadata: { contentType: mime } });
    else {
      const entries = [];
      for (let i = 0; i < bytes.length; i += CHUNK)
        entries.push(
          env.DB.prepare("INSERT INTO media_chunks VALUES(?,?,?)").bind(
            mid,
            i / CHUNK,
            encode(bytes.subarray(i, i + CHUNK)),
          ),
        );
      for (let i = 0; i < entries.length; i += 10)
        await env.DB.batch(entries.slice(i, i + 10));
    }
  } catch (e) {
    await env.DB.prepare("DELETE FROM media WHERE id=?").bind(mid).run();
    throw e;
  }
}
export async function readMedia(env, m, request) {
  if (!m.ready && m.ready !== undefined) return null;
  if (m.backend === "b2") return readObject(env, m, request);
  if (env.MEDIA && m.backend !== "d1") {
    const object = await env.MEDIA.get(m.id, { range: request.headers });
    if (!object) return null;
    return new Response(object.body, {
      status: object.range ? 206 : 200,
      headers: {
        "Content-Type": m.mime,
        "Content-Length": String(object.range?.length || object.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store",
        ...(object.range
          ? {
              "Content-Range": `bytes ${object.range.offset}-${object.range.offset + object.range.length - 1}/${object.size}`,
            }
          : {}),
      },
    });
  }
  let start = 0,
    end = m.size - 1,
    status = 200;
  const range = request.headers.get("Range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match)
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${m.size}` },
      });
    if (!match[1]) start = Math.max(0, m.size - Number(match[2]));
    else {
      start = Number(match[1]);
      if (match[2]) end = Math.min(end, Number(match[2]));
    }
    if (start > end || start >= m.size)
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${m.size}` },
      });
    status = 206;
  }
  const first = Math.floor(start / CHUNK),
    last = Math.floor(end / CHUNK);
  const { results } = await env.DB.prepare(
    "SELECT part,data FROM media_chunks WHERE media_id=? AND part>=? AND part<=? ORDER BY part",
  )
    .bind(m.id, first, last)
    .all();
  if (results.length !== last - first + 1) return null;
  const stream = new ReadableStream({
    start(controller) {
      for (const row of results) {
        const bytes = decode(row.data);
        controller.enqueue(
          bytes.subarray(
            Math.max(0, start - row.part * CHUNK),
            Math.min(bytes.length, end - row.part * CHUNK + 1),
          ),
        );
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: {
      "Content-Type": m.mime,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      ...(status === 206
        ? { "Content-Range": `bytes ${start}-${end}/${m.size}` }
        : {}),
    },
  });
}
export async function removeMedia(env, media) {
  if (media.backend === "b2") await deleteObject(env, media);
  else if (env.MEDIA && media.backend !== "d1")
    await env.MEDIA.delete(media.id);
}
