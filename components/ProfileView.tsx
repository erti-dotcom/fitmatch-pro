import React from 'react';
import { UserProfile, ActivityLog, SportType } from '../types';
import { MapPin, Calendar, Edit2, Settings, Award } from 'lucide-react';

interface ProfileViewProps {
    user: UserProfile;
    isOwnProfile: boolean;
    onEdit: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, isOwnProfile, onEdit }) => {
    
    // Calculate simple stats
    const totalWorkouts = user.activityHistory?.length || 0;
    const totalMinutes = user.activityHistory?.reduce((acc, curr) => acc + curr.duration, 0) || 0;
    const favoriteSport = user.sports.length > 0 ? user.sports[0] : 'Keiner';

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Header Section */}
            <div className="bg-gray-800 rounded-b-2xl md:rounded-2xl p-6 border-b md:border border-gray-700 shadow-xl mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500">
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-gray-800" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded-full border border-gray-700">
                            {user.level}
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                <p className="text-blue-400 flex items-center justify-center md:justify-start gap-1 text-sm">
                                    <MapPin size={14} /> {user.location || 'Kein Ort'}
                                </p>
                            </div>
                            {isOwnProfile && (
                                <button 
                                    onClick={onEdit}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Settings size={16} /> Profil bearbeiten
                                </button>
                            )}
                        </div>

                        {/* Social Counts */}
                        <div className="flex justify-center md:justify-start gap-8 border-t border-b border-gray-700 py-3 mb-4">
                            <div className="text-center">
                                <span className="block font-bold text-white text-lg">{totalWorkouts}</span>
                                <span className="text-gray-400 text-xs uppercase tracking-wide">Workouts</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-white text-lg">{user.followers?.length || 12}</span>
                                <span className="text-gray-400 text-xs uppercase tracking-wide">Follower</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-white text-lg">{user.friends?.length || 0}</span>
                                <span className="text-gray-400 text-xs uppercase tracking-wide">Folgt</span>
                            </div>
                        </div>

                        <p className="text-gray-300 text-sm max-w-md mx-auto md:mx-0">
                            {user.bio || "Keine Biographie angegeben."}
                        </p>
                    </div>
                </div>

                {/* Sports Badges */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.sports.map(sport => (
                        <span key={sport} className="bg-blue-900/30 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                            {sport}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Tabs (Grid vs List - Simplified to just List for now) */}
            <div className="flex items-center gap-4 px-4 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar size={18} /> Historie
                </h3>
            </div>

            {/* Profile Feed */}
            <div className="space-y-4 px-2 md:px-0">
                {user.activityHistory && user.activityHistory.length > 0 ? (
                    user.activityHistory.map((activity) => (
                        <div key={activity.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">
                                {activity.type === SportType.RUNNING ? '🏃' : 
                                 activity.type === SportType.CYCLING ? '🚴' : 
                                 activity.type === SportType.GYM ? '💪' : '🔥'}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white">{activity.type}</h4>
                                <p className="text-gray-400 text-xs">{new Date(activity.date).toLocaleDateString()} • {activity.duration} Min</p>
                            </div>
                            {activity.distance && (
                                <div className="text-right">
                                    <span className="block font-bold text-white">{activity.distance} km</span>
                                    <span className="text-xs text-gray-500">Distanz</span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <Award size={48} className="mx-auto mb-2 opacity-20" />
                        Noch keine Aktivitäten.
                    </div>
                )}
            </div>
        </div>
    );
};