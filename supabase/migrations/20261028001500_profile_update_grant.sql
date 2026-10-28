GRANT UPDATE (name, phone, location) ON public.profiles TO authenticated;
REVOKE EXECUTE ON FUNCTION public.pilot_new_user() FROM PUBLIC, anon, authenticated;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_field_lengths CHECK (length(name)<=100 AND length(phone)<=30 AND length(location)<=500) NOT VALID;