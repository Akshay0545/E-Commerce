const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const setToken = (t) => localStorage.setItem("token", t);
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => localStorage.removeItem("token");

// lightweight retry with no-store cache behavior
async function fetchWithRetry(url, opts = {}, { retries = 2, backoffMs = 300 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
        ...opts
      });
      if (!res.ok) {
        let msg = "Request failed";
        try { const j = await res.json(); msg = j?.message || msg; } catch {}
        throw new Error(msg);
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (e.name === "AbortError") throw e;
      if (attempt < retries) await new Promise(r => setTimeout(r, backoffMs * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function request(path, { method = "GET", body, auth, signal } = {}) {
  const headers = { "Content-Type": "application/json" }; // force JSON
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return fetchWithRetry(`${API}${path}`, {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

export const api = {
  signup: (p) => request("/api/auth/signup", { method: "POST", body: p }),
  login:  (p) => request("/api/auth/login",  { method: "POST", body: p }),
  me:     (signal) => request("/api/auth/me", { auth: true, signal }),

  listItems: (params = {}, signal) => {
    const sp = new URLSearchParams(
      Object.entries(params).filter(([,v]) => v !== "" && v !== undefined)
    ).toString();
    const ts = Date.now();
    const url = `/api/items${sp ? "?" + sp + "&_t=" + ts : "?_t=" + ts}`;
    return request(url, { signal });
  },

  createItem: (p) => request("/api/items", { method: "POST", body: p, auth: true }),
  updateItem: (id, p) => request(`/api/items/${id}`, { method: "PUT", body: p, auth: true }),
  deleteItem: (id) => request(`/api/items/${id}`, { method: "DELETE", auth: true }),

  getCart: (signal) => request("/api/cart", { auth: true, signal }),
  addToCart: (itemId, qty=1) => request("/api/cart", { method:"POST", body:{ itemId, qty }, auth:true }),
  updateCart: (itemId, qty) => request(`/api/cart/${itemId}`, { method:"PATCH", body:{ qty }, auth:true }),
  removeFromCart: (itemId) => request(`/api/cart/${itemId}`, { method:"DELETE", auth:true })
};
