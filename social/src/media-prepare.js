import { fixWebmDuration } from "@fix-webm-duration/fix";
// Local preparation only: originals never leave the device during compression.
export const MAX_SOURCE_BYTES = 1024 ** 3;
const MAX_PIXELS = 32_000_000;
const checkAbort = (signal) => {
  if (signal?.aborted)
    throw new DOMException("Preparation cancelled.", "AbortError");
};
export function fitDimensions(width, height, edge) {
  if (!Number.isFinite(width * height) || width < 1 || height < 1)
    throw Error("This file has no readable image dimensions.");
  const scale = Math.min(1, edge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
export function videoPlan(duration, maxBytes) {
  if (!Number.isFinite(duration) || duration <= 0)
    throw Error(
      "This video has no readable duration. Try an MP4 or WebM file.",
    );
  const budget = Math.min(maxBytes, 32 * 1024 ** 2);
  const audioRate = 64000;
  const videoRate = Math.floor(
    Math.min(1_500_000, (budget * 8 * 0.78) / duration - audioRate),
  );
  if (duration > 600 || videoRate < 160000)
    throw Error(
      "This clip is too long to fit the current storage limit at a usable quality. Trim it to a shorter clip, or use larger connected storage.",
    );
  return {
    audioRate,
    videoRate,
    edge: videoRate >= 800000 ? 720 : videoRate >= 400000 ? 540 : 360,
    budget,
  };
}
function sourceCheck(file) {
  if (!file?.size) throw Error("Choose a non-empty photo or video.");
  if (file.size > MAX_SOURCE_BYTES)
    throw Error("Choose a source file up to 1 GB.");
}
function result(original, blob, extension, dimensions) {
  // Keep an already smaller original; never inflate a file just to show compression.
  const file =
    blob.size < original.size
      ? new File(
          [blob],
          original.name.replace(/\.[^.]+$/, "") + "." + extension,
          { type: blob.type, lastModified: original.lastModified },
        )
      : original;
  return {
    file,
    originalBytes: original.size,
    savedBytes: original.size - file.size,
    ...dimensions,
  };
}

// Inspect bounded headers before asking the browser to decode a large image.
export async function imageDimensions(file) {
  const bytes = new Uint8Array(await file.slice(0, 1024 * 1024).arrayBuffer());
  const view = new DataView(bytes.buffer);
  const ascii = (at, n) => String.fromCharCode(...bytes.subarray(at, at + n));
  if (bytes.length >= 24 && bytes[0] === 137 && ascii(1, 3) === "PNG")
    return { width: view.getUint32(16), height: view.getUint32(20) };
  if (bytes.length >= 30 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const kind = ascii(12, 4);
    if (kind === "VP8X") {
      if (bytes[20] & 2)
        throw Error(
          "Animated WebP cannot be optimized as a still photo. Choose a still image or upload the original.",
        );
      return {
        width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
        height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16),
      };
    }
    if (kind === "VP8 ")
      return {
        width: view.getUint16(26, true) & 0x3fff,
        height: view.getUint16(28, true) & 0x3fff,
      };
    if (kind === "VP8L" && bytes[20] === 0x2f)
      return {
        width: 1 + bytes[21] + ((bytes[22] & 63) << 8),
        height:
          1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 15) << 10),
      };
  }
  if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216) {
    let at = 2;
    while (at + 4 <= bytes.length) {
      if (bytes[at++] !== 255) break;
      while (bytes[at] === 255) at++;
      const marker = bytes[at++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (at + 2 > bytes.length) break;
      const size = view.getUint16(at);
      if (size < 2 || at + size > bytes.length) break;
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker) &&
        size >= 7
      )
        return {
          height: view.getUint16(at + 3),
          width: view.getUint16(at + 5),
        };
      at += size;
    }
  }
  throw Error(
    "This image format could not be read safely. Try exporting it as a standard JPG, PNG or WebP.",
  );
}

