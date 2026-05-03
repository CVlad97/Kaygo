import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type JsonValue = Record<string, unknown> | unknown[];

type KaygoUser = {
  id: string;
  email: string;
  password_hash: string;
  role: "sender" | "traveler" | "receiver" | "admin";
  first_name: string;
  last_name: string;
  phone: string | null;
  verification_status: string;
  created_at: string;
};

type JwtPayload = {
  sub: string;
  role: string;
  email: string;
  exp: number;
};

const allowedOrigin = "https://cvlad97.github.io";
const supabaseUrl = requiredEnv("SUPABASE_URL");
const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const jwtSecret = requiredEnv("KAYGO_JWT_SECRET");

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const corsHeaders = buildCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (origin && origin !== allowedOrigin) {
    return json({ error: "CORS_ORIGIN_NOT_ALLOWED" }, 403, corsHeaders);
  }

  try {
    const url = new URL(req.url);
    const path = normalizePath(url.pathname);

    if (req.method === "POST" && path === "/auth/login") {
      return handleLogin(req, corsHeaders);
    }

    if (req.method === "POST" && path === "/pricing/estimate") {
      return handlePriceEstimate(req, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/me") {
      const user = await requireAdmin(req);
      return json({ user: serializeUser(user) }, 200, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/trips") {
      await requireAdmin(req);
      const trips = await restSelect("kaygo_trips", "select=*&order=created_at.desc&limit=100");
      return json({ trips, total: trips.length }, 200, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/parcels") {
      await requireAdmin(req);
      const parcels = await restSelect("kaygo_parcels", "select=*&order=created_at.desc&limit=100");
      return json({ parcels, total: parcels.length }, 200, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/matches") {
      await requireAdmin(req);
      const matches = await restSelect("kaygo_matches", "select=*&order=created_at.desc&limit=100");
      return json({ matches, total: matches.length }, 200, corsHeaders);
    }

    return json({ error: "NOT_FOUND", path }, 404, corsHeaders);
  } catch (error) {
    if (error instanceof HttpError) {
      return json({ error: error.code, message: error.message }, error.status, corsHeaders);
    }

    console.error("KAYGO_API_ERROR", error);
    return json({ error: "INTERNAL_ERROR" }, 500, corsHeaders);
  }
});

async function handleLogin(req: Request, headers: HeadersInit) {
  const body = await readJson<{ email?: string; password?: string }>(req);
  const email = body.email?.trim().toLowerCase();
  const password = body.password || "";

  if (!email || !password) {
    throw new HttpError(400, "INVALID_LOGIN_INPUT", "Email and password are required.");
  }

  const users = await restSelect<KaygoUser>(
    "kaygo_users",
    `select=*&email=eq.${encodeURIComponent(email)}&limit=1`,
  );
  const user = users[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  if (user.verification_status === "suspended") {
    throw new HttpError(403, "USER_SUSPENDED", "User is suspended.");
  }

  await audit(user.id, "auth.login", "kaygo_user", user.id, { role: user.role });

  return json({
    token: await signJwt({
      sub: user.id,
      role: user.role,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    }),
    user: serializeUser(user),
  }, 200, headers);
}

async function handlePriceEstimate(req: Request, headers: HeadersInit) {
  const body = await readJson<{
    weightKg?: number;
    pickupOption?: boolean;
    deliveryOption?: boolean;
    urgencyLevel?: string;
    serviceLevel?: "eco" | "confort" | "premium";
    contact?: string;
  }>(req);
  const weightKg = Number(body.weightKg);

  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 30) {
    throw new HttpError(400, "INVALID_WEIGHT", "weightKg must be between 0 and 30.");
  }

  let transportFee = Math.max(8, weightKg * 4);
  const serviceLevel = body.serviceLevel === "confort" || body.serviceLevel === "premium" ? body.serviceLevel : "eco";
  if (serviceLevel === "confort") transportFee *= 1.2;
  if (serviceLevel === "premium") transportFee *= 1.5;
  if (body.urgencyLevel === "urgent") transportFee *= 1.3;

  const serviceFee = Math.max(2, transportFee * 0.15);
  const pickupFee = body.pickupOption ? (weightKg <= 3 ? 7 : 10) : 0;
  const deliveryFee = body.deliveryOption ? (weightKg <= 3 ? 9 : 13) : 0;
  const totalPrice = transportFee + serviceFee + pickupFee + deliveryFee;
  const estimatedDays = body.urgencyLevel === "urgent" ? 3 : serviceLevel === "eco" ? 7 : 5;

  const response = {
    transportFee: roundMoney(transportFee),
    serviceFee: roundMoney(serviceFee),
    pickupFee: roundMoney(pickupFee),
    deliveryFee: roundMoney(deliveryFee),
    totalPrice: roundMoney(totalPrice),
    serviceLevel,
    estimatedDays,
    disclaimer: "Prix indicatif sous réserve de validation du colis, du trajet et des règles douanières.",
  };

  await restInsert("kaygo_estimates", {
    request: body,
    response,
    contact: typeof body.contact === "string" ? body.contact : null,
  });

  return json(response, 200, headers);
}

async function requireAdmin(req: Request) {
  const user = await requireUser(req);
  if (user.role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Admin role required.");
  }
  return user;
}

async function requireUser(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "UNAUTHORIZED", "Missing bearer token.");

  const payload = await verifyJwt(token);
  const users = await restSelect<KaygoUser>(
    "kaygo_users",
    `select=*&id=eq.${encodeURIComponent(payload.sub)}&limit=1`,
  );
  const user = users[0];
  if (!user) throw new HttpError(401, "UNAUTHORIZED", "User not found.");
  return user;
}

async function signJwt(payload: JwtPayload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(`${encodedHeader}.${encodedPayload}`, jwtSecret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyJwt(token: string): Promise<JwtPayload> {
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new HttpError(401, "UNAUTHORIZED", "Malformed token.");
  }

  const expected = await hmac(`${encodedHeader}.${encodedPayload}`, jwtSecret);
  if (!constantTimeEquals(signature, expected)) {
    throw new HttpError(401, "UNAUTHORIZED", "Invalid token.");
  }

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as JwtPayload;
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new HttpError(401, "UNAUTHORIZED", "Expired token.");
  }
  return payload;
}

async function verifyPassword(password: string, passwordHash: string) {
  const [scheme, iterationsText, saltText, hashText] = passwordHash.split("$");
  if (scheme !== "pbkdf2" || !iterationsText || !saltText || !hashText) return false;

  const iterations = Number(iterationsText);
  const salt = base64UrlDecode(saltText);
  const expectedHash = base64UrlDecode(hashText);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    expectedHash.byteLength * 8,
  );
  return constantTimeBytes(new Uint8Array(bits), expectedHash);
}

