import React, { useState } from 'react';
import { UserProfile, SkillLevel } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Activity, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // --- PASSWORT ZURÜCKSETZEN ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Leitet nach Klick in der Email zurück zur App
      });
      if (error) throw error;
      setSuccessMsg('Falls ein Account existiert, wurde eine E-Mail gesendet.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIN & REGISTRIERUNG ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (view === 'login') {
        // 1. Login Versuch
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (data.user) {
          // 2. Profil laden
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
             console.error("Profil Fehler:", profileError);
             throw new Error(`Login erfolgreich, aber Profil nicht gefunden.`);
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

        // 1. User in Auth erstellen
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          // 2. Profil Eintrag in DB erstellen
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
            .upsert([newUserProfile]);

          if (profileError) {
             console.error("DB Error:", profileError);
             // Spezifische Fehlermeldungen für den User übersetzen
             const msg = profileError.message.toLowerCase();
             
             if (profileError.code === "42P01") {
                 throw new Error("System-Fehler: Datenbank-Tabelle fehlt.");
             }
             if (msg.includes("row-level security") || msg.includes("policy")) {
                 throw new Error("Registrierung blockiert. Bitte in Supabase 'Confirm Email' deaktivieren.");
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
            {view === 'login' ? 'Willkommen zurück!' : view === 'register' ? 'Werde Teil des Teams' : 'Passwort vergessen'}
          </h2>
          <p className="text-gray-400 text-center mb-8 text-sm">
            {view === 'login' ? 'Finde deinen nächsten Trainingspartner.' 
             : view === 'register' ? 'Erstelle deinen kostenlosen Account.'
             : 'Wir senden dir einen Link zum Zurücksetzen.'}
          </p>

          {/* --- RESET PASSWORD FORM --- */}
          {view === 'reset' ? (
             <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="email"
                    placeholder="E-Mail Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                {successMsg && <div className="text-green-400 text-sm text-center p-2 bg-green-900/20 rounded border border-green-800">{successMsg}</div>}
                {error && <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded border border-red-800">{error}</div>}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Sende...' : 'Link senden'}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}
                  className="w-full text-gray-400 text-sm py-2 flex items-center justify-center gap-1 hover:text-white"
                >
                  <ArrowLeft size={14} /> Zurück zum Login
                </button>
             </form>
          ) : (
            /* --- LOGIN / REGISTER FORM --- */
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && (
                <div className="relative animate-in fade-in slide-in-from-top-2">
                  <User className="absolute left-3 top-3 text-gray-500" size={20} />
                  <input
                    type="text"
                    placeholder="Dein Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all"
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
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {view === 'login' && (
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setView('reset')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Passwort vergessen?
                  </button>
                </div>
              )}

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
                    {view === 'login' ? 'Einloggen' : 'Account erstellen'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {view !== 'reset' && (
          <div className="bg-gray-900/50 p-4 text-center border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              {view === 'login' ? 'Noch keinen Account?' : 'Bereits registriert?'}
              <button
                onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }}
                className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                {view === 'login' ? 'Jetzt registrieren' : 'Hier einloggen'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};