-- Tijdelijke opslag van winkelwagendata tijdens Stripe checkout
-- Wordt opgehaald door de webhook via stripe_session_id
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  cart_items       JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automatisch opruimen na 24 uur (optioneel, via pg_cron of handmatig)
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_stripe ON public.checkout_sessions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_created ON public.checkout_sessions(created_at);

-- RLS
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role kan alles"
  ON public.checkout_sessions FOR ALL
  USING (true);
