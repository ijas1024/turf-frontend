export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) throw new Error("Failed to refresh token");
    const data = await res.json();

    if (data.access) {
      localStorage.setItem("access", data.access);
      return data.access;
    }
    return null;
  } catch (err) {
    console.error("❌ Token refresh failed:", err);
    localStorage.clear();
    return null;
  }
}
