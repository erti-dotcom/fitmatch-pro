import React, { useState } from 'react';
import { UserProfile, SportType, SkillLevel } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Activity, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
             console.error("Profil Fehler:", profileError);
             throw new Error(`Login erfolgreich, aber Profil nicht gefunden. Eventuell wurde die Datenbank zurückgesetzt? Bitte neu registrieren.`);
          } else {
             onLogin(profile as UserProfile);
          }
        }

      } else {
        // --- REGISTRIERUNG ---
        if (!name || !email || !password) {
          setError('Bitte alle Felder ausfüllen.');
          setLoading(false);
          return;
        }

        // 1. User erstellen
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // 2. Profil Eintrag erstellen (Upsert statt Insert für Stabilität)
          const newUserProfile: UserProfile = {
            id: data.user.id,
            email: email,
            name: name,
            age: 25, 
            location: '',
            bio: 'Ich bin neu bei FitMatch!',
            sports: [],
            level: SkillLevel.BEGINNER,
            frequency: 0,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([newUserProfile]); // Upsert repariert auch halb-kaputte Accounts

          if (profileError) {
             console.error("DB Error:", profileError);
             
             if (profileError.code === "42P01") {
                 throw new Error("Fehler: Datenbank-Tabelle fehlt. Bitte SQL Script in Supabase ausführen!");
             }
             if (profileError.message.includes("row-level security")) {
                 throw new Error("Fehler: Berechtigung verweigert. WICHTIG: Hast du in Supabase unter Authentication -> Providers -> Email 'Confirm Email' deaktiviert?");
             }
             throw new Error(`Profil konnte nicht gespeichert werden: ${profileError.message}`);
          }

          onLogin(newUserProfile);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/50">
              <Activity size={32} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">
            {isLogin ? 'Willkommen zurück!' : 'Werde Teil des Teams'}
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            {isLogin ? 'Finde deinen nächsten Trainingspartner.' : 'Erstelle deinen kostenlosen Account.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Dein Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="E-Mail Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-lg text-center break-words">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Einloggen' : 'Account erstellen'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gray-900/50 p-4 text-center border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Noch keinen Account?' : 'Bereits registriert?'}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              {isLogin ? 'Jetzt registrieren' : 'Hier einloggen'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};