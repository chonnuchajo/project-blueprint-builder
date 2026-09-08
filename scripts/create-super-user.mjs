import { createClient } from "@supabase/supabase-js";

const ALL_ROLES = ["shop", "pr", "agency", "admin"];

function requiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) {
    console.error(`Missing ${fallbackName ? `${name} or ${fallbackName}` : name}`);
    process.exit(1);
  }
  return value;
}

function createSupabaseFetch(supabaseKey) {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      (supabaseKey.startsWith("sb_publishable_") || supabaseKey.startsWith("sb_secret_")) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

async function findUserByEmail(supabase, email) {
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const users = data?.users ?? [];
    const user = users.find((item) => item.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (users.length < 1000) return null;
  }

  throw new Error("User lookup stopped after 100000 users");
}

async function main() {
  const supabaseUrl = requiredEnv("SUPABASE_URL", "VITE_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const email = requiredEnv("SUPER_USER_EMAIL", "ADMIN_EMAIL");
  const password = requiredEnv("SUPER_USER_PASSWORD", "ADMIN_PASSWORD");
  const displayName =
    process.env.SUPER_USER_DISPLAY_NAME || process.env.ADMIN_DISPLAY_NAME || "Super Admin";
  const phone = process.env.SUPER_USER_PHONE || process.env.ADMIN_PHONE || null;

  if (password.length < 6) {
    throw new Error("SUPER_USER_PASSWORD or ADMIN_PASSWORD must be at least 6 characters");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    global: { fetch: createSupabaseFetch(serviceRoleKey) },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let user = await findUserByEmail(supabase, email);

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        role: "admin",
        display_name: displayName,
        phone,
      },
    });
    if (error) throw error;
    user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        display_name: displayName,
        phone,
      },
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      phone,
      display_name: displayName,
      status: "approved",
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  const { error: rolesError } = await supabase.from("user_roles").upsert(
    ALL_ROLES.map((role) => ({ user_id: user.id, role })),
    { onConflict: "user_id,role", ignoreDuplicates: true },
  );
  if (rolesError) throw rolesError;

  console.log(`Super user ready: ${email}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Roles: ${ALL_ROLES.join(", ")}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
