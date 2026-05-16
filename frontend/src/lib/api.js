const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const getToken = () => localStorage.getItem("taskflow_token");

const buildHeaders = (headers = {}) => {
  const token = getToken();

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiRequest = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: buildHeaders({
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    }),
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = data?.message || "Something went wrong";
    throw new Error(Array.isArray(data?.errors) ? data.errors.join(", ") : message);
  }

  return data;
};

export const saveAuth = ({ token, user }) => {
  localStorage.setItem("taskflow_token", token);
  localStorage.setItem("taskflow_user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("taskflow_token");
  localStorage.removeItem("taskflow_user");
};

export const readStoredUser = () => {
  try {
    const user = localStorage.getItem("taskflow_user");

    if (!user || user === "undefined") {
      return null;
    }

    return JSON.parse(user);
  } catch (error) {
    console.error("Failed to parse stored user:", error);

    localStorage.removeItem("taskflow_user");

    return null;
  }
};
