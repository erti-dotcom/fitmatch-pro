import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
    Zap, 
    Trophy, 
    Flame, 
    TrendingUp, 
    Clock, 
    ArrowRight, 
    MessageCircle,
    Dumbbell,
    Calendar,
    History,
    Users
} from 'lucide-react';

interface DashboardProps {
    user: UserProfile;
    matches: UserProfile[];
    onOpenLogModal: () => void;
    onSwitchTab: (tab: any) => void;
}

const HOURLY_TIPS = [
    { title: "Morgen-Routine", text: "Trinke direkt nach dem Aufstehen 500ml Wasser mit einer Prise Salz für optimale Hydration vor dem Sport.", category: "Nutrition" },
    { title: "Pre-Workout Focus", text: "Visualisiere deine Trainingseinheit 5 Minuten bevor du startest. Das steigert die neuromuskuläre Leistung.", category: "Mindset" },
    { title: "Protein Timing", text: "Versuche innerhalb von 30-60 Minuten nach dem Training 20-30g Protein zu dir zu nehmen.", category: "Nutrition" },
    { title: "Active Recovery", text: "An Ruhetagen hilft leichtes Spazieren oder Yoga, den Cortisolspiegel zu senken.", category: "Recovery" },
    { title: "Schlaf-Optimierung", text: "Vermeide blaues Licht 1 Stunde vor dem Schlafen, um die Wachstumshormonausschüttung zu maximieren.", category: "Recovery" },
    { title: "Hyrox Tipp", text: "Übe die Transitions! Die Zeit zwischen den Stationen entscheidet oft über den Sieg.", category: "Training" },
    { title: "Lauftechnik", text: "Achte auf deine Schrittfrequenz. 170-180 Schritte pro Minute gelten als effizient und gelenkschonend.", category: "Training" },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, matches, onOpenLogModal, onSwitchTab }) => {
    const [currentTip, setCurrentTip] = useState(HOURLY_TIPS[0]);
    const [spotlightMatch, setSpotlightMatch] = useState<UserProfile | null>(null);

    useEffect(() => {
        const hour = new Date().getHours();
        const tipIndex = hour % HOURLY_TIPS.length;
        setCurrentTip(HOURLY_TIPS[tipIndex]);

        if (matches.length > 0) {
            const randomMatch = matches[Math.floor(Math.random() * matches.length)];
            setSpotlightMatch(randomMatch);
        }
    }, [matches]);

    // Use Real History if available, otherwise fallback
    const myHistory = user.activityHistory || [];
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Guten Morgen";
        if (hour < 18) return "Guten Tag";
        return "Guten Abend";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        {getGreeting()}, <span className="text-blue-500">{user.name.split(' ')[0]}</span>!
                    </h1>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 flex items-center gap-2 shadow-sm">
                    <Flame size={18} className={user.streak && user.streak > 0 ? "text-orange-500 animate-pulse" : "text-gray-600"} fill="currentColor" />
                    <span className="font-bold text-white">{user.streak || 0} Tage Streak</span>
                </div>
            </div>

            {/* AI TIP OF THE HOUR */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 border border-purple-700/50 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={120} />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-purple-500/20 text-purple-200 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Stündlicher Tipp
                        </span>
                        <span className="text-gray-400 text-xs uppercase tracking-wider">• {currentTip.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentTip.title}</h3>
                    <p className="text-purple-100 max-w-xl leading-relaxed">
                        "{currentTip.text}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* QUICK STATS & ACTIONS ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div 
                            onClick={onOpenLogModal}
                            className="bg-gray-800 p-5 rounded-2xl border border-gray-700 hover:border-blue-500 cursor-pointer transition-all group shadow-md"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-blue-900/30 rounded-lg group-hover:bg-blue-600 transition-colors">
                                    <Dumbbell className="text-blue-400 group-hover:text-white" size={24} />
                                </div>
                                <ArrowRight className="text-gray-600 group-hover:text-blue-400" size={18} />
                            </div>
                            <h3 className="font-bold text-white">Workout Loggen</h3>
                            <p className="text-xs text-gray-400 mt-1">Tracke deine Aktivität für heute</p>
                        </div>

                        <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-yellow-900/30 rounded-lg">
                                    <Trophy className="text-yellow-400" size={24} />
                                </div>
                            </div>
                            <h3 className="font-bold text-white">{user.level}</h3>
                            <p className="text-xs text-gray-400 mt-1">Aktuelles Level</p>
                        </div>
                    </div>

                    {/* SPOTLIGHT MATCH */}
                    {spotlightMatch && (
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Users size={18} className="text-blue-400" /> 
                                    Vorschlag für dich
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">98% Match</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <img 
                                    src={spotlightMatch.avatar} 
                                    alt={spotlightMatch.name} 
                                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-600"
                                />
                                <div className="flex-1">
                                    <h4 className="font-bold text-xl text-white">{spotlightMatch.name}</h4>
                                    <p className="text-gray-400 text-sm mb-2">{spotlightMatch.location} • {spotlightMatch.sports[0]}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onSwitchTab('chat')} 
                                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <MessageCircle size={14} /> Anschreiben
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN (1/3) */}
                <div className="space-y-6">
                    {/* ACTIVITY HISTORY */}
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 h-full">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <History size={16} /> Deine Aktivitäten
                        </h3>
                        
                        {myHistory.length > 0 ? (
                            <div className="space-y-4">
                                {myHistory.slice(0, 5).map((activity, idx) => (
                                    <div key={idx} className="flex gap-3 items-start border-l-2 border-gray-700 pl-3 pb-1 animate-in slide-in-from-right-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-200 font-bold">
                                                {activity.type}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {activity.duration} Min • {new Date(activity.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Noch keine Aktivitäten.</p>
                                <p className="text-xs mt-1">Logge dein erstes Workout!</p>
                            </div>
                        )}
                        
                        <div className="mt-6 pt-4 border-t border-gray-700">
                             <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Community Pulse</h4>
                             <div className="text-xs text-gray-400 space-y-2">
                                 <p>Sarah hat gerade <span className="text-white">Hyrox Training</span> beendet.</p>
                                 <p>Tom sucht einen <span className="text-white">Laufpartner</span> in München.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};