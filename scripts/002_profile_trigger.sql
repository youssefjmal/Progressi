-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    language,
    age,
    gender,
    height,
    current_weight,
    goal_weight,
    activity_level,
    calorie_target
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    coalesce(new.raw_user_meta_data ->> 'language', 'en'),
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    nullif(new.raw_user_meta_data ->> 'gender', ''),
    nullif(new.raw_user_meta_data ->> 'height', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'current_weight', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'goal_weight', '')::numeric,
    nullif(new.raw_user_meta_data ->> 'activity_level', ''),
    nullif(new.raw_user_meta_data ->> 'calorie_target', '')::integer
  )
  on conflict (id) do update set
    first_name     = coalesce(excluded.first_name,     profiles.first_name),
    last_name      = coalesce(excluded.last_name,      profiles.last_name),
    language       = coalesce(excluded.language,       profiles.language),
    age            = coalesce(excluded.age,            profiles.age),
    gender         = coalesce(excluded.gender,         profiles.gender),
    height         = coalesce(excluded.height,         profiles.height),
    current_weight = coalesce(excluded.current_weight, profiles.current_weight),
    goal_weight    = coalesce(excluded.goal_weight,    profiles.goal_weight),
    activity_level = coalesce(excluded.activity_level, profiles.activity_level),
    calorie_target = coalesce(excluded.calorie_target, profiles.calorie_target);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
