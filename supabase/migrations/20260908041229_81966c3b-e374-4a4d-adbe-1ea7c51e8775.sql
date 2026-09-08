CREATE TYPE public.app_role AS ENUM ('shop','pr','agency','admin');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "profiles_select_own_or_admin" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles_select_own_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles_insert_own_non_admin" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role <> 'admin');

-- shops
CREATE TABLE public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name TEXT NOT NULL,
  shop_type TEXT NOT NULL DEFAULT 'bar',
  license_no TEXT,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  province TEXT,
  district TEXT,
  open_time TEXT,
  close_time TEXT,
  cover_url TEXT,
  description TEXT,
  verification_status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shops TO authenticated;
GRANT ALL ON public.shops TO service_role;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shops_select" ON public.shops FOR SELECT TO authenticated
  USING (verification_status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "shops_insert_own" ON public.shops FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "shops_update_own_or_admin" ON public.shops FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "shops_delete_own_or_admin" ON public.shops FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- pr_profiles
CREATE TABLE public.pr_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  service_areas TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  experience_years INT NOT NULL DEFAULT 0,
  languages TEXT[] NOT NULL DEFAULT '{}',
  job_types TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  avatar_url TEXT,
  profile_status TEXT NOT NULL DEFAULT 'submitted',
  rating_average NUMERIC NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pr_profiles TO authenticated;
GRANT ALL ON public.pr_profiles TO service_role;
ALTER TABLE public.pr_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_select" ON public.pr_profiles FOR SELECT TO authenticated
  USING (profile_status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pr_insert_own" ON public.pr_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "pr_update_own_or_admin" ON public.pr_profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pr_delete_own_or_admin" ON public.pr_profiles FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER pr_updated_at BEFORE UPDATE ON public.pr_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.owns_pr_profile(_pr_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.pr_profiles WHERE id = _pr_id AND user_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.owns_shop(_shop_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.shops WHERE id = _shop_id AND user_id = auth.uid())
$$;

-- availability
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_profile_id UUID NOT NULL REFERENCES public.pr_profiles(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.availability TO authenticated;
GRANT ALL ON public.availability TO service_role;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avail_select" ON public.availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "avail_write_own" ON public.availability FOR INSERT TO authenticated WITH CHECK (public.owns_pr_profile(pr_profile_id));
CREATE POLICY "avail_update_own" ON public.availability FOR UPDATE TO authenticated
  USING (public.owns_pr_profile(pr_profile_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.owns_pr_profile(pr_profile_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "avail_delete_own" ON public.availability FOR DELETE TO authenticated
  USING (public.owns_pr_profile(pr_profile_id) OR public.has_role(auth.uid(),'admin'));

-- bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  pr_profile_id UUID NOT NULL REFERENCES public.pr_profiles(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  location TEXT,
  job_detail TEXT,
  dress_code TEXT,
  price_estimate NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_parties" ON public.bookings FOR SELECT TO authenticated
  USING (public.owns_shop(shop_id) OR public.owns_pr_profile(pr_profile_id) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "bookings_insert_shop" ON public.bookings FOR INSERT TO authenticated WITH CHECK (public.owns_shop(shop_id));
CREATE POLICY "bookings_update_parties" ON public.bookings FOR UPDATE TO authenticated
  USING (public.owns_shop(shop_id) OR public.owns_pr_profile(pr_profile_id) OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.owns_shop(shop_id) OR public.owns_pr_profile(pr_profile_id) OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('pending','accepted') AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.pr_profile_id = NEW.pr_profile_id
      AND b.id <> NEW.id
      AND b.status = 'accepted'
      AND b.start_datetime < NEW.end_datetime
      AND b.end_datetime > NEW.start_datetime
  ) THEN
    RAISE EXCEPTION 'ช่วงเวลานี้ถูกจองแล้ว';
  END IF;
  IF NEW.end_datetime <= NEW.start_datetime THEN
    RAISE EXCEPTION 'เวลาสิ้นสุดต้องหลังเวลาเริ่ม';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER bookings_no_overlap BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.prevent_double_booking();

-- reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  pr_profile_id UUID REFERENCES public.pr_profiles(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (booking_id, reviewer_user_id)
);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT TO authenticated WITH CHECK (reviewer_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.recalc_pr_rating()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.pr_profile_id IS NOT NULL THEN
    UPDATE public.pr_profiles p SET
      rating_average = COALESCE((SELECT ROUND(AVG(r.rating)::numeric,2) FROM public.reviews r WHERE r.pr_profile_id = p.id),0),
      rating_count = (SELECT COUNT(*) FROM public.reviews r WHERE r.pr_profile_id = p.id)
    WHERE p.id = NEW.pr_profile_id;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER reviews_recalc AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.recalc_pr_rating();

-- reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id UUID,
  category TEXT NOT NULL,
  detail TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_select_own_or_admin" ON public.reports FOR SELECT TO authenticated
  USING (reporter_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT TO authenticated WITH CHECK (reporter_user_id = auth.uid());
CREATE POLICY "reports_update_admin" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();