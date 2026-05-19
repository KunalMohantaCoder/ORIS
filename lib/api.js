const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: JSON.stringify(body || {})
    })
};
