export async function api(path, options = {}) {
  const { body, ...rest } = options;
  const response = await fetch(`/social/api${path}`, {
    ...rest,
    credentials: "same-origin",
    headers: {
      ...(body && !(body instanceof File)
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
    body: body instanceof File ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}
export const mediaUrl = (id) => `/social/api/media/${id}`;
