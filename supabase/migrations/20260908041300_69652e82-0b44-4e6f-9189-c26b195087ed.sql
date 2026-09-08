REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.prevent_double_booking() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalc_pr_rating() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_pr_profile(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.owns_shop(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_pr_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_shop(uuid) TO authenticated, service_role;