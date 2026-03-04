const BASE = import.meta.env.VITE_API_BASE_URL || "";

const getAdminToken = () => localStorage.getItem("admin_token");

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.errorCode = data.error_code;
    err.status = res.status;
    throw err;
  }
  return data;
}

function withAdminAuth(headers = {}) {
  const token = getAdminToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

// ── Customer / Public ──────────────────────────────────────────────────────

export const shopApi = {
  listProducts: () => request("/api/shop/products"),
  purchase: (productId) =>
    request(`/api/shop/products/${productId}/purchase`, { method: "POST", body: "{}" }),
};

// ── Admin Auth ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (email, password) =>
    request("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () =>
    request("/api/admin/auth/me", { headers: withAdminAuth() }),
};

// ── Admin Products ─────────────────────────────────────────────────────────

export const adminApi = {
  listProducts: () =>
    request("/api/admin/products", { headers: withAdminAuth() }),

  getProduct: (id) =>
    request(`/api/admin/products/${id}`, { headers: withAdminAuth() }),

  createCoupon: (data) =>
    request("/api/admin/products", {
      method: "POST",
      headers: withAdminAuth(),
      body: JSON.stringify(data),
    }),

  updateCoupon: (id, data) =>
    request(`/api/admin/products/${id}`, {
      method: "PATCH",
      headers: withAdminAuth(),
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    request(`/api/admin/products/${id}`, {
      method: "DELETE",
      headers: withAdminAuth(),
    }),
};
