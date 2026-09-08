import type { Role } from "@/lib/domain";

type AuthEvent = "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED";

export type LocalUser = {
  id: string;
  email: string;
  user_metadata: {
    role?: Role;
    display_name?: string;
    full_name?: string;
    phone?: string | null;
  };
};

export type LocalSession = {
  access_token: string;
  user: LocalUser;
};

export type LocalProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  display_name: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type LocalShop = {
  id: string;
  user_id: string;
  shop_name: string;
  shop_type: string;
  license_no: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  province: string | null;
  district: string | null;
  open_time: string | null;
  close_time: string | null;
  cover_url: string | null;
  image_urls?: string[];
  description: string | null;
  verification_status: string;
  created_at: string;
  updated_at: string;
};

export type LocalPrProfile = {
  id: string;
  user_id: string;
  display_name: string;
  birth_date: string | null;
  gender: string | null;
  service_areas: string[];
  bio: string | null;
  experience_years: number;
  languages: string[];
  job_types: string[];
  hourly_rate: number;
  avatar_url: string | null;
  image_urls?: string[];
  profile_status: string;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type LocalAvailability = {
  id: string;
  pr_profile_id: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  created_at: string;
};

export type LocalBooking = {
  id: string;
  customer_user_id?: string | null;
  shop_id: string;
  pr_profile_id: string;
  start_datetime: string;
  end_datetime: string;
  location?: string | null;
  job_detail?: string | null;
  dress_code?: string | null;
  price_estimate?: number;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
  status: string;
  shops?: Pick<LocalShop, "shop_name"> | null;
  pr_profiles?: Pick<LocalPrProfile, "display_name"> | null;
};

export type LocalCustomerSelection = {
  id: string;
  customer_user_id: string;
  shop_id: string | null;
  pr_profile_id: string | null;
  created_at: string;
  updated_at: string;
};

type StoredUser = LocalUser & {
  password: string;
  created_at: string;
};

type LocalData = {
  users: StoredUser[];
  profiles: LocalProfile[];
  user_roles: { id: string; user_id: string; role: Role; created_at: string }[];
  shops: LocalShop[];
  pr_profiles: LocalPrProfile[];
  availability: LocalAvailability[];
  bookings: LocalBooking[];
  customer_selections: LocalCustomerSelection[];
};

const DATA_KEY = "nightlist.local.data.v1";
const SESSION_KEY = "nightlist.local.session.v1";
const listeners = new Set<(event: AuthEvent, session: LocalSession | null) => void>();

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function now() {
  return new Date().toISOString();
}

function id() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `local_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

function emptyData(): LocalData {
  return {
    users: [],
    profiles: [],
    user_roles: [],
    shops: [],
    pr_profiles: [],
    availability: [],
    bookings: [],
    customer_selections: [],
  };
}

function readData(): LocalData {
  const item = storage()?.getItem(DATA_KEY);
  if (!item) return emptyData();
  try {
    return { ...emptyData(), ...JSON.parse(item) };
  } catch {
    return emptyData();
  }
}

function writeData(data: LocalData) {
  storage()?.setItem(DATA_KEY, JSON.stringify(data));
}

function readSession(): LocalSession | null {
  const item = storage()?.getItem(SESSION_KEY);
  if (!item) return null;
  try {
    return JSON.parse(item) as LocalSession;
  } catch {
    storage()?.removeItem(SESSION_KEY);
    return null;
  }
}

function writeSession(session: LocalSession | null) {
  if (session) {
    storage()?.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    storage()?.removeItem(SESSION_KEY);
  }
}

function emit(event: AuthEvent, session: LocalSession | null) {
  listeners.forEach((listener) => listener(event, session));
}

function publicUser(user: StoredUser): LocalUser {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function error(message: string) {
  return { data: { user: null, session: null }, error: new Error(message) };
}

export const localAuth = {
  async getSession() {
    return { data: { session: readSession() }, error: null };
  },

  async getUser() {
    const session = readSession();
    if (!session) return { data: { user: null }, error: new Error("Not signed in") };
    return { data: { user: session.user }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const data = readData();
    const user = data.users.find((item) => item.email === normalizeEmail(email));
    if (!user || user.password !== password) return error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

    const session = { access_token: `local_${id()}`, user: publicUser(user) };
    writeSession(session);
    emit("SIGNED_IN", session);
    return { data: { user: session.user, session }, error: null };
  },

  async signUp({
    email,
    password,
    options,
  }: {
    email: string;
    password: string;
    options?: { data?: LocalUser["user_metadata"] };
  }) {
    if (password.length < 6) return error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    const data = readData();
    const normalizedEmail = normalizeEmail(email);
    if (data.users.some((user) => user.email === normalizedEmail))
      return error("อีเมลนี้ถูกใช้งานแล้ว");

    const user: StoredUser = {
      id: id(),
      email: normalizedEmail,
      password,
      user_metadata: options?.data ?? {},
      created_at: now(),
    };

    data.users.push(user);
    if (user.user_metadata.role) {
      data.user_roles.push({
        id: id(),
        user_id: user.id,
        role: user.user_metadata.role,
        created_at: now(),
      });
    }
    writeData(data);

    const session = { access_token: `local_${id()}`, user: publicUser(user) };
    writeSession(session);
    emit("SIGNED_IN", session);
    return { data: { user: session.user, session }, error: null };
  },

  async resetPassword({ email, password }: { email: string; password: string }) {
    if (password.length < 6) return error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");

    const data = readData();
    const user = data.users.find((item) => item.email === normalizeEmail(email));
    if (!user) return error("ไม่พบบัญชีอีเมลนี้");

    user.password = password;
    writeData(data);

    const session = { access_token: `local_${id()}`, user: publicUser(user) };
    writeSession(session);
    emit("USER_UPDATED", session);
    return { data: { user: session.user, session }, error: null };
  },

  async signOut() {
    writeSession(null);
    emit("SIGNED_OUT", null);
    return { error: null };
  },

  onAuthStateChange(callback: (event: AuthEvent, session: LocalSession | null) => void) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    };
  },
};

export const localDb = {
  async upsertProfile(profile: Omit<LocalProfile, "created_at" | "updated_at">) {
    const data = readData();
    const existing = data.profiles.find((item) => item.id === profile.id);
    if (existing) {
      Object.assign(existing, profile, { updated_at: now() });
    } else {
      data.profiles.push({ ...profile, created_at: now(), updated_at: now() });
    }
    writeData(data);
  },

  async getRoles(userId: string) {
    return readData()
      .user_roles.filter((item) => item.user_id === userId)
      .map((item) => item.role);
  },

  async addRole(userId: string, role: Role) {
    const data = readData();
    if (!data.user_roles.some((item) => item.user_id === userId && item.role === role)) {
      data.user_roles.push({ id: id(), user_id: userId, role, created_at: now() });
      writeData(data);
    }
  },

  async upsertRoles(userId: string, roles: Role[]) {
    for (const role of roles) await this.addRole(userId, role);
  },

  async getMyShop(userId: string) {
    return readData().shops.find((item) => item.user_id === userId) ?? null;
  },

  async linkRecordsToUser(user: LocalUser) {
    const data = readData();
    let changed = false;
    const normalizedEmail = normalizeEmail(user.email);
    const userIds = new Set(data.users.map((item) => item.id));

    const emailShop = data.shops.find(
      (shop) => shop.user_id !== user.id && normalizeEmail(shop.email ?? "") === normalizedEmail,
    );
    if (emailShop) {
      emailShop.user_id = user.id;
      emailShop.updated_at = now();
      changed = true;
    }

    const roles = data.user_roles
      .filter((role) => role.user_id === user.id)
      .map((role) => role.role);
    const orphanPrProfiles = data.pr_profiles.filter((profile) => !userIds.has(profile.user_id));
    if (
      roles.includes("pr") &&
      !data.pr_profiles.some((profile) => profile.user_id === user.id) &&
      orphanPrProfiles.length === 1
    ) {
      orphanPrProfiles[0].user_id = user.id;
      orphanPrProfiles[0].updated_at = now();
      changed = true;
    }

    if (changed) writeData(data);
    return changed;
  },

  async saveShop(
    payload: Omit<LocalShop, "id" | "created_at" | "updated_at" | "verification_status">,
  ) {
    const data = readData();
    const existing = data.shops.find((item) => item.user_id === payload.user_id);
    if (existing) {
      Object.assign(existing, payload, { updated_at: now() });
    } else {
      data.shops.push({
        ...payload,
        id: id(),
        verification_status: "submitted",
        created_at: now(),
        updated_at: now(),
      });
    }
    writeData(data);
  },

  async getMyPrProfile(userId: string) {
    return readData().pr_profiles.find((item) => item.user_id === userId) ?? null;
  },

  async getCustomerDirectory() {
    const data = readData();
    return {
      shops: data.shops.slice().sort((a, b) => a.shop_name.localeCompare(b.shop_name, "th")),
      prProfiles: data.pr_profiles
        .slice()
        .sort((a, b) => a.display_name.localeCompare(b.display_name, "th")),
    };
  },

  async getCustomerSelection(userId: string) {
    return readData().customer_selections.find((item) => item.customer_user_id === userId) ?? null;
  },

  async saveCustomerSelection({
    userId,
    shopId,
    prProfileId,
  }: {
    userId: string;
    shopId: string | null;
    prProfileId: string | null;
  }) {
    const data = readData();
    const existing = data.customer_selections.find((item) => item.customer_user_id === userId);
    if (existing) {
      existing.shop_id = shopId;
      existing.pr_profile_id = prProfileId;
      existing.updated_at = now();
    } else {
      data.customer_selections.push({
        id: id(),
        customer_user_id: userId,
        shop_id: shopId,
        pr_profile_id: prProfileId,
        created_at: now(),
        updated_at: now(),
      });
    }
    writeData(data);
  },

  async savePrProfile(
    payload: Omit<
      LocalPrProfile,
      "id" | "created_at" | "updated_at" | "profile_status" | "rating_average" | "rating_count"
    >,
  ) {
    const data = readData();
    const existing = data.pr_profiles.find((item) => item.user_id === payload.user_id);
    if (existing) {
      Object.assign(existing, payload, { updated_at: now() });
    } else {
      data.pr_profiles.push({
        ...payload,
        id: id(),
        profile_status: "submitted",
        rating_average: 0,
        rating_count: 0,
        created_at: now(),
        updated_at: now(),
      });
    }
    writeData(data);
  },

  async getAvailability(prProfileId: string) {
    return readData()
      .availability.filter((item) => item.pr_profile_id === prProfileId)
      .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime));
  },

  async addAvailability(payload: Omit<LocalAvailability, "id" | "created_at">) {
    const data = readData();
    data.availability.push({ ...payload, id: id(), created_at: now() });
    writeData(data);
  },

  async removeAvailability(availabilityId: string) {
    const data = readData();
    data.availability = data.availability.filter((item) => item.id !== availabilityId);
    writeData(data);
  },

  enrichBooking(data: LocalData, booking: LocalBooking) {
    return {
      ...booking,
      shops: data.shops.find((shop) => shop.id === booking.shop_id) ?? null,
      pr_profiles: data.pr_profiles.find((pr) => pr.id === booking.pr_profile_id) ?? null,
    };
  },

  async getBookings(userId: string) {
    const data = readData();
    const roles = data.user_roles
      .filter((role) => role.user_id === userId)
      .map((role) => role.role);
    const ownShopIds = new Set(
      data.shops.filter((shop) => shop.user_id === userId).map((shop) => shop.id),
    );
    const ownPrIds = new Set(
      data.pr_profiles.filter((profile) => profile.user_id === userId).map((profile) => profile.id),
    );

    return data.bookings
      .filter(
        (booking) =>
          roles.includes("admin") ||
          booking.customer_user_id === userId ||
          ownShopIds.has(booking.shop_id) ||
          ownPrIds.has(booking.pr_profile_id),
      )
      .map((booking) => this.enrichBooking(data, booking))
      .sort((a, b) => b.start_datetime.localeCompare(a.start_datetime));
  },

  async createBooking(
    payload: Omit<
      LocalBooking,
      "id" | "status" | "created_at" | "updated_at" | "shops" | "pr_profiles"
    >,
  ) {
    const data = readData();
    data.bookings.push({
      ...payload,
      id: id(),
      status: "pending",
      created_at: now(),
      updated_at: now(),
    });
    writeData(data);
  },

  async updateBookingStatus(bookingId: string, status: string) {
    const data = readData();
    const booking = data.bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    booking.status = status;
    booking.updated_at = now();
    writeData(data);
  },

  async getDashboardBookings(userId: string) {
    return (await this.getBookings(userId)).slice(0, 5);
  },

  async searchPrProfiles(filters: {
    province?: string;
    jobType?: string;
    language?: string;
    maxRate?: string;
    minRating?: string;
    minExp?: string;
    availableFrom?: string;
    availableTo?: string;
  }) {
    const data = readData();
    let list = data.pr_profiles.filter((profile) => profile.profile_status === "approved");

    if (filters.province)
      list = list.filter((profile) => profile.service_areas.includes(filters.province!));
    if (filters.jobType)
      list = list.filter((profile) => profile.job_types.includes(filters.jobType!));
    if (filters.language)
      list = list.filter((profile) => profile.languages.includes(filters.language!));
    if (filters.maxRate)
      list = list.filter((profile) => profile.hourly_rate <= Number(filters.maxRate));
    if (filters.minRating)
      list = list.filter((profile) => profile.rating_average >= Number(filters.minRating));
    if (filters.minExp)
      list = list.filter((profile) => profile.experience_years >= Number(filters.minExp));

    if (filters.availableFrom && filters.availableTo) {
      const from = new Date(filters.availableFrom).toISOString();
      const to = new Date(filters.availableTo).toISOString();
      const availablePrIds = new Set(
        data.availability
          .filter(
            (slot) =>
              slot.status === "available" && slot.start_datetime <= from && slot.end_datetime >= to,
          )
          .map((slot) => slot.pr_profile_id),
      );
      const busyPrIds = new Set(
        data.bookings
          .filter(
            (booking) =>
              booking.status === "accepted" &&
              booking.start_datetime < to &&
              booking.end_datetime > from,
          )
          .map((booking) => booking.pr_profile_id),
      );
      list = list.filter((profile) => availablePrIds.has(profile.id) && !busyPrIds.has(profile.id));
    }

    return list.sort((a, b) => b.rating_average - a.rating_average).slice(0, 60);
  },
};
