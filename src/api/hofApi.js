const API_ROOT = "https://redstone-hub-api.onrender.com";
const HOF_BASE = `${API_ROOT}/api/hof`;

export async function fetchHofEntries(filters = {}) {
  const params = new URLSearchParams();

  if (filters.month) params.set("month", filters.month);
  if (filters.year) params.set("year", filters.year);
  if (filters.category) params.set("category", filters.category);

  const query = params.toString();
  const res = await fetch(query ? `${HOF_BASE}?${query}` : HOF_BASE);

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Fetch HoF failed:", res.status, msg);
    throw new Error(msg || "Failed to fetch HoF entries");
  }
  return res.json();
}

export async function createHofEntry(data) {
  const res = await fetch(HOF_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Create HoF failed:", res.status, msg);
    throw new Error(msg || "Failed to create HoF entry");
  }
  return res.json();
}

export async function updatePlacement(id, placement) {
  const res = await fetch(`${HOF_BASE}/${id}/placement`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ placement }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Update HoF placement failed:", res.status, msg);
    throw new Error(msg || "Failed to update placement");
  }
  return res.json();
}

export async function deleteHofEntry(id) {
  const res = await fetch(`${HOF_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Delete HoF failed:", res.status, msg);
    throw new Error(msg || "Failed to delete HoF entry");
  }
  return res.json();
}


export async function fetchCreatorProfile(discord) {
  const params = new URLSearchParams({ discord });
  const res = await fetch(`${HOF_BASE}/profile?${params.toString()}`);

  if (res.status === 404) return null;
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Fetch HoF profile failed:", res.status, msg);
    throw new Error(msg || "Failed to fetch creator profile");
  }


  return res.json();
}

export async function updateHofEntry(id, data) {
  const res = await fetch(`${HOF_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    console.error("Update HoF failed:", res.status, msg);
    throw new Error(msg || "Failed to update HoF entry");
  }

  return res.json();
}