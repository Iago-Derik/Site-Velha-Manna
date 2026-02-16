import { getStore } from "@netlify/blobs";

const VALID_KEYS = ["products", "users", "config", "invites", "logs"];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key || !VALID_KEYS.includes(key)) {
    return json({ error: "Invalid key. Valid keys: " + VALID_KEYS.join(", ") }, 400);
  }

  const store = getStore({ name: "site-data", consistency: "strong" });

  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });
    return json({ key, data });
  }

  if (req.method === "PUT") {
    const body = await req.json();
    await store.setJSON(key, body.data);
    return json({ key, success: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = {
  path: "/api/data",
};
