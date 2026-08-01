REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE ALL ON FUNCTION public.notify_push_on_notification() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_push_on_notification() TO service_role;

REVOKE ALL ON FUNCTION public.request_withdrawal(text, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(text, numeric) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;