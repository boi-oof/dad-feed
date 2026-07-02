// Uses the Web Crypto API (globalThis.crypto.subtle) rather than Node's
// `crypto` module so this works in both the Node runtime (API routes) and
// the Edge runtime (middleware).

const COOKIE_NAME = "dad_session";

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getKey() {
  const secret = process.env.SESSION_SECRET!;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function sign(value: string) {
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return toHex(sig);
}

/** Builds the cookie value "payload.signature" for a freshly logged-in session. */
export async function createSessionToken() {
  const payload = `dad:${Date.now()}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

/** Verifies a cookie value was actually issued by us (not forged) and not expired. */
export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = await sign(payload);

  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return false;

  const ts = Number(payload.split(":")[1]);
  if (!ts || Number.isNaN(ts)) return false;

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - ts < THIRTY_DAYS;
}

export const SESSION_COOKIE = COOKIE_NAME;
