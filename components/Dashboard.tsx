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
    Calendar
} from 'lucide-react';

interface DashboardProps {
    user: UserProfile;
    matches: UserProfile[];
}

// Statische Tipps, die sich stündlich ändern
const HOURLY_TIPS = [
    { title: "Morgen-Routine", text: "Trinke direkt nach dem Aufstehen 500ml Wasser mit einer Prise Salz für optimale Hydration vor dem Sport.", category: "Nutrition" },
    { title: "Pre-Workout Focus", text: "Visualisiere deine Trainingseinheit 5 Minuten bevor du startest. Das steigert die neuromuskuläre Leistung.", category: "Mindset" },
    { title: "Protein Timing", text: "Versuche innerhalb von 30-60 Minuten nach dem Training 20-30g Protein zu dir zu nehmen.", category: "Nutrition" },
    { title: "Active Recovery", text: "An Ruhetagen hilft leichtes Spazieren oder Yoga, den Cortisolspiegel zu senken.", category: "Recovery" },
    { title: "Schlaf-Optimierung", text: "Vermeide blaues Licht 1 Stunde vor dem Schlafen, um die Wachstumshormonausschüttung zu maximieren.", category: "Recovery" },
    { title: "Hyrox Tipp", text: "Übe die Transitions! Die Zeit zwischen den Stationen entscheidet oft über den Sieg.", category: "Training" },
    { title: "Lauftechnik", text: "Achte auf deine Schrittfrequenz. 170-180 Schritte pro Minute gelten als effizient und gelenkschonend.", category: "Training" },
];

export const Dashboard: React.FC<DashboardProps> = ({ user, matches }) => {
    const [currentTip, setCurrentTip] = useState(HOURLY_TIPS[0]);
    const [spotlightMatch, setSpotlightMatch] = useState<UserProfile | null>(null);

    useEffect(() => {
        // Tipp basierend auf der Stunde auswählen
        const hour = new Date().getHours();
        const tipIndex = hour % HOURLY_TIPS.length;
        setCurrentTip(HOURLY_TIPS[tipIndex]);

        // Ein zufälliges "Spotlight Match" auswählen, falls Matches vorhanden sind
        if (matches.length > 0) {
            const randomMatch = matches[Math.floor(Math.random() * matches.length)];
            setSpotlightMatch(randomMatch);
        }
    }, [matches]);

    // Generiere ein paar Fake-Aktivitäten basierend auf den Matches
    const recentActivities = matches.slice(0, 3).map((m, i) => ({
        user: m.name,
        action: i === 0 ? "hat ein 10km Lauf beendet" : i === 1 ? "sucht einen Partner für Hyrox" : "hat sein Profil aktualisiert",
        time: `${i * 15 + 2} Min.`
    }));

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
                    <Flame size={18} className="text-orange-500" fill="currentColor" />
                    <span className="font-bold text-white">3 Tage Streak</span>
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
                    
                    {/* SPOTLIGHT MATCH */}
                    {spotlightMatch ? (
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Trophy size={18} className="text-yellow-500" /> 
                                    Match des Tages
                                </h3>
                                <span className="text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">98% Kompatibilität</span>
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
                                        <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                            <MessageCircle size={14} /> Anschreiben
                                        </button>
                                        <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                            Profil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 flex flex-col items-center justify-center text-center h-48">
                            <p className="text-gray-400">Noch keine Matches gefunden.</p>
                            <button className="text-blue-400 text-sm mt-2">Suche starten</button>
                        </div>
                    )}

                    {/* QUICK STATS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Dein Level</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-white">{user.level}</span>
                            </div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Frequenz</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-blue-400">{user.frequency}x</span>
                                <span className="text-xs text-gray-400 mb-1">/ Woche</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (1/3) */}
                <div className="space-y-6">
                    {/* COMMUNITY PULSE */}
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                            <TrendingUp size={16} /> Community Pulse
                        </h3>
                        <div className="space-y-4">
                            {recentActivities.map((activity, idx) => (
                                <div key={idx} className="flex gap-3 items-start border-l-2 border-gray-700 pl-3 pb-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-300">
                                            <span className="font-bold text-white">{activity.user}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">vor {activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 text-xs text-center text-gray-500 hover:text-white transition-colors">
                            Mehr Aktivitäten anzeigen
                        </button>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-200 transition-colors">
                                <span className="flex items-center gap-2"><Dumbbell size={16} className="text-blue-400"/> Workout loggen</span>
                                <ArrowRight size={14} className="text-gray-500"/>
                            </button>
                            <button className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-200 transition-colors">
                                <span className="flex items-center gap-2"><Trophy size={16} className="text-yellow-400"/> Ziel anpassen</span>
                                <ArrowRight size={14} className="text-gray-500"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};