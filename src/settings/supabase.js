import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://riiivtteehdejjcxvyau.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaWl2dHRlZWhkZWpqY3h2eWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgyNDA3NjAsImV4cCI6MjAzMzgxNjc2MH0.JH-AYOgZXvVZ71Wv-JZ2h5ajeRsk_pF3-DRWPPawGO4';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;