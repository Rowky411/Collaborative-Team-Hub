import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (status !== 401 || original?._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = apiClient
        .post("/auth/refresh")
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      await refreshPromise;
      return apiClient(original);
    } catch (refreshErr) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshErr);
    }
  },
);

export function apiError(err) {
  return err?.response?.data?.error?.message || err?.message || "Unknown error";
}
