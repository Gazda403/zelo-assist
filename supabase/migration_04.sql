-- Migration 04: Add Knowledge Base System
-- Allows bots to store brand info, policies, FAQs for automated Q&A responses

CREATE TABLE IF NOT EXISTS bot_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('brand', 'policy', 'faq', 'product')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bot_kb_bot_id ON bot_knowledge_base(bot_id);
CREATE INDEX idx_bot_kb_category ON bot_knowledge_base(category);
CREATE INDEX idx_bot_kb_enabled ON bot_knowledge_base(enabled) WHERE enabled = true;

-- Enable Row Level Security
ALTER TABLE bot_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access KB entries for their own bots
CREATE POLICY "Users can manage their own bot knowledge base"
  ON bot_knowledge_base
  FOR ALL
  USING (
    bot_id IN (
      SELECT id FROM bots WHERE user_id = auth.uid()::text
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bot_kb_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER bot_kb_updated_at
  BEFORE UPDATE ON bot_knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_bot_kb_updated_at();
