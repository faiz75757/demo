// Sends a request to the backend and attaches the login token if we have one
export async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
