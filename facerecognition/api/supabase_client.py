# supabase_client.py
from supabase import create_client, Client

# Your Supabase credentials
url = 'https://riiivtteehdejjcxvyau.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaWl2dHRlZWhkZWpqY3h2eWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgyNDA3NjAsImV4cCI6MjAzMzgxNjc2MH0.JH-AYOgZXvVZ71Wv-JZ2h5ajeRsk_pF3-DRWPPawGO4'

supabase: Client = create_client(url, key)