export async function optimizePhoto(
  file,
  { maxBytes, signal, onProgress } = {},
) {
  sourceCheck(file);
  checkAbort(signal);
  const dimensions = await imageDimensions(file);
  checkAbort(signal);
  if (dimensions.width * dimensions.height > MAX_PIXELS)
    throw Error(
      "This image is over 32 megapixels. Resize or crop it on your device first.",
    );
  if (typeof createImageBitmap !== "function")
    throw Error(
      "Photo optimization is unavailable in this browser. You can choose the original if it fits.",
    );
  onProgress?.(0.1);
  let bitmap, canvas;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    checkAbort(signal);
    canvas = document.createElement("canvas");
    let best = file,
      bestSize = null;
    for (const edge of [2048, 1600, 1200, 960]) {
      const size = fitDimensions(bitmap.width, bitmap.height, edge);
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d");
      if (!context) throw Error("Your browser could not prepare this image.");
      context.drawImage(bitmap, 0, 0, size.width, size.height);
      for (const quality of [0.82, 0.65, 0.48]) {
        checkAbort(signal);
        const blob = await new Promise((resolve, reject) =>
          canvas.toBlob(
            (blob) =>
              blob ? resolve(blob) : reject(Error("Image compression failed.")),
            "image/webp",
            quality,
          ),
        );
        checkAbort(signal);
        if (blob.size < best.size) {
          best = blob;
          bestSize = size;
        }
        // A small sharing copy also saves aggregate storage for already uploadable photos.
        if (best.size <= Math.min(maxBytes, 1024 * 1024)) break;
      }
      onProgress?.(0.3 + (1 - edge / 3000) * 0.6);
      if (best.size <= Math.min(maxBytes, 1024 * 1024)) break;
    }
    if (best.size > maxBytes)
      throw Error(
        "The optimized photo still exceeds the current upload limit. Crop it or choose a smaller image.",
      );
    onProgress?.(1);
    return result(
      file,
      best,
      best.type === "image/webp"
        ? "webp"
        : best.type === "image/jpeg"
          ? "jpg"
          : "png",
      bestSize || dimensions,
    );
  } finally {
    bitmap?.close();
    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}

