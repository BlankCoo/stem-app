import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qqlvruflljwfnxpqqysx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbHZydWZsbGp3Zm54cHFxeXN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTU4NzUsImV4cCI6MjA4OTU5MTg3NX0.sP1Cu7Xp6EoiZb830g5sWhUPj6Cd3mVo-a5aHFWUJHA'

export const supabase = createClient(supabaseUrl, supabaseKey)