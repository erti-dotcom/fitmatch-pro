import React, { useState, useEffect } from 'react';
import { UserProfile, SportType, SkillLevel, ChatMessage, ActivityLog } from './types';
import { MOCK_USERS, INITIAL_CHAT_MESSAGES } from './constants';
import { supabase } from './lib/supabaseClient';
import { MatchCard } from './components/MatchCard';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { getTrainingPlan } from './services/geminiService';
import { 
  Users, 
  MessageSquare, 
  UserCircle, 
  Activity, 
  Search,
  Send,
  Sparkles,
  LogOut,
  Camera,
  Filter,
  X,
  CheckCircle
} from 'lucide-react';

// Navigation Tabs
enum Tab {
  DASHBOARD = 'dashboard',
  MATCHES = 'matches',
  CHAT = 'chat',
  PROFILE = 'profile',
  AI_COACH = 'ai_coach'
}

const App = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MATCHES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [selectedChatPartner, setSelectedChatPartner] = useState<string | null>(null);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSport, setFilterSport] = useState<SportType | 'ALL'>('ALL');
  
  // Workout Logging Modal
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [logActivity, setLogActivity] = useState('Gym');
  const [logDuration, setLogDuration] = useState('60');

  // Form Inputs (Profile Editing)
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('25');
  const [locationInput, setLocationInput] = useState('');
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [bioInput, setBioInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Chat Input
  const [chatInput, setChatInput] = useState('');
  
  // AI Coach
  const [coachGoal, setCoachGoal] = useState('');
  const [coachPlan, setCoachPlan] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const checkSession = async () => {
      setAuthLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch full profile from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
            let userProfile = profile as UserProfile;
            
            // --- MERGE LOCAL STORAGE STATS ---
            // We use localStorage to persist Stats without needing complex DB migrations for now
            const localStatsStr = localStorage.getItem(`fitmatch_stats_${userProfile.id}`);
            if (localStatsStr) {
                const localStats = JSON.parse(localStatsStr);
                userProfile = { ...userProfile, ...localStats };
            }

            setCurrentUser(userProfile);
            // Pre-fill form
            setNameInput(userProfile.name);
            setAgeInput(userProfile.age.toString());
            setLocationInput(userProfile.location || '');
            setBioInput(userProfile.bio || '');
            setSelectedSports(userProfile.sports || []);
            setAvatarUrl(userProfile.avatar);
            setActiveTab(Tab.DASHBOARD);
        }
      }
      setAuthLoading(false);
    };

    checkSession();

    // Fetch other users
    const fetchUsers = async () => {
        const { data: profiles } = await supabase.from('profiles').select('*');
        if (profiles) {
            setUsers(profiles.length > 1 ? profiles as UserProfile[] : MOCK_USERS);
        }
    };
    fetchUsers();

  }, []);

  // --- HANDLERS ---

  const handleLogin = (user: UserProfile) => {
    // Check for local stats on login
    const localStatsStr = localStorage.getItem(`fitmatch_stats_${user.id}`);
    let fullUser = user;
    if (localStatsStr) {
        fullUser = { ...user, ...JSON.parse(localStatsStr) };
    }

    setCurrentUser(fullUser);
    setNameInput(user.name);
    setAgeInput(user.age.toString());
    setLocationInput(user.location || '');
    setBioInput(user.bio || '');
    setSelectedSports(user.sports || []);
    setAvatarUrl(user.avatar);
    
    if (!user.sports || user.sports.length === 0) {
        setIsEditingProfile(true);
    } else {
        setActiveTab(Tab.MATCHES);
    }
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setActiveTab(Tab.MATCHES);
      setIsEditingProfile(false);
  };

  // --- WORKOUT LOGGING LOGIC ---
  const handleLogWorkout = () => {
      if (!currentUser) return;

      const newActivity: ActivityLog = {
          id: Date.now().toString(),
          type: logActivity,
          duration: parseInt(logDuration) || 0,
          date: new Date().toISOString()
      };

      // Calculate Streak
      let newStreak = (currentUser.streak || 0);
      const lastDate = currentUser.lastWorkout ? new Date(currentUser.lastWorkout) : null;
      const today = new Date();
      
      // Simple logic: if last workout was yesterday or today, keep streak. Else reset or inc.
      // For demo purposes, we just increment if it's a new day
      if (!lastDate || lastDate.getDate() !== today.getDate()) {
          newStreak += 1;
      }

      const updatedUser: UserProfile = {
          ...currentUser,
          streak: newStreak,
          lastWorkout: today.toISOString(),
          activityHistory: [newActivity, ...(currentUser.activityHistory || [])]
      };

      setCurrentUser(updatedUser);
      
      // Persist to Local Storage
      const statsToSave = {
          streak: updatedUser.streak,
          lastWorkout: updatedUser.lastWorkout,
          activityHistory: updatedUser.activityHistory
      };
      localStorage.setItem(`fitmatch_stats_${currentUser.id}`, JSON.stringify(statsToSave));

      setShowWorkoutModal(false);
  };

  // --- PROFILE LOGIC ---
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        const reader = new FileReader();
        reader.onload = (e) => { if(e.target?.result) setAvatarUrl(e.target.result as string); };
        reader.readAsDataURL(file);
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (data) setAvatarUrl(data.publicUrl);
    } catch (error) {
      alert('Fehler beim Upload!');
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    const updatedUser: UserProfile = {
      ...currentUser,
      name: nameInput,
      age: parseInt(ageInput) || 25,
      location: locationInput,
      bio: bioInput,
      sports: selectedSports,
      level: currentUser.level || SkillLevel.INTERMEDIATE,
      frequency: currentUser.frequency || 3,
      avatar: avatarUrl || currentUser.avatar 
    };

    const { error } = await supabase.from('profiles').update({
            name: updatedUser.name,
            age: updatedUser.age,
            location: updatedUser.location,
            bio: updatedUser.bio,
            sports: updatedUser.sports,
            avatar: updatedUser.avatar
        }).eq('id', currentUser.id);

    if (!error) {
        setCurrentUser(updatedUser);
        setIsEditingProfile(false);
        setActiveTab(Tab.MATCHES);
    }
  };

  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  // --- OTHERS ---
  const handleStartChat = (id: string) => {
    setSelectedChatPartner(id);
    setActiveTab(Tab.CHAT);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !currentUser || !selectedChatPartner) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: chatInput,
      timestamp: Date.now()
    };
    setMessages([...messages, newMsg]);
    setChatInput('');
  };
  
  const handleGeneratePlan = async () => {
      if(!currentUser) return;
      setCoachLoading(true);
      const plan = await getTrainingPlan(currentUser, coachGoal);
      setCoachPlan(plan);
      setCoachLoading(false);
  }

  const filteredUsers = users.filter(u => {
      if (u.id === currentUser?.id) return false;
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = filterSport === 'ALL' || u.sports.includes(filterSport);
      return matchesSearch && matchesSport;
  });

  // --- RENDER ---
  if (authLoading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Lade App...</div>;
  if (!currentUser) return <AuthScreen onLogin={handleLogin} />;

  // EDIT PROFILE
  if (isEditingProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6 relative group">
            <div className="relative cursor-pointer">
                <img src={avatarUrl || currentUser.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 group-hover:border-blue-500 transition-all"/>
                <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 shadow-lg">
                    <Camera size={16} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">Dein Profil</h1>
          <div className="space-y-4">
            <div><label className="text-gray-400 text-sm">Name</label><input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm">Alter</label><input type="number" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" /></div>
                <div><label className="text-gray-400 text-sm">Stadt</label><input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white" /></div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2">Sportarten</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(SportType).map(sport => (
                  <button key={sport} onClick={() => toggleSport(sport)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedSports.includes(sport) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}>{sport}</button>
                ))}
              </div>
            </div>
            <div><label className="text-gray-400 text-sm">Bio</label><textarea value={bioInput} onChange={(e) => setBioInput(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white h-24 text-sm" /></div>
            <button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4">Speichern</button>
            <button onClick={() => setIsEditingProfile(false)} className="w-full text-gray-400 text-sm py-2 hover:text-white">Abbrechen</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex text-gray-100 font-sans relative">
      
      {/* WORKOUT MODAL OVERLAY */}
      {showWorkoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl scale-100">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="text-blue-500"/> Workout Loggen</h3>
                      <button onClick={() => setShowWorkoutModal(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Aktivität</label>
                          <select 
                            value={logActivity}
                            onChange={(e) => setLogActivity(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                          >
                              {Object.values(SportType).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Dauer (Minuten)</label>
                          <input 
                            type="number" 
                            value={logDuration}
                            onChange={(e) => setLogDuration(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                          />
                      </div>
                      <button 
                        onClick={handleLogWorkout}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-2"
                      >
                          <CheckCircle size={18}/> Speichern
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* SIDEBAR */}
      <nav className="w-20 md:w-64 bg-gray-800 border-r border-gray-700 flex flex-col items-center md:items-start py-6 flex-shrink-0 sticky top-0 h-screen">
        <div className="mb-8 px-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><Activity className="text-white" size={24} /></div>
          <span className="hidden md:block text-xl font-bold tracking-tight">FitMatch</span>
        </div>
        <div className="space-y-2 w-full px-2">
          <NavButton active={activeTab === Tab.DASHBOARD} onClick={() => setActiveTab(Tab.DASHBOARD)} icon={<Activity size={20} />} label="Dashboard" />
          <NavButton active={activeTab === Tab.MATCHES} onClick={() => setActiveTab(Tab.MATCHES)} icon={<Users size={20} />} label="Matches Finden" />
          <NavButton active={activeTab === Tab.CHAT} onClick={() => setActiveTab(Tab.CHAT)} icon={<MessageSquare size={20} />} label="Nachrichten" />
          <NavButton active={activeTab === Tab.AI_COACH} onClick={() => setActiveTab(Tab.AI_COACH)} icon={<Sparkles size={20} />} label="AI Coach" />
          <NavButton active={activeTab === Tab.PROFILE} onClick={() => setIsEditingProfile(true)} icon={<UserCircle size={20} />} label="Mein Profil" />
        </div>
        <div className="mt-auto px-4 w-full space-y-4">
            <div className="hidden md:flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                <img src={currentUser.avatar} alt="Me" className="w-8 h-8 rounded-full bg-gray-600 object-cover" />
                <div className="overflow-hidden"><p className="text-sm font-bold truncate">{currentUser.name}</p></div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors"><LogOut size={20} /><span className="hidden md:block font-medium">Ausloggen</span></button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-white capitalize">{activeTab.replace('_', ' ')}</h2>
            {activeTab === Tab.MATCHES && (
                <div className="flex gap-2 w-full md:w-auto">
                     <div className="relative flex-1 md:flex-initial">
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Suchen..." className="bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 w-full md:w-64" />
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                     </div>
                     <div className="relative">
                        <select value={filterSport} onChange={(e) => setFilterSport(e.target.value as SportType | 'ALL')} className="bg-gray-800 border border-gray-700 rounded-full py-2 pl-4 pr-8 text-sm text-gray-300 appearance-none cursor-pointer">
                            <option value="ALL">Alle</option>
                            {Object.values(SportType).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Filter className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={16} />
                     </div>
                </div>
            )}
        </header>

        {activeTab === Tab.DASHBOARD && (
            <Dashboard 
                user={currentUser} 
                matches={users.filter(u => u.id !== currentUser?.id)} 
                onOpenLogModal={() => setShowWorkoutModal(true)}
                onSwitchTab={setActiveTab}
            />
        )}

        {/* MATCHES LIST */}
        {activeTab === Tab.MATCHES && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
            {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <MatchCard key={user.id} currentUser={currentUser} candidate={user} onConnect={() => alert('Angefragt!')} onChat={handleStartChat} />
                ))
            ) : (
                <div className="col-span-3 text-center text-gray-500 p-12">Keine Sportler gefunden.</div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === Tab.CHAT && (
          <div className="bg-gray-800 rounded-2xl h-[calc(100vh-160px)] flex border border-gray-700 overflow-hidden shadow-2xl">
             <div className="w-1/3 border-r border-gray-700 bg-gray-800/50 flex flex-col">
                 <div className="p-4 border-b border-gray-700 font-bold text-gray-400 text-sm">CHATS</div>
                 <div className="overflow-y-auto flex-1">
                    {users.filter(u => u.id !== currentUser?.id).map(u => (
                        <div key={u.id} onClick={() => setSelectedChatPartner(u.id)} className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 ${selectedChatPartner === u.id ? 'bg-blue-900/20 border-r-2 border-blue-500' : ''}`}>
                            <img src={u.avatar} className="w-10 h-10 rounded-full object-cover" />
                            <div><h4 className="font-bold text-gray-200">{u.name}</h4><p className="text-xs text-gray-500 truncate">...</p></div>
                        </div>
                    ))}
                 </div>
             </div>
             <div className="flex-1 flex flex-col bg-gray-900/50">
                 {selectedChatPartner ? (
                    <>
                         <div className="p-4 border-b border-gray-700"><h3 className="font-bold text-lg text-white">{users.find(u => u.id === selectedChatPartner)?.name}</h3></div>
                         <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.filter(m => (m.senderId === currentUser.id && m.senderId === selectedChatPartner) || (m.senderId === selectedChatPartner) || (m.senderId === currentUser.id && selectedChatPartner)).map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>{msg.text}</div>
                                </div>
                            ))}
                         </div>
                         <div className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
                             <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="flex-1 bg-gray-700 rounded-full px-4 py-2 text-white" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                             <button onClick={handleSendMessage} className="bg-blue-600 p-2 rounded-full hover:bg-blue-500"><Send size={20} className="text-white" /></button>
                         </div>
                    </>
                 ) : <div className="flex-1 flex items-center justify-center text-gray-500">Wähle einen Chat</div>}
             </div>
          </div>
        )}

        {/* AI COACH TAB */}
        {activeTab === Tab.AI_COACH && (
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                 <div className="text-center mb-8"><Sparkles size={32} className="text-purple-400 mx-auto mb-4" /><h2 className="text-2xl font-bold text-white mb-2">AI Coach</h2></div>
                 <div className="space-y-4">
                     <input type="text" value={coachGoal} onChange={(e) => setCoachGoal(e.target.value)} placeholder="Ziel eingeben..." className="w-full bg-gray-700 border border-gray-600 rounded-xl p-4 text-white" />
                     <button onClick={handleGeneratePlan} disabled={coachLoading || !coachGoal} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2">{coachLoading ? <Activity className="animate-spin" /> : 'Generieren'}</button>
                 </div>
                 {coachPlan && <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-700 prose prose-invert max-w-none text-gray-300 whitespace-pre-line">{coachPlan}</div>}
            </div>
        )}

      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>{icon}<span className="hidden md:block font-medium">{label}</span></button>
);

export default App;