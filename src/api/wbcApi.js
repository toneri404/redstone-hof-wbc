const API_ROOT = "https://redstone-hub-api.onrender.com";
const WBC_BASE = `${API_ROOT}/api/wbc`;

export async function fetchWbcEntries(filters = {}) {
  const params = new URLSearchParams();

  if (filters.month) params.set("month", filters.month);
  if (filters.year) params.set("year", filters.year);

  const query = params.toString();
  const res = await fetch(query ? `${WBC_BASE}?${query}` : WBC_BASE);

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Fetch WBC failed:", res.status, msg);
    throw new Error(msg || "Failed to fetch WBC entries");
  }
  return res.json();
}

export async function createWbcEntry(data) {
  const res = await fetch(WBC_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Create WBC failed:", res.status, msg);
    throw new Error(msg || "Failed to create WBC entry");
  }
  return res.json();
}

export async function deleteWbcEntry(id) {
  const res = await fetch(`${WBC_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Delete WBC failed:", res.status, msg);
    throw new Error(msg || "Failed to delete WBC entry");
  }
  return res.json();
}

export async function fetchWbcCreatorProfile(discord) {
  const params = new URLSearchParams({ discord });
  const res = await fetch(`${WBC_BASE}/profile?${params.toString()}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Fetch WBC profile failed:", res.status, msg);
    throw new Error(msg || "Failed to fetch creator profile");
  }
  return res.json();
}
export async function updateWbcEntry(id, data) {
  const res = await fetch(`${WBC_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Update WBC failed:", res.status, msg);
    throw new Error(msg || "Failed to update WBC entry");
  }

  return res.json();
}