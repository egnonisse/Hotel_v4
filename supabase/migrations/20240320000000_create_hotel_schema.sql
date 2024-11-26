-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing
-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create ENUM types
create type room_status as enum(
  'available',
  'occupied',
  'cleaning',
  'maintenance',
  'out_of_order'
);

create type reservation_status as enum(
  'pending',
  'confirmed',
  'checked_in',
  'checked_out',
  'cancelled',
  'no_show'
);

create type feature_category as enum(
  'amenity',
  'furniture',
  'technology',
  'accessibility',
  'view'
);

-- Create hotels table first (since it's referenced by rooms)
create table
  hotels (
    id uuid primary key default uuid_generate_v4 (),
    name text not null,
    description text,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp
  );

-- Create rooms table
create table
  rooms (
    id uuid primary key default uuid_generate_v4 (),
    hotel_id uuid not null references hotels (id) on delete cascade,
    name text not null,
    type text not null,
    base_price decimal(10, 2) not null,
    capacity int not null default 2,
    max_capacity int not null default 2,
    floor_number int,
    room_number text not null,
    size_sqm decimal(6, 2),
    status room_status not null default 'available',
    description text,
    photos JSONB,
    smoking_allowed boolean default false,
    pet_friendly boolean default false,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    unique (hotel_id, room_number)
  );

-- Create room_availabilities table
create table
  room_availabilities (
    id uuid primary key default uuid_generate_v4 (),
    room_id uuid not null references rooms (id) on delete cascade,
    date DATE not null,
    is_available boolean not null default true,
    price_modifier decimal(4, 2) default 1.00,
    reason text,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    unique (room_id, date)
  );

-- Create customers table (needed for reservations)
create table
  customers (
    id uuid primary key default uuid_generate_v4 (),
    name text not null,
    email text not null,
    phone text,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    unique (email)
  );

-- Create room_reservations table
create table
  room_reservations (
    id uuid primary key default uuid_generate_v4 (),
    room_id uuid not null references rooms (id) on delete cascade,
    customer_id uuid not null references customers (id) on delete cascade,
    check_in_date DATE not null,
    check_out_date DATE not null,
    status reservation_status not null default 'pending',
    total_price decimal(10, 2) not null,
    deposit_amount decimal(10, 2),
    guest_count int not null,
    special_requests text,
    cancellation_reason text,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    constraint check_dates check (check_out_date > check_in_date)
  );

-- Create room_features table
create table
  room_features (
    id uuid primary key default uuid_generate_v4 (),
    name text not null,
    description text,
    icon text,
    category feature_category not null,
    is_active boolean default true,
    created_at timestamp with time zone default current_timestamp,
    updated_at timestamp with time zone default current_timestamp,
    unique (name)
  );

-- Create room_feature_assignments table
create table
  room_feature_assignments (
    id uuid primary key default uuid_generate_v4 (),
    room_id uuid not null references rooms (id) on delete cascade,
    feature_id uuid not null references room_features (id) on delete cascade,
    quantity int default 1,
    notes text,
    created_at timestamp with time zone default current_timestamp,
    unique (room_id, feature_id)
  );

-- Create updated_at triggers
create
or replace function update_updated_at_column () returns trigger as $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
create trigger update_hotels_updated_at before
update on hotels for each row
execute function update_updated_at_column ();

create trigger update_rooms_updated_at before
update on rooms for each row
execute function update_updated_at_column ();

create trigger update_room_availabilities_updated_at before
update on room_availabilities for each row
execute function update_updated_at_column ();

create trigger update_customers_updated_at before
update on customers for each row
execute function update_updated_at_column ();

create trigger update_room_reservations_updated_at before
update on room_reservations for each row
execute function update_updated_at_column ();

create trigger update_room_features_updated_at before
update on room_features for each row
execute function update_updated_at_column ();

-- Set up RLS (Row Level Security)
alter table hotels enable row level security;

alter table rooms enable row level security;

alter table room_availabilities enable row level security;

alter table customers enable row level security;

alter table room_reservations enable row level security;

alter table room_features enable row level security;

alter table room_feature_assignments enable row level security;

-- Create policies
create policy "Enable read access for all users" on hotels for
select
  using (true);

create policy "Enable read access for all users" on rooms for
select
  using (true);

create policy "Enable read access for all users" on room_features for
select
  using (true);

-- Add indexes for better performance
create index idx_rooms_hotel_id on rooms (hotel_id);

create index idx_room_availabilities_room_id on room_availabilities (room_id);

create index idx_room_reservations_room_id on room_reservations (room_id);

create index idx_room_reservations_customer_id on room_reservations (customer_id);

create index idx_room_feature_assignments_room_id on room_feature_assignments (room_id);

create index idx_room_feature_assignments_feature_id on room_feature_assignments (feature_id);

-- Create a trigger function to check guest count
create
or replace function check_guest_count () returns trigger as $$
BEGIN
    IF NEW.guest_count > (SELECT max_capacity FROM rooms WHERE id = NEW.room_id) THEN
        RAISE EXCEPTION 'Guest count exceeds room capacity';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to enforce guest count check
create trigger trg_check_guest_count before insert
or
update on room_reservations for each row
execute function check_guest_count ();