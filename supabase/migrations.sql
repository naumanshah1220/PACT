-- Run this in the Supabase SQL Editor

-- 1. Player number — unique sequential ID per user
CREATE SEQUENCE IF NOT EXISTS player_number_seq START 1001;
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS player_number INTEGER UNIQUE DEFAULT nextval('player_number_seq');
-- Backfill any existing users
UPDATE public.users SET player_number = nextval('player_number_seq') WHERE player_number IS NULL;

-- 2. Alms requests board
CREATE TABLE IF NOT EXISTS public.alms_requests (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL REFERENCES public.users(id),
  gold_amount  integer NOT NULL CHECK (gold_amount > 0),
  message      text CHECK (char_length(message) <= 200),
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open','fulfilled','cancelled')),
  fulfilled_by uuid REFERENCES public.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.alms_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read alms requests"        ON public.alms_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated can post alms request"  ON public.alms_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
-- Updates (fulfill/cancel) go through admin client in API routes
