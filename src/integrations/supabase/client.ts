// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yodkmdkcvvpoxbkgxwez.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvZGttZGtjdnZwb3hia2d4d2V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNjIwMDMsImV4cCI6MjA1MDgzODAwM30.OPn-w0gLdptVpF-mawzJAZsvEHkxW7FaKu04gdN6mXQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);