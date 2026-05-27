import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const adminConfigPath = path.join(root, "config", "admin.config.json");

function parseEnv(raw) {
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }
  return out;
}

async function main() {
  const envRaw = await fs.readFile(envPath, "utf8");
  const env = parseEnv(envRaw);

  const secretKey = process.env.CLERK_SECRET_KEY || env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY introuvable dans .env.local");
  }

  const adminEmail = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || "admin@mapetitelingerie.fr";
  const generatedPassword = `MPL-${randomBytes(6).toString("hex")}-A9!`;
  const adminPassword = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || generatedPassword;

  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };

  async function clerkRequest(endpoint, init = {}) {
    const response = await fetch(`https://api.clerk.com/v1${endpoint}`, {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    return { response, payload };
  }

  const usersResult = await clerkRequest("/users?limit=100", { method: "GET" });
  if (!usersResult.response.ok || !Array.isArray(usersResult.payload)) {
    throw new Error("Impossible de lire les utilisateurs Clerk");
  }

  const users = usersResult.payload;

  let adminUser = users.find((user) =>
    (user.email_addresses || []).some((entry) => entry.email_address?.toLowerCase() === adminEmail.toLowerCase()),
  );

  let created = false;

  if (!adminUser) {
    const createResult = await clerkRequest("/users", {
      method: "POST",
      body: JSON.stringify({
        email_address: [adminEmail],
        password: adminPassword,
      }),
    });

    if (!createResult.response.ok) {
      const msg = createResult.payload?.errors?.[0]?.message || createResult.payload?.message || "Echec creation utilisateur admin";
      throw new Error(msg);
    }

    adminUser = createResult.payload;
    created = true;
  }

  const adminConfigRaw = await fs.readFile(adminConfigPath, "utf8");
  const adminConfig = JSON.parse(adminConfigRaw);

  adminConfig.allowAnySignedInUser = false;
  adminConfig.adminUserIds = [adminUser.id];
  adminConfig.notes = `Admin unique: ${adminEmail}`;

  await fs.writeFile(adminConfigPath, `${JSON.stringify(adminConfig, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        created,
        adminEmail,
        adminUserId: adminUser.id,
        adminPassword: created ? adminPassword : "(deja existant - mot de passe inchange)",
        adminConfigPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
