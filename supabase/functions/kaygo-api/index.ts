import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type JsonValue = Record<string, unknown> | unknown[];

type KaygoAdmin = {
  email: string;
  role: "admin";
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
const schema = "kaygo";

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

    if (req.method === "GET" && path === "/") {
      return json({ ok: true, service: "kaygo-api", schema }, 200, corsHeaders);
    }

    if (req.method === "POST" && path === "/auth/login") {
      return await handleLogin(req, corsHeaders);
    }

    if (req.method === "POST" && path === "/pricing/estimate") {
      return await handlePriceEstimate(req, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/me") {
      const user = await requireAdmin(req);
      return json({ user: serializeUser(user) }, 200, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/trips") {
      await requireAdmin(req);
      const trips = await restSelect("trips", "select=*&order=created_at.desc&limit=100");
      return json({ trips, total: trips.length }, 200, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/parcels") {
      await requireAdmin(req);
      const parcels = await restSelect("parcels", "select=*&order=created_at.desc&limit=100");
      return json({ parcels, total: parcels.length }, 200, corsHeaders);
    }

    if (req.method === "GET" && path === "/admin/matches") {
      await requireAdmin(req);
      const matches = await restSelect("matches", "select=*&order=created_at.desc&limit=100");
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
  const adminEmail = optionalEnv("KAYGO_ADMIN_EMAIL")?.trim().toLowerCase();
  const adminPassword = optionalEnv("KAYGO_ADMIN_PASSWORD");

  if (!email || !password) {
    throw new HttpError(400, "INVALID_LOGIN_INPUT", "Email and password are required.");
  }

  if (!adminEmail || !adminPassword || !optionalEnv("KAYGO_JWT_SECRET")) {
    throw new HttpError(503, "ADMIN_LOGIN_NOT_CONFIGURED", "Admin login secrets are not configured.");
  }

  if (email !== adminEmail || !constantTimeEquals(password, adminPassword)) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  }

  const admin: KaygoAdmin = { email: adminEmail, role: "admin" };
  await audit(admin.email, "auth.login", "admin", undefined, { role: admin.role });

  return json({
    token: await signJwt({
      sub: admin.email,
      role: admin.role,
      email: admin.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    }),
    user: serializeUser(admin),
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
    departureCity?: string;
    arrivalCity?: string;
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

  await createEstimate({
    departure_city: typeof body.departureCity === "string" ? body.departureCity : "France",
    arrival_city: typeof body.arrivalCity === "string" ? body.arrivalCity : "Martinique",
    weight_kg: weightKg,
    service_level: serviceLevel,
    urgency_level: typeof body.urgencyLevel === "string" ? body.urgencyLevel : "normal",
    pickup_option: Boolean(body.pickupOption),
    delivery_option: Boolean(body.deliveryOption),
    contact: typeof body.contact === "string" ? body.contact : null,
    result: response,
    status: "estimated",
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
  if (payload.role !== "admin") {
    throw new HttpError(403, "FORBIDDEN", "Admin role required.");
  }
  return { email: payload.email, role: "admin" } as KaygoAdmin;
}

async function signJwt(payload: JwtPayload) {
  const jwtSecret = requiredEnv("KAYGO_JWT_SECRET");
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(`${encodedHeader}.${encodedPayload}`, jwtSecret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyJwt(token: string): Promise<JwtPayload> {
  const jwtSecret = requiredEnv("KAYGO_JWT_SECRET");
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

async function restSelect<T = Record<string, unknown>>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: {
      ...restHeaders(),
      "Accept-Profile": schema,
    },
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
      "Content-Profile": schema,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`REST_INSERT_FAILED_${table}_${response.status}`);
}

async function createEstimate(payload: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/kaygo_create_estimate`, {
    method: "POST",
    headers: {
      ...restHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ payload }),
  });
  if (!response.ok) throw new Error(`RPC_CREATE_ESTIMATE_FAILED_${response.status}`);
}

async function audit(actor: string | null, action: string, targetType?: string, targetId?: string, metadata: JsonValue = {}) {
  await restInsert("audit_logs", {
    actor,
    action,
    target_type: targetType,
    target_id: targetId,
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
    const text = await req.text();
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new HttpError(400, "INVALID_JSON", "Request body must be JSON.");
  }
}

function serializeUser(user: KaygoAdmin) {
  return {
    id: user.email,
    role: user.role,
    firstName: "KayGo",
    lastName: "Admin",
    email: user.email,
    phone: null,
    verificationStatus: "verified",
  };
}

function normalizePath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const afterFunction = segments.length > 0 ? `/${segments.slice(1).join("/")}` : "/";
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

function optionalEnv(name: string) {
  return Deno.env.get(name) || "";
}

class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
