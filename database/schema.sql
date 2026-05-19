create extension if not exists "uuid-ossp";

create table if not exists api_sources (
  id uuid primary key default uuid_generate_v4(),
  section text not null,
  name text not null,
  url text not null,
  source_type text default 'generic-json',
  is_free boolean default true,
  enabled boolean default true,
  created_at timestamptz default now()
);

create table if not exists orbital_objects (
  id uuid primary key default uuid_generate_v4(),
  norad_id integer unique,
  object_name text not null,
  object_type text not null check (object_type in ('active', 'inactive', 'debris')),
  regime text not null check (regime in ('LEO', 'MEO', 'GEO', 'HEO')),
  altitude_km numeric not null,
  inclination_deg numeric,
  eccentricity numeric,
  velocity_kms numeric,
  mass_kg numeric,
  latitude_deg numeric,
  longitude_deg numeric,
  source_name text,
  updated_at timestamptz default now()
);

create table if not exists survey_responses (
  id uuid primary key default uuid_generate_v4(),
  submitted_at timestamptz default now(),
  awareness_level text not null,
  gps_dependency text not null,
  communication_dependency text not null,
  sustainability_priority text not null,
  age_group text,
  region text
);

create table if not exists collision_simulations (
  id uuid primary key default uuid_generate_v4(),
  object_a text,
  object_b text,
  miss_distance_km numeric,
  relative_velocity_kms numeric,
  kinetic_energy_j numeric,
  probability_percent numeric,
  risk_level text,
  created_at timestamptz default now()
);

create table if not exists kessler_runs (
  id uuid primary key default uuid_generate_v4(),
  scenario_name text not null,
  years integer not null,
  initial_debris integer not null,
  mitigation_rate numeric default 0,
  peak_debris integer,
  created_at timestamptz default now()
);

create index if not exists orbital_objects_regime_idx on orbital_objects(regime);
create index if not exists orbital_objects_type_idx on orbital_objects(object_type);
create index if not exists survey_submitted_at_idx on survey_responses(submitted_at);
