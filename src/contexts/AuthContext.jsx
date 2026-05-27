import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserHighScore(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserHighScore(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserHighScore = async (userId) => {
    const { data: scoreData, error } = await supabase
      .from('scores')
      .select('high_score')
      .eq('user_id', userId)
      .single();

    if (!error && scoreData) {
      setHighScore(scoreData.high_score);
    } else if (error && error.code === 'PGRST116') {
      // No record found, create one
      const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player';
      await supabase
        .from('scores')
        .insert([{ user_id: userId, high_score: 0, username: username }]);
      setHighScore(0);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success('Logged in successfully!');
    return true;
  };

  const register = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    // Create scores entry for the new user
    if (data.user) {
      const { error: insertError } = await supabase
        .from('scores')
        .insert([{
          user_id: data.user.id,
          high_score: 0,
          username: username
        }]);

      if (insertError) {
        console.error('Error creating scores entry:', insertError);
      }
    }

    toast.success('Registered successfully! Please check your email for verification.');
    return true;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged out successfully!');
      setHighScore(0);
    }
  };

  const updateHighScore = async (newScore) => {
    if (!user) return;

    if (newScore > highScore) {
      setHighScore(newScore);
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';

      const { error } = await supabase
        .from('scores')
        .upsert({
          user_id: user.id,
          high_score: newScore,
          username: username,
          updated_at: new Date()
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving score:', error);
        toast.error('Failed to save high score');
      } else {
        toast.success('New high score! 🎉');
      }
    }
  };

  const value = {
    user,
    loading,
    highScore,
    login,
    register,
    logout,
    updateHighScore
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};