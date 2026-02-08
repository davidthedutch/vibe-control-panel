-- Migration: Project Settings Storage
-- Description: Add table for storing project settings, design tokens, policies, etc.
-- Created: 2026-02-08

-- Create project_settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_project_settings_project_id ON project_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_project_settings_updated_at ON project_settings(updated_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read settings
CREATE POLICY "Allow authenticated read access to project_settings"
  ON project_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow all authenticated users to insert settings
CREATE POLICY "Allow authenticated insert access to project_settings"
  ON project_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow all authenticated users to update settings
CREATE POLICY "Allow authenticated update access to project_settings"
  ON project_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow all authenticated users to delete settings
CREATE POLICY "Allow authenticated delete access to project_settings"
  ON project_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_project_settings_updated_at_trigger
  BEFORE UPDATE ON project_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_project_settings_updated_at();

-- Insert default settings for the default project
INSERT INTO project_settings (project_id, settings)
VALUES (
  'default',
  '{
    "project": {
      "name": "Vibe Control Panel",
      "description": "Een dashboard voor het beheren van vibe-coded websites.",
      "status": "in_development",
      "urls": {
        "production": "",
        "staging": "",
        "development": "http://localhost:3000"
      },
      "techStack": {
        "framework": "Next.js 15",
        "styling": "Tailwind CSS 4",
        "database": "Supabase",
        "auth": "Clerk",
        "deployment": "Vercel"
      }
    },
    "tokens": {
      "colors": [],
      "fonts": [],
      "fontSizes": [],
      "spacing": []
    },
    "policies": [],
    "secrets": [],
    "integrations": {
      "integrations": []
    }
  }'::jsonb
)
ON CONFLICT (project_id) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE project_settings IS 'Stores project configuration, design tokens, policies, and other settings';
COMMENT ON COLUMN project_settings.project_id IS 'Unique identifier for the project';
COMMENT ON COLUMN project_settings.settings IS 'JSON object containing all project settings';
COMMENT ON COLUMN project_settings.created_at IS 'Timestamp when the settings were first created';
COMMENT ON COLUMN project_settings.updated_at IS 'Timestamp when the settings were last updated';