export function canCompressVideo() {
  return (
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function" &&
    !!(globalThis.AudioContext || globalThis.webkitAudioContext)
  );
}
export async function optimizeVideo(
  file,
  { maxBytes, signal, onProgress } = {},
) {
  sourceCheck(file);
  checkAbort(signal);
  if (!canCompressVideo())
    throw Error(
      "Video compression is unavailable in this browser. Try current Chrome or Edge, or choose a smaller clip.",
    );
  const mime = ["video/webm;codecs=vp8,opus", "video/mp4", "video/webm"].find(
    (x) => MediaRecorder.isTypeSupported(x),
  );
  if (!mime)
    throw Error(
      "This browser has no compatible video encoder. Try Chrome or Edge.",
    );
  const video = document.createElement("video"),
    canvas = document.createElement("canvas");
  const url = URL.createObjectURL(file);
  const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
  const audio = new Audio();
  // Called from the Compress video click, while user activation is available.
  const audioReady = audio.resume();
  audioReady.catch(() => {});
  let recorder, stream, source, frame, frameKind, visibility;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise((resolve, reject) => {
      const finish = (error) => {
        clearTimeout(timer);
        video.removeEventListener("loadedmetadata", loaded);
        video.removeEventListener("error", failed);
        signal?.removeEventListener("abort", aborted);
        error ? reject(error) : resolve();
      };
      const loaded = () => finish(),
        failed = () =>
          finish(
            Error(
              "This video could not be decoded. Try a standard MP4 or WebM.",
            ),
          ),
        aborted = () =>
          finish(new DOMException("Preparation cancelled.", "AbortError"));
      const timer = setTimeout(
        () => finish(Error("Video loading timed out. Try a different file.")),
        30000,
      );
      video.addEventListener("loadedmetadata", loaded, { once: true });
      video.addEventListener("error", failed, { once: true });
      signal?.addEventListener("abort", aborted, { once: true });
      if (video.readyState >= 1) loaded();
    });
    checkAbort(signal);
    const plan = videoPlan(video.duration, maxBytes),
      fit = fitDimensions(video.videoWidth, video.videoHeight, plan.edge);
    const size = {
      width: Math.max(2, Math.floor(fit.width / 2) * 2),
      height: Math.max(2, Math.floor(fit.height / 2) * 2),
    };
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw Error("Your browser could not prepare this video.");
    stream = canvas.captureStream(24);
    await new Promise((resolve, reject) => {
      const finish = (error) => {
        clearTimeout(timer);
        signal?.removeEventListener("abort", aborted);
        error ? reject(error) : resolve();
      };
      const aborted = () =>
        finish(new DOMException("Preparation cancelled.", "AbortError"));
      const timer = setTimeout(
        () =>
          finish(
            Error("Audio preparation was blocked. Press Compress video again."),
          ),
        8000,
      );
      signal?.addEventListener("abort", aborted, { once: true });
      audioReady.then(
        () => finish(),
        (error) => finish(error),
      );
      if (signal?.aborted) aborted();
    });
    checkAbort(signal);
    if (audio.state !== "running")
      throw Error("Audio preparation was blocked. Press Compress video again.");
    source = audio.createMediaElementSource(video);
    const destination = audio.createMediaStreamDestination();
    source.connect(destination);
    for (const track of destination.stream.getAudioTracks())
      stream.addTrack(track);
    recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: plan.videoRate,
      audioBitsPerSecond: plan.audioRate,
    });
    const chunks = [];
    let bytes = 0,
      lastProgress = 0;
    await new Promise((resolve, reject) => {
      let completed = false;
      const finish = (error) => {
        if (completed) return;
        completed = true;
        clearTimeout(timer);
        signal?.removeEventListener("abort", aborted);
        video.onended = null;
        video.onerror = null;
        if (error) {
          if (recorder.state !== "inactive") recorder.stop();
          reject(error);
        } else resolve();
      };
      const aborted = () =>
        finish(new DOMException("Preparation cancelled.", "AbortError"));
      const timer = setTimeout(
        () =>
          finish(Error("Video preparation took too long. Try a shorter clip.")),
        Math.max(60000, video.duration * 2500),
      );
      signal?.addEventListener("abort", aborted, { once: true });
      recorder.onerror = () =>
        finish(
          Error("The browser could not encode this video. Try a shorter clip."),
        );
      recorder.ondataavailable = (event) => {
        if (completed) return;
        if (event.data.size) {
          bytes += event.data.size;
          if (bytes > maxBytes) {
            finish(
              Error(
                "The compressed video still exceeds the storage limit. Trim it to a shorter clip.",
              ),
            );
            return;
          }
          chunks.push(event.data);
        }
      };
      recorder.onstop = () => finish();
      video.onerror = () =>
        finish(Error("This video could not be decoded completely."));
      video.onended = () => {
        if (recorder.state !== "inactive") recorder.stop();
      };
      const draw = () => {
        if (completed) return;
        try {
          if (video.readyState >= 2)
            context.drawImage(video, 0, 0, size.width, size.height);
        } catch {
          finish(Error("A video frame could not be decoded."));
          return;
        }
        if (performance.now() - lastProgress > 250) {
          lastProgress = performance.now();
          onProgress?.(Math.min(0.99, video.currentTime / video.duration));
        }
        if (video.requestVideoFrameCallback) {
          frameKind = "video";
          frame = video.requestVideoFrameCallback(draw);
        } else {
          frameKind = "raf";
          frame = requestAnimationFrame(draw);
        }
      };
      visibility = () => {
        if (completed) return;
        if (document.hidden) {
          video.pause();
          if (recorder.state === "recording") recorder.pause();
        } else {
          if (recorder.state === "paused") recorder.resume();
          video
            .play()
            .catch(() =>
              finish(Error("Video playback paused. Please try again.")),
            );
        }
      };
      document.addEventListener("visibilitychange", visibility);
      recorder.start(500);
      draw();
      video
        .play()
        .then(() => {
          if (document.hidden) visibility();
        })
        .catch(() =>
          finish(
            Error("Video playback was blocked. Press Compress video again."),
          ),
        );
    });
    checkAbort(signal);
    let blob = new Blob(chunks, { type: recorder.mimeType.split(";")[0] });
    if (blob.type === "video/webm")
      blob = await fixWebmDuration(blob, video.duration * 1000, {
        logger: false,
      });
    checkAbort(signal);
    if (blob.size > maxBytes)
      throw Error(
        "The completed video exceeds the current storage limit. Try a shorter clip.",
      );
    if (!blob.size)
      throw Error("The browser produced an empty video. Try another clip.");
    onProgress?.(1);
    return result(file, blob, blob.type === "video/mp4" ? "mp4" : "webm", size);
  } finally {
    if (visibility)
      document.removeEventListener("visibilitychange", visibility);
    if (frame !== undefined) {
      if (frameKind === "video") video.cancelVideoFrameCallback?.(frame);
      else cancelAnimationFrame(frame);
    }
    video.pause();
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stream?.getTracks().forEach((track) => track.stop());
    source?.disconnect();
    await audio.close().catch(() => {});
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
    canvas.width = 1;
    canvas.height = 1;
  }
}
