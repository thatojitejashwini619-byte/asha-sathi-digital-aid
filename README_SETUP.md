# ASHAsathi - Setup Instructions

## Frontend Setup Complete ✅

The frontend is ready with:
- ✅ Login/Signup with email & password
- ✅ Patient registration with offline storage
- ✅ Visit recording with vitals
- ✅ Location permission (GPS tracking)
- ✅ Notification permission
- ✅ SMS messages toggle
- ✅ Offline-first architecture with localStorage
- ✅ Auto-sync indicator (ready for backend integration)
- ✅ Role-based UI (ASHA/PHC staff)

## Next Steps: Connect Your Supabase

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for the database to be provisioned

### 2. Get Your Credentials
From your Supabase project dashboard:
- Go to **Settings** → **API**
- Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)
- Copy the **anon/public key**

### 3. Add Environment Variables
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Database Schema (Run in Supabase SQL Editor)

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text check (role in ('asha', 'phc')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create patients table
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  age integer not null,
  gender text not null,
  phone text,
  address text not null,
  latitude decimal,
  longitude decimal,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.patients enable row level security;

create policy "Users can view own patients"
  on public.patients for select
  using (auth.uid() = user_id);

create policy "Users can insert own patients"
  on public.patients for insert
  with check (auth.uid() = user_id);

-- Create visits table
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  patient_id uuid references public.patients on delete cascade not null,
  date timestamp with time zone not null,
  notes text,
  weight decimal,
  temperature decimal,
  blood_pressure text,
  latitude decimal,
  longitude decimal,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.visits enable row level security;

create policy "Users can view own visits"
  on public.visits for select
  using (auth.uid() = user_id);

create policy "Users can insert own visits"
  on public.visits for insert
  with check (auth.uid() = user_id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 5. Configure Auth Settings
In Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: Your app URL (e.g., `https://yourdomain.com`)
- **Redirect URLs**: Add your app URL

### 6. Implement Sync Functions
Update `src/lib/offlineStorage.ts` to add sync functions that push data to Supabase when online.

## Features Implemented

### Authentication
- Email/password login & signup
- Role selection (ASHA worker / PHC staff)
- Session persistence
- Protected routes

### Patient Management
- Register patients with demographics
- Offline storage in localStorage
- GPS location capture (if permission granted)
- Sync status tracking

### Visit Recording
- Select patient from list
- Record visit notes
- Capture vitals (weight, temperature, BP)
- GPS location tracking

### Permissions
- Location access (GPS tracking)
- Notifications (reminders & alerts)
- SMS messages toggle

### Offline-First
- All data saved to localStorage first
- Sync indicator shows online/offline status
- Unsynced records counter
- Manual sync button

## Current Limitations

1. **No actual Supabase sync yet** - The sync button simulates syncing. You need to implement actual API calls to Supabase.

2. **No voice input** - Voice-to-text for local language input needs Web Speech API implementation.

3. **No multilingual support** - Currently English only. Need i18n library for Hindi/Telugu/Marathi.

4. **No reminders/scheduling** - Vaccination and ANC reminders need to be implemented.

5. **No PHC web dashboard** - Supervisor analytics dashboard is separate project.

6. **No AI validation** - Form validation assistant needs to be added.

## Next Development Steps

1. Implement Supabase sync functions
2. Add multilingual support (i18n)
3. Implement voice input
4. Add vaccination/ANC reminder system
5. Build PHC supervisor dashboard (separate app)
6. Add AI-powered data validation
7. Implement report generation
8. Add Capacitor for native mobile features

## Running the App

```bash
npm install
npm run dev
```

The app will run at `http://localhost:8080`
