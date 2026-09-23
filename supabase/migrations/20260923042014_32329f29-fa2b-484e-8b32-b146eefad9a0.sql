CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'video',
  category TEXT NOT NULL DEFAULT 'Cartoons',
  age_range TEXT NOT NULL DEFAULT '4-8',
  duration TEXT,
  thumbnail_url TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view videos" ON public.videos FOR SELECT USING (true);
CREATE POLICY "Anyone can add videos" ON public.videos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can edit videos" ON public.videos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can remove videos" ON public.videos FOR DELETE USING (true);

INSERT INTO public.videos (title, youtube_id, kind, category, age_range, duration) VALUES
('Baby Shark Dance', 'XqZsoesa55w', 'cartoon', 'Cartoons', '2-4', '2:17'),
('Wheels on the Bus', 'e_04ZrNroTo', 'cartoon', 'Cartoons', '2-4', '3:22'),
('Peppa Pig Playtime', 'UxXH6mdRdmM', 'cartoon', 'Cartoons', '4-8', '10:05'),
('Learn Colors with Blocks', 'qhSjLc3Sxvs', 'video', 'Learning', '2-4', '5:12'),
('ABC Phonics Song', 'BELlZKpi1Zs', 'video', 'Learning', '2-4', '4:40'),
('Counting 1 to 20', 'D0Ajq682yrA', 'video', 'Learning', '4-8', '6:18'),
('Five Little Ducks', 'pZw9veQ76fo', 'short', 'Shorts', '2-4', '0:45'),
('Dino Dance Party', 'Myc0nJ5Vvqg', 'short', 'Shorts', '4-8', '0:38'),
('Twinkle Twinkle Short', 'yCjJyiqpAuU', 'short', 'Shorts', '2-4', '0:52'),
('Live Storytime Corner', '21X5lGlDOfg', 'live', 'Live', '4-8', 'LIVE'),
('Live Nursery Rhymes', 'jjtLLVrVqFY', 'live', 'Live', '2-4', 'LIVE'),
('Bedtime Lullabies', 'S5UmDAs-05c', 'video', 'Stories', '2-4', '30:00');