
// This file will be used to set up and export the Supabase client
// When connected to Supabase, this would contain the client initialization

/*
// Example usage with real Supabase integration:
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication helpers
export const signUp = async (email: string, password: string, username: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
};

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return supabase.auth.getUser();
};
*/

// Mock implementation until Supabase is connected
export const signUp = async (email: string, password: string, username: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Store in localStorage for demo purposes
  localStorage.setItem('spotItAccount', JSON.stringify({
    email,
    username,
    id: `user-${Date.now()}`
  }));
  
  return { data: { user: { email, username } }, error: null };
};

export const signIn = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if user exists in localStorage (simulating auth)
  const savedAccount = localStorage.getItem('spotItAccount');
  if (!savedAccount) {
    return { data: null, error: { message: 'User not found' } };
  }
  
  return { data: { user: JSON.parse(savedAccount) }, error: null };
};

export const signOut = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Remove from localStorage
  localStorage.removeItem('spotItAccount');
  
  return { error: null };
};

export const getCurrentUser = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get from localStorage
  const savedAccount = localStorage.getItem('spotItAccount');
  if (!savedAccount) {
    return { data: { user: null }, error: null };
  }
  
  return { data: { user: JSON.parse(savedAccount) }, error: null };
};
