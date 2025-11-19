# Database Schema Documentation

This document outlines the database schema for Vibepoint using Supabase (PostgreSQL).

## Tables

### `mood_entries`

Stores individual mood log entries created by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique identifier for the entry |
| `user_id` | uuid | FOREIGN KEY, NOT NULL | References auth.users(id) |
| `created_at` | timestamp with time zone | NOT NULL, DEFAULT now() | When the entry was created |
| `mood_x` | numeric | NOT NULL, CHECK (0-100) | Motivation level (0=unmotivated, 100=motivated) |
| `mood_y` | numeric | NOT NULL, CHECK (0-100) | Happiness level inverted (0=happy, 100=unhappy) |
| `focus` | text | NOT NULL | What the user is focusing on |
| `self_talk` | text | NOT NULL | What the user is telling themselves |
| `physical` | text | NOT NULL | Physical sensations noticed |
| `notes` | text | NULL | Optional additional notes |

**Indexes:**
- `mood_entries_user_id_created_at_idx` on (user_id, created_at DESC) - For efficient queries

**Row Level Security (RLS):**
- Users can only view/insert/update/delete their own entries
- Enforced through `user_id = auth.uid()` policy

### `user_preferences`

Stores user-specific preferences and settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique identifier |
| `user_id` | uuid | FOREIGN KEY, UNIQUE, NOT NULL | References auth.users(id) |
| `onboarding_completed` | boolean | DEFAULT false | Whether user completed onboarding |
| `created_at` | timestamp with time zone | NOT NULL, DEFAULT now() | When preferences were created |
| `updated_at` | timestamp with time zone | NOT NULL, DEFAULT now() | Last update timestamp |

**Row Level Security (RLS):**
- Users can only view/insert/update their own preferences
- Enforced through `user_id = auth.uid()` policy

## SQL Setup Script

Run this in your Supabase SQL editor:

```sql
-- Create mood_entries table
create table mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  mood_x numeric not null check (mood_x >= 0 and mood_x <= 100),
  mood_y numeric not null check (mood_y >= 0 and mood_y <= 100),
  focus text not null,
  self_talk text not null,
  physical text not null,
  notes text
);

-- Enable Row Level Security
alter table mood_entries enable row level security;

-- Create RLS policies for mood_entries
create policy "Users can view their own mood entries"
  on mood_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mood entries"
  on mood_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mood entries"
  on mood_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own mood entries"
  on mood_entries for delete
  using (auth.uid() = user_id);

-- Create index for better query performance
create index mood_entries_user_id_created_at_idx
  on mood_entries (user_id, created_at desc);

-- Create user_preferences table
create table user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table user_preferences enable row level security;

-- Create RLS policies for user_preferences
create policy "Users can view their own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);
```

## Data Model Relationships

```
auth.users (Supabase Auth)
    |
    ├── mood_entries (one-to-many)
    │   └── Contains: mood coordinates, questions, notes
    │
    └── user_preferences (one-to-one)
        └── Contains: onboarding status, settings
```

## Query Patterns

### Get Recent Mood Entries
```sql
SELECT * FROM mood_entries
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
```

### Get Entries for Date Range
```sql
SELECT * FROM mood_entries
WHERE user_id = auth.uid()
  AND created_at >= '2024-01-01'
  AND created_at < '2024-02-01'
ORDER BY created_at DESC;
```

### Count Entries This Week
```sql
SELECT COUNT(*) FROM mood_entries
WHERE user_id = auth.uid()
  AND created_at >= date_trunc('week', CURRENT_DATE);
```

### Get Focus Area Statistics
```sql
SELECT
  focus,
  COUNT(*) as count,
  AVG(100 - mood_y) as avg_happiness,
  AVG(mood_x) as avg_motivation
FROM mood_entries
WHERE user_id = auth.uid()
GROUP BY focus
ORDER BY count DESC
LIMIT 5;
```

## Backup and Migration

### Export User Data
```sql
-- Export all data for a specific user
SELECT * FROM mood_entries
WHERE user_id = 'user-uuid-here'
ORDER BY created_at;
```

### Data Privacy Considerations

- All tables use Row Level Security (RLS)
- Users can only access their own data
- Deletion is soft-delete capable (can be modified if needed)
- No PII beyond what user provides in auth
- Mood data is encrypted at rest by Supabase

## Future Enhancements

Potential schema additions:

1. **Tags table** - For categorizing mood entries
2. **Shared insights** - Allow users to share anonymized patterns
3. **Reminders** - Scheduled notifications to log moods
4. **Export history** - Track user data exports for GDPR compliance
