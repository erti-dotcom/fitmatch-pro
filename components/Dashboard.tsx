import React, { useState, useEffect } from 'react';
import { UserProfile, DailyTip } from '../types';
import { getPersonalizedTip } from '../services/geminiService';
import { 
    Zap, 
    Trophy, 
    Flame, 
    Clock, 
    ArrowRight, 
    MessageCircle,
    Dumbbell,
    Calendar,
    Users,
    Sparkles
} from 'lucide-react';

interface DashboardProps {
    user: UserProfile;
    matches: UserProfile[];
    allUsers: UserProfile[];
    onOpenLogModal: () => void;
    onSwitchTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, matches, allUsers, onOpenLogModal, onSwitchTab }) => {
    const [currentTip, setCurrentTip] = useState<DailyTip | null>(null);
    const [loadingTip, setLoadingTip] = useState(false);
    const [spotlightMatch, setSpotlightMatch] = useState<UserProfile | null>(null);

    // Initial Load
    useEffect(() => {
        if (matches.length > 0) {
            const compatible = matches.filter(m => m.sports.some(s => user.sports.includes(s)));
            const pool = compatible.length > 0 ? compatible : matches;
            const randomMatch = pool[Math.floor(Math.random() * pool.length)];
            setSpotlightMatch(randomMatch);
        }
        loadNewTip();
    }, [user.id]); 

    const loadNewTip = async () => {
        setLoadingTip(true);
        const tip = await getPersonalizedTip(user);
        setCurrentTip(tip);
        setLoadingTip(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Guten Morgen";
        if (hour < 18) return "Guten Tag";
        return "Guten Abend";
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* HEADER & GREETING */}
            <div className="flex justify-between items-end px-4 md:px-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{getGreeting()}, {user.name.split(' ')[0]}!</h1>
                    <p className="text-gray-400 text-xs md:text-sm">Bereit für dein nächstes Training?</p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-900/20 px-3 py-1 rounded-full border border-orange-500/30 text-sm md:text-base">
                        <Flame size={16} fill="currentColor" />
                        <span>{user.streak || 0} Tage</span>
                    </div>
                </div>
            </div>

            {/* AI TIP CARD */}
            <div className="mx-4 md:mx-0 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-xl border border-blue-700/50">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-blue-300 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles size={12} /> Daily AI Coach
                    </div>
                    {loadingTip ? (
                        <div className="h-16 animate-pulse bg-white/10 rounded-lg"></div>
                    ) : (
                        <>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{currentTip?.title || "Bleib dran!"}</h3>
                            <p className="text-blue-100 text-xs md:text-sm leading-relaxed max-w-lg">{currentTip?.text || "Lade deinen täglichen Tipp..."}</p>
                        </>
                    )}
                </div>
            </div>

            {/* QUICK STATS - Responsive Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 px-4 md:px-0">
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-lg">
                    <Trophy className="text-yellow-500 mb-1 md:mb-2" size={20} />
                    <span className="text-xl md:text-2xl font-bold text-white">{user.activityHistory?.length || 0}</span>
                    <span className="text-[10px] md:text-xs text-gray-400 uppercase">Workouts</span>
                </div>
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-lg">
                    <Clock className="text-blue-500 mb-1 md:mb-2" size={20} />
                    <span className="text-xl md:text-2xl font-bold text-white">
                        {Math.round((user.activityHistory?.reduce((acc, curr) => acc + curr.duration, 0) || 0) / 60)}
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-400 uppercase">Stunden</span>
                </div>
                <div className="bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => onSwitchTab('friends')}>
                    <Users className="text-green-500 mb-1 md:mb-2" size={20} />
                    <span className="text-xl md:text-2xl font-bold text-white">{user.friends?.length || 0}</span>
                    <span className="text-[10px] md:text-xs text-gray-400 uppercase">Freunde</span>
                </div>
            </div>

            {/* MATCHING SPOTLIGHT */}
            {spotlightMatch && (
                <div className="mx-4 md:mx-0">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                            <Users size={18} className="text-blue-400" />
                            Vorschlag für dich
                        </h3>
                        <button onClick={() => onSwitchTab('discover')} className="text-xs text-blue-400 hover:text-white flex items-center gap-1">
                            Alle <ArrowRight size={14} />
                        </button>
                    </div>
                    
                    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center gap-3 md:gap-4 shadow-lg active:scale-95 transition-transform cursor-pointer" onClick={() => onSwitchTab('discover')}>
                        <img src={spotlightMatch.avatar} alt={spotlightMatch.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-gray-600" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate text-sm md:text-base">{spotlightMatch.name}</h4>
                            <p className="text-gray-400 text-xs truncate mb-1">{spotlightMatch.level} • {spotlightMatch.sports.slice(0, 2).join(', ')}</p>
                            <p className="text-gray-500 text-xs italic truncate">"{spotlightMatch.bio}"</p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-500 p-2.5 md:p-3 rounded-full text-white shadow-lg shadow-blue-900/50">
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* RECENT ACTIVITY */}
            <div className="px-4 md:px-0">
                <h3 className="text-base md:text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-purple-400" /> Letzte Aktivitäten
                </h3>
                <div className="space-y-3">
                    {user.activityHistory && user.activityHistory.length > 0 ? (
                        user.activityHistory.slice(0, 3).map((act) => (
                            <div key={act.id} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-700 p-2 rounded-lg text-lg">
                                        {act.type === 'Laufen' ? '🏃' : '💪'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-200 text-sm">{act.type}</p>
                                        <p className="text-gray-500 text-[10px] md:text-xs">{new Date(act.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-white font-bold text-sm">{act.duration} min</p>
                                    {act.distance && <p className="text-[10px] text-gray-500">{act.distance} km</p>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                            <p className="text-gray-500 text-xs">Noch keine Aktivitäten.</p>
                            <button onClick={onOpenLogModal} className="mt-2 text-blue-400 text-xs md:text-sm hover:underline">Erstes Workout loggen</button>
                        </div>
                    )}
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 px-4 md:px-0">
                <button 
                    onClick={onOpenLogModal}
                    className="bg-gray-800 active:bg-gray-700 border border-gray-700 p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                >
                    <div className="bg-green-900/20 p-2 md:p-3 rounded-full">
                        <Dumbbell className="text-green-500" size={20} />
                    </div>
                    <span className="font-bold text-xs md:text-sm text-gray-300">Workout Loggen</span>
                </button>
                <button 
                    onClick={() => onSwitchTab('discover')}
                    className="bg-gray-800 active:bg-gray-700 border border-gray-700 p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                >
                    <div className="bg-blue-900/20 p-2 md:p-3 rounded-full">
                        <Users className="text-blue-500" size={20} />
                    </div>
                    <span className="font-bold text-xs md:text-sm text-gray-300">Partner finden</span>
                </button>
            </div>
        </div>
    );
};