async function restSelect<T = Record<string, unknown>>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: restHeaders(),
  });
  if (!response.ok) throw new Error(`REST_SELECT_FAILED_${table}_${response.status}`);
  return response.json();
}

async function restInsert(table: string, payload: JsonValue) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...restHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`REST_INSERT_FAILED_${table}_${response.status}`);
}

async function audit(actorUserId: string | null, action: string, entityType?: string, entityId?: string, metadata: JsonValue = {}) {
  await restInsert("kaygo_audit_logs", {
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
  }).catch((error) => console.error("AUDIT_LOG_FAILED", error));
}

function restHeaders() {
  return {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
  };
}

async function readJson<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be JSON.");
  }
}

function serializeUser(user: KaygoUser) {
  return {
    id: user.id,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    verificationStatus: user.verification_status,
    createdAt: user.created_at,
  };
}

function normalizePath(pathname: string) {
  const marker = "/kaygo-api";
  const afterFunction = pathname.includes(marker) ? pathname.slice(pathname.indexOf(marker) + marker.length) : pathname;
  const withoutApi = afterFunction.startsWith("/api/") ? afterFunction.slice(4) : afterFunction;
  return withoutApi === "" ? "/" : withoutApi;
}

function buildCorsHeaders(origin: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "authorization,content-type,apikey",
    "Vary": "Origin",
  };
  if (origin === allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }
  return headers;
}

function json(payload: JsonValue | Record<string, unknown>, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(payload), { status, headers });
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

function base64UrlEncode(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantTimeEquals(left: string, right: string) {
  return constantTimeBytes(new TextEncoder().encode(left), new TextEncoder().encode(right));
}

function constantTimeBytes(left: Uint8Array, right: Uint8Array) {
  if (left.byteLength !== right.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < left.byteLength; i += 1) diff |= left[i] ^ right[i];
  return diff === 0;
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}
