/*
  # Add Usage Metrics Table

  1. New Tables
    - `usage_metrics`: Tracks user usage data
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text): Type of usage (audio_analysis, chat_question)
      - `audio_minutes` (integer): Duration of audio processed
      - `file_size` (bigint): Size of processed file in bytes
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `usage_metrics` table
    - Add policies for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type text NOT NULL,
  audio_minutes integer,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own usage metrics"
  ON usage_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own usage metrics"
  ON usage_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);