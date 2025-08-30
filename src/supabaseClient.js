import { createClient } from '@supabase/supabase-js'

// ⬇️ Replace these with your actual project credentials
const supabaseUrl = "https://jbabtowqlbqvksenhgqt.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYWJ0b3dxbGJxdmtzZW5oZ3F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzY0NTIsImV4cCI6MjA3MTI1MjQ1Mn0.g8lDvFGt4MeWgHnegX5VFgl1UaNFa313AvZcNGLHkyU"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)